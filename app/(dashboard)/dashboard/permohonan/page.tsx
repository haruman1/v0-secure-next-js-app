'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApplications } from '@/app/context/ApplicationContext';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select';

export default function PermohonanPage() {
  const router = useRouter();
  const { addApplication } = useApplications();

  const [form, setForm] = useState({
    jenisLayanan: '',
    jenisKeberangkatan: '',
    jenisPesawat: '',
    namaGroundhandling: '',
    namaPetugas: '',
    noTelepon: '',
    emailPerusahaan: '',
    namaMaskapai: '',
    noPenerbangan: '',
    noKursi: '',
    tanggalPerjalanan: '',
    jamPerjalanan: '',

    namaPasien: '',
    jenisKelamin: '',
    tanggalLahir: '',

    memerlukanOksigen: '',
    posisiPasien: '',
    tingkatKesadaran: '',
    tekananDarah: '',
    nadi: '',
    frekuensiPernafasan: '',
    saturasiOksigen: '',

    jumlahPendamping: '',
    hubunganDenganPasien: '',
    namaPendamping: '',
    noTeleponPendamping: '',
    noTeleponKeluarga: '',
    noSuratIzinPraktik: '',

    fotoKondisi: '',
    ktpPaspor: '',
    manifest: '',
    rekamMedis: '',
    suratRujukan: '',
    tiketPesawat: '',
    dokumenMedis: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // simpan hanya nama file (bukan base64)
    setForm((prev) => ({
      ...prev,
      [e.target.name]: file.name,
    }));
  };

  const handleSubmit = () => {
    addApplication(form);
    alert('Permohonan berhasil dikirim');
    router.push('/verifikasi'); // ✅ Next.js navigation
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Form Permohonan Medivac</h1>

      {/* ================= DATA PENERBANGAN ================= */}
      <section className="space-y-4">
        <h2 className="font-semibold">Data Penerbangan</h2>

        <input
          name="jenisLayanan"
          placeholder="Jenis Layanan"
          onChange={handleChange}
          className="input"
        />
        <input
          name="jenisKeberangkatan"
          placeholder="Jenis Keberangkatan"
          onChange={handleChange}
          className="input"
        />
        <input
          name="jenisPesawat"
          placeholder="Jenis Pesawat"
          onChange={handleChange}
          className="input"
        />
        <input
          name="namaMaskapai"
          placeholder="Nama Maskapai"
          onChange={handleChange}
          className="input"
        />
        <input
          name="noPenerbangan"
          placeholder="No Penerbangan"
          onChange={handleChange}
          className="input"
        />
        <input
          name="tanggalPerjalanan"
          type="date"
          onChange={handleChange}
          className="input"
        />
        <input
          name="jamPerjalanan"
          type="time"
          onChange={handleChange}
          className="input"
        />
      </section>

      {/* ================= DATA PASIEN ================= */}
      <section className="space-y-4">
        <h2 className="font-semibold">Data Pasien</h2>

        <input
          name="namaPasien"
          placeholder="Nama Pasien"
          onChange={handleChange}
          className="input"
        />
        <Select
          value={form.jenisKelamin}
          onValueChange={(value) =>
            setForm((prev) => ({ ...prev, jenisKelamin: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Jenis Kelamin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">Laki-laki</SelectItem>
            <SelectItem value="P">Perempuan</SelectItem>
          </SelectContent>
        </Select>

        <input
          name="tanggalLahir"
          type="date"
          onChange={handleChange}
          className="input"
        />
      </section>

      {/* ================= KONDISI MEDIS ================= */}
      <section className="space-y-4">
        <h2 className="font-semibold">Kondisi Medis</h2>

        <input
          name="tekananDarah"
          placeholder="Tekanan Darah"
          onChange={handleChange}
          className="input"
        />
        <input
          name="nadi"
          placeholder="Nadi"
          onChange={handleChange}
          className="input"
        />
        <input
          name="saturasiOksigen"
          placeholder="Saturasi Oksigen"
          onChange={handleChange}
          className="input"
        />
      </section>

      {/* ================= UPLOAD ================= */}
      <section className="space-y-4">
        <h2 className="font-semibold">Upload Dokumen</h2>

        <label>Foto Kondisi</label>
        <input type="file" name="fotoKondisi" onChange={handleFile} />

        <label>KTP / Paspor</label>
        <input type="file" name="ktpPaspor" onChange={handleFile} />

        <label>Rekam Medis</label>
        <input type="file" name="rekamMedis" onChange={handleFile} />
      </section>

      {/* ================= SUBMIT ================= */}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Kirim Permohonan
      </button>
    </div>
  );
}
