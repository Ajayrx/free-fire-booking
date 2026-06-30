import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, runTransaction, getDocs, query, where, Timestamp, serverTimestamp } from 'firebase/firestore';

class ReservationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

async function runTransactionWithRetry(db, callback, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await runTransaction(db, callback);
    } catch (err) {
      if (err instanceof ReservationError || err.status) {
        throw err;
      }
      const isAborted = err.code === 'aborted' || err.code === 'unavailable' || (err.message && err.message.toLowerCase().includes('contention'));
      if (isAborted && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 100));
        continue;
      }
      throw err;
    }
  }
}

export async function POST(req) {
  try {
    const payload = await req.json();
    const { playerName, whatsappNumber, senderUpiId, matchId, slots, reservationId, ownerToken } = payload;

    if (!matchId || !slots || slots.length === 0) {
      return NextResponse.json({ error: 'Missing match data' }, { status: 400 });
    }

    // 1. Prevent duplicate UTRs across pending or confirmed bookings
    if (senderUpiId && senderUpiId.trim() !== '') {
      const q = query(
        collection(db, 'bookings'),
        where('senderUpiId', '==', senderUpiId.trim())
      );
      const upiSnap = await getDocs(q);
      const activeDuplicate = upiSnap.docs.find(doc => {
        const st = doc.data().status;
        return st !== 'REJECTED' && st !== 'CANCELLED' && st !== 'EXPIRED';
      });
      if (activeDuplicate) {
        return NextResponse.json({ error: 'This UTR / Transaction ID has already been submitted.' }, { status: 400 });
      }
    }

    let customBookingId = '';

    const txResult = await runTransactionWithRetry(db, async (transaction) => {
      const nowMillis = Timestamp.now().toMillis();

      // Read reservation doc if provided
      let resRef = null;
      let resData = null;
      if (reservationId) {
        resRef = doc(db, 'reservations', reservationId);
        const resSnap = await transaction.get(resRef);
        if (resSnap.exists()) {
          resData = resSnap.data();
        }
      }

      // Verify ownership token if reservation exists
      if (resData) {
        if (ownerToken && resData.ownerToken && resData.ownerToken !== ownerToken) {
          throw new ReservationError('Ownership token mismatch.', 403);
        }
        if (resData.status === 'SUBMITTED') {
          // Idempotent return if already submitted
          return { idempotencySuccess: true, bookingId: resData.bookingId };
        }
        if (resData.expiresAt <= nowMillis) {
          // Auto release expired hold
          transaction.update(resRef, { status: 'EXPIRED', expiredAt: serverTimestamp() });
          for (const s of slots) {
            const sRef = doc(db, 'matches', matchId, 'slots', s.id.toString());
            const sSnap = await transaction.get(sRef);
            if (sSnap.exists() && sSnap.data().reservationId === reservationId) {
              transaction.update(sRef, { status: 'AVAILABLE', reservationId: null, hold_until: null });
            }
          }
          throw new ReservationError('Your reservation has expired. Please re-select your slots.', 410);
        }
      }

      // Read all slot documents
      const slotSnaps = [];
      for (const slot of slots) {
        const slotRef = doc(db, 'matches', matchId, 'slots', slot.id.toString());
        const slotSnap = await transaction.get(slotRef);
        slotSnaps.push({ slot, slotRef, slotSnap });
      }

      // Validate slot availability
      for (const { slot, slotSnap } of slotSnaps) {
        if (!slotSnap.exists()) {
          throw new ReservationError(`Slot ${slot.slotNumber} does not exist.`, 400);
        }
        const slotData = slotSnap.data();
        const isAvailable = slotData.status === 'AVAILABLE' || slotData.status === 'OPEN';
        const isStaleHold = slotData.status === 'HELD' && slotData.hold_until < nowMillis;
        const isOwnHold = slotData.status === 'HELD' && slotData.reservationId === reservationId && slotData.hold_until >= nowMillis;

        if (!isAvailable && !isStaleHold && !isOwnHold) {
          throw new ReservationError(`Slot ${slot.slotNumber} is already booked or reserved by another player.`, 409);
        }
      }

      // Generate custom booking ID: p2065 + 19 random numbers
      let random19 = '';
      for (let i = 0; i < 19; i++) {
        random19 += Math.floor(Math.random() * 10);
      }
      customBookingId = `p2065${random19}`;
      const bookingRef = doc(collection(db, 'bookings'), customBookingId);

      // Perform atomic writes inside transaction
      transaction.set(bookingRef, {
        playerName,
        whatsappNumber,
        senderUpiId: senderUpiId ? senderUpiId.trim() : '',
        matchId,
        reservationId: reservationId || null,
        slots: slots.map(s => ({
          slotId: s.id,
          slotNumber: s.slotNumber,
          freeFireUid: s.freeFireUid
        })),
        status: 'PENDING_VERIFICATION',
        createdAt: serverTimestamp()
      });

      if (resRef) {
        transaction.update(resRef, {
          status: 'SUBMITTED',
          submittedAt: serverTimestamp(),
          bookingId: customBookingId
        });
      }

      for (const { slot, slotRef } of slotSnaps) {
        transaction.update(slotRef, {
          status: 'PENDING_VERIFICATION',
          freeFireUid: slot.freeFireUid,
          bookingId: customBookingId,
          playerName,
          whatsappNumber,
          reservationId: null,
          hold_until: null
        });
      }

      return { idempotencySuccess: false, bookingId: customBookingId };
    });

    return NextResponse.json({ 
      success: true, 
      booking: { id: txResult.bookingId } 
    }, { status: 200 });

  } catch (error) {
    console.error('Booking API Error:', error);
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    return NextResponse.json({ error: message }, { status });
  }
}
