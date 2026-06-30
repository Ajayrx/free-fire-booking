import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, runTransaction, Timestamp, serverTimestamp } from 'firebase/firestore';
import { RESERVATION_TIMEOUT_MS, MAX_SLOTS_PER_USER } from '@/lib/constants';
import crypto from 'crypto';

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
    const { matchId, slot, existingReservationId, ownerToken } = payload;

    if (!matchId || !slot || !slot.id) {
      return NextResponse.json({ error: 'Missing match or slot data' }, { status: 400 });
    }

    const result = await runTransactionWithRetry(db, async (transaction) => {
      const nowMillis = Timestamp.now().toMillis();

      let reservationId = existingReservationId;
      let token = ownerToken;
      let expiresAt = nowMillis + RESERVATION_TIMEOUT_MS;
      let reservationRef = null;
      let existingSlots = [];

      // 1. If existing reservation passed, verify ownership and expiry
      if (reservationId && token) {
        reservationRef = doc(db, 'reservations', reservationId);
        const resSnap = await transaction.get(reservationRef);

        if (!resSnap.exists() || resSnap.data().status !== 'ACTIVE' || resSnap.data().expiresAt <= nowMillis) {
          // Expired or inactive hold; treat as starting a fresh reservation
          reservationId = null;
        } else if (resSnap.data().ownerToken !== token) {
          throw new ReservationError('Ownership token mismatch.', 403);
        } else {
          existingSlots = resSnap.data().slots || [];
          expiresAt = resSnap.data().expiresAt; // Retain original timer
        }
      }

      // 2. Create new reservation ID if none active
      if (!reservationId) {
        reservationId = 'res_' + crypto.randomUUID();
        token = 'own_' + crypto.randomUUID();
        reservationRef = doc(db, 'reservations', reservationId);
        expiresAt = nowMillis + RESERVATION_TIMEOUT_MS;
      }

      // 3. Read target slot
      const slotRef = doc(db, 'matches', matchId, 'slots', slot.id.toString());
      const slotSnap = await transaction.get(slotRef);

      if (!slotSnap.exists()) {
        throw new ReservationError('Slot does not exist.', 400);
      }

      const slotData = slotSnap.data();
      const isAvailable = slotData.status === 'AVAILABLE' || slotData.status === 'OPEN';
      const isStaleHold = slotData.status === 'HELD' && slotData.hold_until < nowMillis;
      const isOwnActiveHold = slotData.status === 'HELD' && slotData.reservationId === reservationId && slotData.hold_until >= nowMillis;

      if (!isAvailable && !isStaleHold && !isOwnActiveHold) {
        throw new ReservationError('Slot is already held by another player.', 409);
      }

      // 4. Idempotency check: if slot already added to this reservation
      if (isOwnActiveHold || existingSlots.some(s => s.id === slot.id)) {
        return { reservationId, ownerToken: token, hold_until: expiresAt };
      }

      if (existingSlots.length >= MAX_SLOTS_PER_USER) {
        throw new ReservationError(`You can select a maximum of ${MAX_SLOTS_PER_USER} slots.`, 400);
      }

      // 5. Perform writes
      const updatedSlots = [...existingSlots, { id: slot.id, slotNumber: slot.slotNumber }];

      if (existingSlots.length === 0) {
        transaction.set(reservationRef, {
          reservationId,
          ownerToken: token,
          matchId,
          slots: updatedSlots,
          status: 'ACTIVE',
          createdAt: serverTimestamp(),
          expiresAt
        });
      } else {
        transaction.update(reservationRef, {
          slots: updatedSlots
        });
      }

      // Write strictly public lock fields to slot document (never ownerToken!)
      transaction.update(slotRef, {
        status: 'HELD',
        reservationId,
        hold_until: expiresAt
      });

      return { reservationId, ownerToken: token, hold_until: expiresAt };
    });

    return NextResponse.json({
      success: true,
      reservationId: result.reservationId,
      ownerToken: result.ownerToken,
      hold_until: result.hold_until
    }, { status: 200 });

  } catch (error) {
    console.error('Reservation API Error:', error);
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    return NextResponse.json({ error: message }, { status });
  }
}
