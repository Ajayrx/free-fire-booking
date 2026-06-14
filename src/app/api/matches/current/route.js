import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let match = await prisma.match.findFirst({
      where: { status: 'OPEN' },
      include: {
        slots: {
          orderBy: { slotNumber: 'asc' },
        },
      },
    });

    // For testing/initialization purposes: if no match exists, let's auto-create one.
    if (!match) {
      const matchCount = await prisma.match.count();
      match = await prisma.match.create({
        data: {
          date: new Date(),
          matchNumber: matchCount + 1,
          status: 'OPEN',
          slots: {
            create: Array.from({ length: 48 }, (_, i) => ({
              slotNumber: i + 1,
              status: 'AVAILABLE',
            })),
          },
        },
        include: {
          slots: {
            orderBy: { slotNumber: 'asc' },
          },
        },
      });
    }

    return NextResponse.json({ match }, { status: 200 });
  } catch (error) {
    console.error('Error fetching current match:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
