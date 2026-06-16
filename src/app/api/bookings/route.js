import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, writeBatch, getDoc, setDoc } from 'firebase/firestore';

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
      const slotData = slotSnap.data();
      if (!slotSnap.exists() || (slotData.status !== 'AVAILABLE' && slotData.status !== 'OPEN')) {
        return NextResponse.json({ error: `Slot ${slot.slotNumber} is no longer available.` }, { status: 400 });
      }
    }

    // Generate custom booking ID: p2065 + 19 random numbers
    let random19 = '';
    for (let i = 0; i < 19; i++) {
      random19 += Math.floor(Math.random() * 10);
    }
    const customBookingId = `p2065${random19}`;

    // Create the booking document
    const bookingRef = doc(collection(db, 'bookings'), customBookingId);
    await setDoc(bookingRef, {
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
        status: 'PENDING',
        freeFireUid: slot.freeFireUid,
        bookingId: customBookingId,
        playerName,
        whatsappNumber
      });
    }
    
    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      booking: { id: customBookingId } 
    }, { status: 200 });

  } catch (error) {
    console.error('Booking API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
