import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';

async function generateMatchesForDate(targetDateStr) {
  const q = query(collection(db, 'matches'), where('dateStr', '==', targetDateStr));
  const snap = await getDocs(q);
  
  if (!snap.empty) {
    return false; // Already exists
  }

  // Generate 3 matches
  for (let i = 1; i <= 3; i++) {
    const matchRef = doc(collection(db, 'matches'));
    await setDoc(matchRef, {
      matchNumber: i,
      dateStr: targetDateStr,
      date: new Date(`${targetDateStr}T00:00:00+05:30`).getTime(),
      status: i === 1 ? 'OPEN' : 'LOCKED', // Only match 1 is open
      createdAt: Date.now(),
      settings: {
        ammoLimit: 'YES',
        throwableLimit: 'YES',
        ep: '0',
        airdrop: 'YES',
        movementSpeed: '100%',
        environment: 'DAY',
        characterSkill: 'YES',
        genericEnemyOutfit: 'NO',
        preciseAim: 'YES',
        zoneShrinkSpeed: 'STANDARD',
        quitOutPenalty: 'NO',
        warChest: 'YES',
        eventGameplay: 'NO',
        vehicles: 'YES',
        hp: '200',
        jumpHeight: '100%',
        loadout: 'YES',
        gunAttributes: 'YES',
        friendlyFire: 'NO',
        autoRevival: 'NO',
        outOfZoneDamage: 'STANDARD',
        headshot: 'NO',
        revival: 'YES'
      },
      prizeConfig: {
        entryFee: 100,
        winnerFixed: 1000,
        maxPlayers: 48,
        minPlayers: 20
      }
    });

    const batch = writeBatch(db);
    for (let s = 1; s <= 48; s++) {
      const slotRef = doc(collection(db, 'matches', matchRef.id, 'slots'), s.toString());
      batch.set(slotRef, {
        slotNumber: s,
        status: 'AVAILABLE',
        freeFireUid: null,
        bookingId: null
      });
    }
    await batch.commit();
  }
  return true;
}

export async function POST() {
  try {
    const getISTDateString = (offsetDays = 0) => {
      const date = new Date();
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const istDate = new Date(utc + (330 * 60000));
      istDate.setDate(istDate.getDate() + offsetDays);
      const yyyy = istDate.getFullYear();
      const mm = String(istDate.getMonth() + 1).padStart(2, '0');
      const dd = String(istDate.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const todayStr = getISTDateString(0);
    const tomorrowStr = getISTDateString(1);

    const generatedToday = await generateMatchesForDate(todayStr);
    const generatedTomorrow = await generateMatchesForDate(tomorrowStr);

    return NextResponse.json({ 
      message: 'Match auto-generation complete',
      generatedToday,
      generatedTomorrow
    }, { status: 200 });

  } catch (error) {
    console.error('Auto-generate error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
