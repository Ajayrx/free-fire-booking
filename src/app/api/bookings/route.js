import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';

export async function POST(req) {
  try {
    const data = await req.json();
    const { playerName, whatsappNumber, senderUpiId, matchId, slots } = data;

    if (!matchId || !slots || slots.length === 0) {
      return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 });
    }

    const characters = '0123456789';
    let randomPart = '';
    for (let i = 0; i < 17; i++) {
      randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const bookingId = `p20658${randomPart}`;
    const bookingRef = doc(db, 'bookings', bookingId);

    const batch = writeBatch(db);

    // Create the booking document
    batch.set(bookingRef, {
      matchId,
      playerName,
      whatsappNumber,
      senderUpiId,
      status: 'PENDING',
      slotIds: slots.map(s => s.id),
      slotNumbers: slots.map(s => s.slotNumber),
      createdAt: Date.now()
    });

    // Update the slot documents to PENDING
    for (const slot of slots) {
      const slotRef = doc(db, 'matches', matchId, 'slots', slot.id);
      batch.update(slotRef, {
        status: 'PENDING',
        freeFireUid: slot.freeFireUid,
        bookingId: bookingId
      });
    }

    await batch.commit();

    return NextResponse.json({ message: 'Booking successful', booking: { id: bookingId } }, { status: 201 });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
// Cache invalidation
