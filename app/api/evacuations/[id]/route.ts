import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const results = await query(
      'SELECT * FROM air_medical_evacuation WHERE id = ?',
      [id],
    );

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Evacuation not found' },
        { status: 404 },
      );
    }

    const evacuation = results[0] as any;

    const userResults = await query('SELECT role FROM users WHERE id = ?', [
      session.userId,
    ]);

    if (!Array.isArray(userResults) || userResults.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = (userResults[0] as any).role;

    if (userRole !== 'admin' && evacuation.user_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: evacuation,
    });
  } catch (error) {
    console.error('Fetch evacuation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existingResults = await query(
      'SELECT * FROM air_medical_evacuation WHERE id = ?',
      [id],
    );

    if (!Array.isArray(existingResults) || existingResults.length === 0) {
      return NextResponse.json(
        { error: 'Evacuation not found' },
        { status: 404 },
      );
    }

    const evacuation = existingResults[0] as any;

    if (evacuation.user_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const fields = [
      'namaPasien', 'jenisLayanan', 'jenisPesawat', 'namaGroundhandling', 
      'namaPetugas', 'noTeleponKantor', 'emailPerusahaan', 'namaMaskapai', 
      'noPenerbangan', 'noKursi', 'tanggalPerjalanan', 'jamPerjalanan',
      'jenisKelamin', 'tanggalLahir', 'oksigen', 'posisiPasien', 
      'tingkatKesadaran', 'tekananDarah', 'nadi', 'frekuensiPernafasan', 
      'saturasiOksigen', 'jumlahPendamping', 'hubunganPasien', 
      'namaPendamping', 'noTeleponPendamping', 'noTeleponKeluarga',
      'noSuratPraktik', 'fotoKondisiPasien', 'ktpPasien', 
      'manifetPrivateJet', 'rekamMedisPasien', 'suratRujukan', 
      'tiketPesawat', 'dokumentPetugasMedis'
    ];

    const updateParts: string[] = [];
    const values: any[] = [];

    for (const field of fields) {
      if (body[field] !== undefined) {
        updateParts.push(`${field} = ?`);
        values.push(body[field] || null);
      }
    }

    if (updateParts.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Always reset status to pending on update
    updateParts.push("status = 'pending'");

    // Add ID and UserID for security
    values.push(id, session.userId);

    const sql = `UPDATE air_medical_evacuation SET ${updateParts.join(', ')} WHERE id = ? AND user_id = ?`;
    
    await query(sql, values);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update evacuation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 },
    );
  }
}