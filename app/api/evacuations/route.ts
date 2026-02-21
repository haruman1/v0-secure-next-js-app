import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logAuditEvent } from '@/lib/auth';
import { uploadFile } from '@/lib/file-upload';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const userResults = await query(
      'SELECT role FROM users WHERE id = ?',
      [session.userId]
    );

    if (!Array.isArray(userResults) || userResults.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = (userResults[0] as any).role;

    let results;
    if (userRole === 'admin') {
      // Admins see all evacuations
      results = await query(`
        SELECT e.*, u.full_name, u.email
        FROM air_medical_evacuation e
        LEFT JOIN users u ON e.user_id = u.id
        ORDER BY e.created_at DESC
      `);
    } else {
      // Users see only their own
      results = await query(
        `SELECT * FROM air_medical_evacuation WHERE user_id = ? ORDER BY created_at DESC`,
        [session.userId]
      );
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Fetch evacuations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Extract form fields
    const jenisLayanan = formData.get('jenisLayanan');
    const namaPasien = formData.get('namaPasien');
    const jenisKelamin = formData.get('jenisKelamin');
    const tanggalLahir = formData.get('tanggalLahir');
    const tanggalPerjalanan = formData.get('tanggalPerjalanan');
    const jamPerjalanan = formData.get('jamPerjalanan');
    const jenisPesawat = formData.get('jenisPesawat');
    const namaMaskapai = formData.get('namaMaskapai');
    const noPenerbangan = formData.get('noPenerbangan');
    const noKursi = formData.get('noKursi');

    if (!namaPasien || !tanggalPerjalanan) {
      return NextResponse.json(
        { error: 'Patient name and travel date are required' },
        { status: 400 }
      );
    }

    // Handle file uploads
    const fileFields = [
      'fotoKondisiPasien',
      'ktpPasien',
      'manifetPrivateJet',
      'rekamMedisPasien',
      'suratRujukan',
      'tiketPesawat',
      'dokumentPetugasMedis',
    ];

    const uploadedFiles: { [key: string]: string | null } = {};
    
    for (const field of fileFields) {
      const file = formData.get(field) as File | null;
      if (file && file.size > 0) {
        try {
          const uploadedFile = await uploadFile(file, field);
          uploadedFiles[field] = uploadedFile.path;
        } catch (uploadError) {
          console.error(`[v0] Error uploading ${field}:`, uploadError);
          uploadedFiles[field] = null;
        }
      } else {
        uploadedFiles[field] = null;
      }
    }

    const values = [
      session.userId,
      jenisLayanan || null,
      jenisPesawat || null,
      formData.get('namaGroundhandling') || null,
      formData.get('namaPetugas') || null,
      formData.get('noTeleponKantor') || null,
      formData.get('emailPerusahaan') || null,
      namaMaskapai || null,
      noPenerbangan || null,
      noKursi || null,
      tanggalPerjalanan,
      jamPerjalanan || null,
      namaPasien,
      jenisKelamin || null,
      tanggalLahir || null,
      formData.get('oksigen') || null,
      formData.get('posisiPasien') || null,
      formData.get('tingkatKesadaran') || null,
      formData.get('tekananDarah') || null,
      formData.get('nadi') || null,
      formData.get('frekuensiPernafasan') || null,
      formData.get('saturasiOksigen') || null,
      formData.get('jumlahPendamping') || null,
      formData.get('hubunganPasien') || null,
      formData.get('namaPendamping') || null,
      formData.get('noTeleponPendamping') || null,
      formData.get('noTeleponKeluarga') || null,
      uploadedFiles['fotoKondisiPasien'],
      uploadedFiles['ktpPasien'],
      uploadedFiles['manifetPrivateJet'],
      uploadedFiles['rekamMedisPasien'],
      uploadedFiles['suratRujukan'],
      uploadedFiles['tiketPesawat'],
      uploadedFiles['dokumentPetugasMedis'],
    ];

    const result = await query(
      `INSERT INTO air_medical_evacuation 
       (user_id, jenisLayanan, jenisPesawat, namaGroundhandling, namaPetugas, noTeleponKantor, emailPerusahaan,
        namaMaskapai, noPenerbangan, noKursi, tanggalPerjalanan, jamPerjalanan, namaPasien, jenisKelamin, 
        tanggalLahir, oksigen, posisiPasien, tingkatKesadaran, tekananDarah, nadi, frekuensiPernafasan, 
        saturasiOksigen, jumlahPendamping, hubunganPasien, namaPendamping, noTeleponPendamping, noTeleponKeluarga,
        fotoKondisiPasien, ktpPasien, manifetPrivateJet, rekamMedisPasien, suratRujukan, tiketPesawat, dokumentPetugasMedis)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );

    const evacuationId = (result as any).insertId;

    await logAuditEvent(
      session.userId,
      'EVACUATION_REQUEST_CREATED',
      'air_medical_evacuation',
      evacuationId,
      { namaPasien, tanggalPerjalanan, jenisLayanan, filesUploaded: Object.keys(uploadedFiles).filter(k => uploadedFiles[k]) }
    );

    return NextResponse.json(
      {
        success: true,
        id: evacuationId,
        uploadedFiles,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create evacuation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
