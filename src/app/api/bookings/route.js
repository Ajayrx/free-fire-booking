import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, writeBatch, getDoc } from 'firebase/firestore';

export async function POST(req) {
  try {
    const payload = await req.json();
    const { playerName, whatsappNumber, senderUpiId, matchId, slots } = payload;

    if (!matchId || !slots || slots.length === 0) {
      return NextResponse.json({ error: 'Missing match data' }, { status: 400 });
    }

    // Double check that the slots are still available
    for (const slot of slots) {
      const slotRef = doc(db, 'matches', matchId, 'slots', slot.id.toString());
      const slotSnap = await getDoc(slotRef);
      if (!slotSnap.exists() || slotSnap.data().status !== 'AVAILABLE') {
        return NextResponse.json({ error: `Slot ${slot.slotNumber} is no longer available.` }, { status: 400 });
      }
    }

    // Create the booking document
    const bookingRef = await addDoc(collection(db, 'bookings'), {
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

    // Update the slots via batch
    const batch = writeBatch(db);
    for (const slot of slots) {
      const slotRef = doc(db, 'matches', matchId, 'slots', slot.id.toString());
      batch.update(slotRef, {
        status: 'BOOKED',
        freeFireUid: slot.freeFireUid,
        bookingId: bookingRef.id,
        playerName,
        whatsappNumber
      });
    }
    
    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      booking: { id: bookingRef.id } 
    }, { status: 200 });

  } catch (error) {
    console.error('Booking API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
