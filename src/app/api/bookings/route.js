import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, runTransaction } from 'firebase/firestore';

export async function POST(req) {
  try {
    const payload = await req.json();
    const { playerName, whatsappNumber, senderUpiId, matchId, slots } = payload;

    if (!matchId || !slots || slots.length === 0) {
      return NextResponse.json({ error: 'Missing match data' }, { status: 400 });
    }

    let customBookingId = '';

    // Atomic transaction prevents double bookings when two users submit at the exact same time
    await runTransaction(db, async (transaction) => {
      // 1. All reads must execute first in a Firestore transaction
      const slotSnaps = [];
      for (const slot of slots) {
        const slotRef = doc(db, 'matches', matchId, 'slots', slot.id.toString());
        const slotSnap = await transaction.get(slotRef);
        slotSnaps.push({ slot, slotRef, slotSnap });
      }

      // 2. Validate availability
      for (const { slot, slotSnap } of slotSnaps) {
        if (!slotSnap.exists()) {
          throw new Error(`Slot ${slot.slotNumber} does not exist.`);
        }
        const slotData = slotSnap.data();
        if (slotData.status !== 'AVAILABLE' && slotData.status !== 'OPEN') {
          throw new Error(`Slot ${slot.slotNumber} is already booked or pending for another player.`);
        }
      }

      // 3. Generate custom booking ID: p2065 + 19 random numbers
      let random19 = '';
      for (let i = 0; i < 19; i++) {
        random19 += Math.floor(Math.random() * 10);
      }
      customBookingId = `p2065${random19}`;
      const bookingRef = doc(collection(db, 'bookings'), customBookingId);

      // 4. Perform atomic writes inside transaction
      transaction.set(bookingRef, {
        playerName,
        whatsappNumber,
        senderUpiId,
        matchId,
        slots: slots.map(s => ({
          slotId: s.id,
          slotNumber: s.slotNumber,
          freeFireUid: s.freeFireUid
        })),
        status: 'PENDING',
        createdAt: Date.now()
      });

      for (const { slot, slotRef } of slotSnaps) {
        transaction.update(slotRef, {
          status: 'PENDING',
          freeFireUid: slot.freeFireUid,
          bookingId: customBookingId,
          playerName,
          whatsappNumber
        });
      }
    });

    return NextResponse.json({ 
      success: true, 
      booking: { id: customBookingId } 
    }, { status: 200 });

  } catch (error) {
    console.error('Booking API Error:', error);
    if (error.message && (error.message.includes('already booked') || error.message.includes('does not exist'))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
