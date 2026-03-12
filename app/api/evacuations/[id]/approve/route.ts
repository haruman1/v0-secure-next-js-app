import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(
  request: NextRequest,
   { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

   const userResults = await query('SELECT role FROM users WHERE id = ?', [
      session.userId,
    ]);

 if (!Array.isArray(userResults) || userResults.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = (userResults[0] as any).role;

    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    await query("UPDATE air_medical_evacuation SET status='valid' WHERE id = ?", [
      id,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Approve evacuation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}