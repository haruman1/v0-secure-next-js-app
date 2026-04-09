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
    const userResults = await query('SELECT role FROM users WHERE id = ?', [
      session.userId,
    ]);

    if (!Array.isArray(userResults) || userResults.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = (userResults[0] as any).role;
    const statusFilter = request.nextUrl.searchParams.get('status');

    let results;
    if (userRole === 'admin') {
      // Admins see all evacuations
      if (statusFilter) {
        results = await query(
          `
          SELECT * FROM air_medical_evacuation WHERE status = ? ORDER BY created_at DESC
          
          `,
          [statusFilter],
        );
      } else {
        results = await query(`
          SELECT e.*, u.full_name, u.email
          FROM air_medical_evacuation e
          LEFT JOIN users u ON e.user_id = u.id
          ORDER BY e.created_at DESC
        `);
      }
    } else {
      if (statusFilter) {
        results = await query(
          `
            SELECT *
            FROM air_medical_evacuation
            WHERE user_id = ? AND status = ?
            ORDER BY created_at DESC
          `,
          [session.userId, statusFilter],
        );
      } else {
        results = await query(
          `SELECT * FROM air_medical_evacuation WHERE user_id = ? ORDER BY created_at DESC`,
          [session.userId],
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Fetch evacuations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

function extractFileUuid(value: string): string {
  const normalized = value.trim();
  const uuidMatch = normalized.match(/-([a-f0-9]{16,})\.[a-zA-Z0-9]+$/);

  if (uuidMatch?.[1]) {
    return uuidMatch[1];
  }

  return normalized;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    /* =========================
       HELPER AMBIL VALUE
    ========================= */

    const getValue = (key: string) => {
      const v = formData.get(key);
      return typeof v === 'string' ? v.trim() : null;
    };

    const jenisLayanan = getValue('jenisLayanan');
    const jenisPesawat = getValue('jenisPesawat');

    const namaGroundhandling = getValue('namaGroundhandling');
    const namaPetugas = getValue('namaPetugas');
    const noTeleponKantor = getValue('noTeleponKantor');
    const emailPerusahaan = getValue('emailPerusahaan');

    const namaMaskapai = getValue('namaMaskapai');
    const noPenerbangan = getValue('noPenerbangan');
    const noKursi = getValue('noKursi');

    const tanggalPerjalanan = getValue('tanggalPerjalanan');
    const jamPerjalanan = getValue('jamPerjalanan');

    const namaPasien = getValue('namaPasien');
    const jenisKelamin = getValue('jenisKelamin');
    const tanggalLahir = getValue('tanggalLahir');

    const oksigen = getValue('oksigen');
    const posisiPasien = getValue('posisiPasien');
    const tingkatKesadaran = getValue('tingkatKesadaran');

    const tekananDarah = getValue('tekananDarah');
    const nadi = getValue('nadi');
    const frekuensiPernafasan = getValue('frekuensiPernafasan');
    const saturasiOksigen = getValue('saturasiOksigen');

    const jumlahPendamping = getValue('jumlahPendamping');
    const hubunganPasien = getValue('hubunganPasien');
    const namaPendamping = getValue('namaPendamping');
    const noTeleponPendamping = getValue('noTeleponPendamping');
    const noTeleponKeluarga = getValue('noTeleponKeluarga');

    /* =========================
       VALIDASI
    ========================= */

    if (!namaPasien || !tanggalPerjalanan) {
      return NextResponse.json(
        {
          error: 'Nama pasien dan tanggal perjalanan wajib diisi',
        },
        { status: 400 },
      );
    }

    // Validasi Waktu: Minimal 1 hari (24 jam) sebelum keberangkatan
    const travelDateTimeStr = `${tanggalPerjalanan}T${jamPerjalanan || '00:00'}:00`;
    const travelDateTime = new Date(travelDateTimeStr);
    const now = new Date();

    if (travelDateTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        {
          error:
            'Permohonan tidak boleh berdekatan dengan waktu keberangkatan. Penginputan maksimal 1 hari (24 jam) sebelum keberangkatan.',
        },
        { status: 400 },
      );
    }

    /* =========================
       FILE PATH
    ========================= */

    const fileFields = [
      'fotoKondisiPasien',
      'ktpPasien',
      'manifetPrivateJet',
      'rekamMedisPasien',
      'suratRujukan',
      'tiketPesawat',
      'dokumentPetugasMedis',
      'noSuratPraktik',
    ];

    const uploadedFiles: Record<string, string | null> = {};

    for (const field of fileFields) {
      const value = formData.get(field);

      if (typeof value === 'string' && value.length > 0) {
        uploadedFiles[field] = extractFileUuid(value);
      } else {
        uploadedFiles[field] = null;
      }
    }

    /* =========================
       VALUES INSERT DATABASE
    ========================= */

    const values = [
      session.userId,

      jenisLayanan,
      jenisPesawat,
      namaGroundhandling,
      namaPetugas,
      noTeleponKantor,
      emailPerusahaan,

      namaMaskapai,
      noPenerbangan,
      noKursi,

      tanggalPerjalanan,
      jamPerjalanan,

      namaPasien,
      jenisKelamin,
      tanggalLahir,

      oksigen,
      posisiPasien,
      tingkatKesadaran,

      tekananDarah,
      nadi,
      frekuensiPernafasan,
      saturasiOksigen,

      jumlahPendamping,
      hubunganPasien,
      namaPendamping,
      noTeleponPendamping,
      noTeleponKeluarga,

      uploadedFiles['fotoKondisiPasien'],
      uploadedFiles['ktpPasien'],
      uploadedFiles['manifetPrivateJet'],
      uploadedFiles['rekamMedisPasien'],
      uploadedFiles['suratRujukan'],
      uploadedFiles['tiketPesawat'],
      uploadedFiles['dokumentPetugasMedis'],
    ];

    /* =========================
       DEBUG
    ========================= */

    console.log('VALUES LENGTH:', values.length);

    /* =========================
       INSERT DATABASE
    ========================= */

    const result = await query(
      `INSERT INTO air_medical_evacuation 
      (user_id, jenisLayanan, jenisPesawat, namaGroundhandling, namaPetugas, noTeleponKantor, emailPerusahaan,
      namaMaskapai, noPenerbangan, noKursi, tanggalPerjalanan, jamPerjalanan, namaPasien, jenisKelamin, 
      tanggalLahir, oksigen, posisiPasien, tingkatKesadaran, tekananDarah, nadi, frekuensiPernafasan, 
      saturasiOksigen, jumlahPendamping, hubunganPasien, namaPendamping, noTeleponPendamping, noTeleponKeluarga,
      fotoKondisiPasien, ktpPasien, manifetPrivateJet, rekamMedisPasien, suratRujukan, tiketPesawat, dokumentPetugasMedis, noSuratPraktik)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...values, uploadedFiles['noSuratPraktik']],
    );

    const evacuationId = (result as any).insertId;

    await logAuditEvent(
      String(session.userId),
      'EVACUATION_REQUEST_CREATED',
      'air_medical_evacuation',
      evacuationId,
      {
        namaPasien,
        tanggalPerjalanan,
      },
    );

    return NextResponse.json(
      {
        success: true,
        id: evacuationId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create evacuation error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}
