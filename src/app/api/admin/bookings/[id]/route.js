import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, writeBatch, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export async function PUT(req, props) {
  try {
    const params = await props.params;
    const { id } = params;
    const { status } = await req.json(); // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const bookingRef = doc(db, 'bookings', id);
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    const booking = bookingSnap.data();

    const batch = writeBatch(db);

    // Update Booking Status
    batch.update(bookingRef, { status });

    // Update Slots related to this booking
    for (const slotId of booking.slotIds) {
      const slotRef = doc(db, 'matches', booking.matchId, 'slots', slotId);
      if (status === 'APPROVED') {
        batch.update(slotRef, { status: 'BOOKED' });
      } else {
        // If rejected, clear data
        batch.update(slotRef, { status: 'AVAILABLE', freeFireUid: null, bookingId: null });
      }
    }

    await batch.commit();

    // After commit, check if we need to open the next match (if Match has >= 20 Booked slots)
    if (status === 'APPROVED') {
      const slotsRef = collection(db, 'matches', booking.matchId, 'slots');
      const slotsSnap = await getDocs(slotsRef);
      let bookedCount = 0;
      slotsSnap.forEach(s => {
        if (s.data().status === 'BOOKED') bookedCount++;
      });

      // Also check if match is completely full
      let availableCount = 0;
      slotsSnap.forEach(s => {
        if (s.data().status === 'AVAILABLE') availableCount++;
      });

      const matchRef = doc(db, 'matches', booking.matchId);
      if (availableCount === 0) {
        await updateDoc(matchRef, { status: 'FULL' });
      }

      // If >= 20 players, open next match!
      if (bookedCount >= 20) {
        // Find next match by matchNumber
        const matchSnap = await getDoc(matchRef);
        const currentMatchNumber = matchSnap.data().matchNumber;

        const nextMatchQ = query(
          collection(db, 'matches'),
          where('date', '==', matchSnap.data().date),
          where('matchNumber', '==', currentMatchNumber + 1),
          limit(1)
        );
        const nextMatchSnap = await getDocs(nextMatchQ);
        
        if (!nextMatchSnap.empty) {
          const nextMatchDoc = nextMatchSnap.docs[0];
          if (nextMatchDoc.data().status === 'LOCKED') {
            await updateDoc(doc(db, 'matches', nextMatchDoc.id), { status: 'OPEN' });
          }
        }
      }
    }

    return NextResponse.json({ message: 'Booking updated' }, { status: 200 });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
