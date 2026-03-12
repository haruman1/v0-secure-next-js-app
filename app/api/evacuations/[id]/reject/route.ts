import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';


const NOTE_COLUMN_CANDIDATES = [
  'catatanRevisi',
  'catatan_revisi',
  'revisionNotes',
] as const;


export async function POST(
  req: Request,
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

     const body = await req.json().catch(() => ({}));
    const catatanRevisi =
      typeof body?.catatanRevisi === 'string'
        ? body.catatanRevisi.trim()
        : null;

    const { id } = await params;

      const noteColumnResult = await query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'air_medical_evacuation'
         AND COLUMN_NAME IN (${NOTE_COLUMN_CANDIDATES.map(() => '?').join(',')})`,
      [...NOTE_COLUMN_CANDIDATES],
    );

    const availableColumns = new Set(
      Array.isArray(noteColumnResult)
        ? noteColumnResult
            .map((row: any) => (typeof row?.COLUMN_NAME === 'string' ? row.COLUMN_NAME : null))
            .filter((name: string | null): name is string => Boolean(name))
        : [],
    );

    
    const noteColumn = NOTE_COLUMN_CANDIDATES.find((column) =>
      availableColumns.has(column),
    );

    if (noteColumn) {
      await query(
        `UPDATE air_medical_evacuation SET status = 'reviewed', ${noteColumn} = ? WHERE id = ?`,
        [catatanRevisi || null, id],
      );
    } else {
      await query(
        "UPDATE air_medical_evacuation SET status = 'reviewed' WHERE id = ?",
        [id],
      );
    }

    return NextResponse.json({ success: true });


  } catch (error) {
    console.error('Reject evacuation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}