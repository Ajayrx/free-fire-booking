import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';

export async function POST(req) {
  try {
    const payload = await req.json();
    const { reservationId, ownerToken, matchId, slotIds } = payload;

    if (!reservationId || !ownerToken) {
      // Idempotent & clean: return success even if invalid payload
      return NextResponse.json({ success: true }, { status: 200 });
    }

    await runTransaction(db, async (transaction) => {
      const resRef = doc(db, 'reservations', reservationId);
      const resSnap = await transaction.get(resRef);

      // Ownership check: if doesn't match or not ACTIVE, return without error
      if (!resSnap.exists() || resSnap.data().ownerToken !== ownerToken || resSnap.data().status !== 'ACTIVE') {
        return;
      }

      const resData = resSnap.data();
      const targetMatchId = matchId || resData.matchId;
      const currentSlots = resData.slots || [];

      let slotsToRelease = currentSlots;
      let remainingSlots = [];

      if (slotIds && Array.isArray(slotIds) && slotIds.length > 0) {
        const idSet = new Set(slotIds.map(id => id.toString()));
        slotsToRelease = currentSlots.filter(s => idSet.has(s.id.toString()));
        remainingSlots = currentSlots.filter(s => !idSet.has(s.id.toString()));
      }

      // 1. Release target slots
      for (const slotItem of slotsToRelease) {
        const slotRef = doc(db, 'matches', targetMatchId, 'slots', slotItem.id.toString());
        const slotSnap = await transaction.get(slotRef);
        if (slotSnap.exists() && slotSnap.data().reservationId === reservationId) {
          transaction.update(slotRef, {
            status: 'AVAILABLE',
            reservationId: null,
            hold_until: null
          });
        }
      }

      // 2. Update reservation status or remaining slots array
      if (remainingSlots.length === 0) {
        transaction.update(resRef, {
          status: 'RELEASED',
          slots: [],
          releasedAt: serverTimestamp()
        });
      } else {
        transaction.update(resRef, {
          slots: remainingSlots
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Release API Error:', error);
    // Release is idempotent and should never fail client flow
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
