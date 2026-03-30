import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    // =========================
    // AUTH CHECK
    // =========================
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // =========================
    // GET USER ROLE
    // =========================
    const users = await query(
      'SELECT role FROM users WHERE id = ?',
      [session.userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isAdmin = (users[0] as any).role === 'admin';

    // =========================
    // QUERY PARAMS
    // =========================
    const status =
      request.nextUrl.searchParams.get('status') || 'valid';

    const publishedOnly =
      request.nextUrl.searchParams.get('publishedOnly') === 'true';

    // =========================
    // FETCH DATA
    // =========================
    const evacuations = await query(
      isAdmin
        ? `
          SELECT 
            id,
            namaPasien,
            noPenerbangan,
            tanggalPerjalanan,
            status,
            publication_document
          FROM air_medical_evacuation
          WHERE status = ?
          ORDER BY created_at DESC
        `
        : `
          SELECT 
            id,
            namaPasien,
            noPenerbangan,
            tanggalPerjalanan,
            status,
            publication_document
          FROM air_medical_evacuation
          WHERE status = ?
          AND user_id = ?
          ORDER BY created_at DESC
        `,
      isAdmin ? [status] : [status, session.userId]
    );

    // =========================
    // NORMALIZE DATA
    // =========================
    const mappedData = (Array.isArray(evacuations) ? evacuations : []).map(
      (item: any) => ({
        id: item.id,
        namaPasien: item.namaPasien,
        noPenerbangan: item.noPenerbangan,
        tanggalPerjalanan: item.tanggalPerjalanan,
        status: item.status,

        // 🔥 INI YANG DIPAKAI FRONTEND
        suratPenerbitan: item.publication_document || null,
      })
    );

    // =========================
    // FILTER (OPTIONAL)
    // =========================
    const data = publishedOnly
      ? mappedData.filter((item) => Boolean(item.suratPenerbitan))
      : mappedData;

    // =========================
    // RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Fetch publications error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}