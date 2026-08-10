import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAdminPrisma } from '@/app/admin/lib/admin-prisma';

export const dynamic = 'force-dynamic';

const NOTIFICATION_STATUSES = ['pending', 'contacted', 'survey_scheduled', 'proposal_sent'];

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = await getAdminPrisma();
    const pendingQuotes = await prisma.quoteRequest.count({
      where: {
        status: {
          in: ['pending', 'PENDING'],
        },
      },
    });

    return NextResponse.json({ pendingQuotes });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
