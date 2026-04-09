import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logAuditEvent } from '@/lib/auth';

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

    const body = await request.json().catch(() => ({}));
    const documentPath =
      typeof body?.documentPath === 'string' ? body.documentPath.trim() : '';

    if (!documentPath) {
      return NextResponse.json(
        { error: 'Path dokumen wajib diisi' },
        { status: 400 },
      );
    }

    const { id } = await params;

    const evacuationResults = await query(
      'SELECT id, status, tanggalPerjalanan, jamPerjalanan FROM air_medical_evacuation WHERE id = ?',
      [id],
    );

    if (!Array.isArray(evacuationResults) || evacuationResults.length === 0) {
      return NextResponse.json(
        { error: 'Permohonan tidak ditemukan' },
        { status: 404 },
      );
    }

    const evacuation = evacuationResults[0] as {
      id: string;
      status: string;
      tanggalPerjalanan: Date;
      jamPerjalanan: string;
    };

    if (evacuation.status !== 'valid') {
      return NextResponse.json(
        {
          error:
            'Dokumen penerbitan hanya untuk permohonan yang sudah disetujui',
        },
        { status: 400 },
      );
    }

    // Validasi Waktu: Minimal 4 jam sebelum keberangkatan
    if (evacuation.tanggalPerjalanan) {
      const travelDateStr =
        evacuation.tanggalPerjalanan instanceof Date
          ? evacuation.tanggalPerjalanan.toISOString().slice(0, 10)
          : String(evacuation.tanggalPerjalanan).slice(0, 10);

      const travelDateTime = new Date(
        `${travelDateStr}T${evacuation.jamPerjalanan || '00:00'}:00`,
      );
      const now = new Date();

      if (travelDateTime.getTime() - now.getTime() < 4 * 60 * 60 * 1000) {
        return NextResponse.json(
          {
            error:
              'Penerbitan dokumen ditolak karena terlalu dekat dengan waktu keberangkatan (minimal 4 jam sebelum).',
          },
          { status: 400 },
        );
      }
    }

    await query(
      `UPDATE air_medical_evacuation
       SET publication_document = ?, updated_at = NOW()
       WHERE id = ?`,
      [documentPath, id],
    );

    await logAuditEvent(
      String(session.userId),
      'PUBLICATION_UPLOADED',
      'air_medical_evacuation',
      id,
      {
        filePath: documentPath,
      },
    );

    return NextResponse.json({
      success: true,
      data: { id, documentPath },
    });
  } catch (error) {
    console.error('Save publication document error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
