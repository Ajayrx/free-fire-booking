import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // We will generate 3 matches for today
    for (let i = 1; i <= 3; i++) {
      const matchRef = doc(collection(db, 'matches'));
      await setDoc(matchRef, {
        matchNumber: i,
        date: today.getTime(), // Store as timestamp
        status: i === 1 ? 'OPEN' : 'LOCKED', // Only match 1 is open initially
        createdAt: Date.now()
      });

      // Generate 48 slots using a batch write for performance
      const batch = writeBatch(db);
      for (let s = 1; s <= 48; s++) {
        const slotRef = doc(collection(matchRef, 'slots'), s.toString());
        batch.set(slotRef, {
          slotNumber: s,
          status: 'AVAILABLE',
          freeFireUid: null,
          bookingId: null
        });
      }
      await batch.commit();
    }

    return NextResponse.json({ message: 'Next day matches generated successfully in Firebase.' }, { status: 200 });
  } catch (error) {
    console.error('Error generating matches:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
