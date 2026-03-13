import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

function parseDetails(details: unknown): { filePath?: string } {
  if (typeof details !== 'string') return {};
  try {
    return JSON.parse(details);
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await query('SELECT role FROM users WHERE id = ?', [session.userId]);
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = (users[0] as any).role === 'admin';
    const status = request.nextUrl.searchParams.get('status') || 'valid';
    const publishedOnly = request.nextUrl.searchParams.get('publishedOnly') === 'true';

    const evacuations = await query(
      isAdmin
        ? `SELECT id, namaPasien, noPenerbangan, tanggalPerjalanan, status FROM air_medical_evacuation WHERE status = ? ORDER BY created_at DESC`
        : `SELECT id, namaPasien, noPenerbangan, tanggalPerjalanan, status FROM air_medical_evacuation WHERE status = ? AND user_id = ? ORDER BY created_at DESC`,
      isAdmin ? [status] : [status, session.userId],
    );

    const ids = Array.isArray(evacuations) ? evacuations.map((item: any) => item.id) : [];

    let publicationMap = new Map<string, string>();

    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      const logs = await query(
        `SELECT entity_id, details FROM audit_logs WHERE action = 'PUBLICATION_UPLOADED' AND entity_id IN (${placeholders}) ORDER BY created_at DESC`,
        ids,
      );

      publicationMap = new Map(
        (Array.isArray(logs) ? logs : []).map((row: any) => {
          const detail = parseDetails(row.details);
          return [row.entity_id as string, detail.filePath || ''];
        }),
      );
    }

    const mappedData = (Array.isArray(evacuations) ? evacuations : []).map((item: any) => ({
      ...item,
      suratPenerbitan: publicationMap.get(item.id) || null,
    }));

    const data = publishedOnly
      ? mappedData.filter((item: any) => Boolean(item.suratPenerbitan))
      : mappedData;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Fetch publications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
