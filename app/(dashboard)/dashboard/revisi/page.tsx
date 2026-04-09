'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { useLanguage } from '@/app/context/language-context';
import { Eye, AlertCircle, Clock, Plane, FileSignature, UploadCloud, Edit3, Save, CheckCircle2, FileText } from 'lucide-react';
import Image from 'next/image';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import Swal from 'sweetalert2';

// --- LOGIKA BAWAAN ASLI (TIDAK DIUBAH) ---
type EvacuationApplication = {
  id: string;
  namaPasien: string | null;
  jenisLayanan: string | null;
  jenisPesawat: string | null;
  namaGroundhandling: string | null;
  namaPetugas: string | null;
  noTeleponKantor: string | null;
  emailPerusahaan: string | null;
  namaMaskapai: string | null;
  noPenerbangan: string | null;
  noKursi: string | null;
  tanggalPerjalanan: string | null;
  jamPerjalanan: string | null;
  jenisKelamin: string | null;
  tanggalLahir: string | null;
  oksigen: string | null;
  posisiPasien: string | null;
  tingkatKesadaran: string | null;
  tekananDarah: string | null;
  nadi: string | null;
  frekuensiPernafasan: string | null;
  saturasiOksigen: string | null;
  jumlahPendamping: string | null;
  hubunganPasien: string | null;
  namaPendamping: string | null;
  noTeleponPendamping: string | null;
  noTeleponKeluarga: string | null;
  status: string | null;
  catatanRevisi?: string | null;
  catatan_revisi?: string | null;
  revisionNotes?: string | null;
  noSuratPraktik?: string | null;
  fotoKondisiPasien?: string | null;
  ktpPasien?: string | null;
  manifetPrivateJet?: string | null;
  rekamMedisPasien?: string | null;
  suratRujukan?: string | null;
  tiketPesawat?: string | null;
  dokumentPetugasMedis?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type EditableForm = {
  namaPasien: string; jenisLayanan: string; jenisPesawat: string; namaGroundhandling: string;
  namaPetugas: string; noTeleponKantor: string; emailPerusahaan: string; namaMaskapai: string;
  noPenerbangan: string; noKursi: string; tanggalPerjalanan: string; jamPerjalanan: string;
  jenisKelamin: string; tanggalLahir: string; oksigen: string; posisiPasien: string;
  tingkatKesadaran: string; tekananDarah: string; nadi: string; frekuensiPernafasan: string;
  saturasiOksigen: string; jumlahPendamping: string; hubunganPasien: string; namaPendamping: string;
  noTeleponPendamping: string; noTeleponKeluarga: string; noSuratPraktik: string; fotoKondisiPasien: string;
  ktpPasien: string; manifetPrivateJet: string; rekamMedisPasien: string; suratRujukan: string;
  tiketPesawat: string; dokumentPetugasMedis: string;
};

const EMPTY_FORM: EditableForm = {
  namaPasien: '', jenisLayanan: '', jenisPesawat: '', namaGroundhandling: '', namaPetugas: '',
  noTeleponKantor: '', emailPerusahaan: '', namaMaskapai: '', noPenerbangan: '', noKursi: '',
  tanggalPerjalanan: '', jamPerjalanan: '', jenisKelamin: '', tanggalLahir: '', oksigen: '',
  posisiPasien: '', tingkatKesadaran: '', tekananDarah: '', nadi: '', frekuensiPernafasan: '',
  saturasiOksigen: '', jumlahPendamping: '', hubunganPasien: '', namaPendamping: '',
  noTeleponPendamping: '', noTeleponKeluarga: '', noSuratPraktik: '', fotoKondisiPasien: '',
  ktpPasien: '', manifetPrivateJet: '', rekamMedisPasien: '', suratRujukan: '', tiketPesawat: '',
  dokumentPetugasMedis: '',
};

// --- KAMUS TEKS (LOKALISASI) ---
const TRANSLATIONS = {
  id: {
    judul: "Permohonan Revisi",
    desc: "Daftar permohonan yang perlu diperbaiki sesuai catatan dari Admin/Verifikator.",
    dataRevisi: "Data Perlu Revisi",
    menungguPerbaikan: "dokumen menunggu perbaikan Anda",
    kosong: "Tidak ada permohonan yang perlu direvisi.",
    revisi: "Revisi",
    input: "Input:",
    sudah: "Sudah",
    hari: "Hari",
    perbaikiData: "Perbaiki Data",
    formPerbaikan: "Form Perbaikan Data",
    formDesc: "Perbaiki data yang ditandai merah sesuai catatan verifikator.",
    pesanVerifikator: "Pesan dari Verifikator",
    pesanKosong: "Gunakan form di bawah untuk memperbaiki data. Perhatikan kotak berwarna merah.",
    dataPenerbangan: "Data Penerbangan",
    kondisiMedis: "Kondisi Medis Pasien",
    unggahDokumen: "Unggah Ulang Dokumen",
    batal: "Batal",
    menyimpan: "Menyimpan...",
    modeAdmin: "Mode Admin (View Only)",
    simpanKirim: "Simpan & Kirim Verifikasi",
    previewJudul: "Pratinjau Dokumen",
    // Fields
    namaPasien: "Nama Pasien",
    jenisLayanan: "Jenis Layanan",
    noPenerbangan: "No Penerbangan",
    maskapai: "Maskapai",
    tglPerjalanan: "Tanggal Perjalanan",
    tekananDarah: "Tekanan Darah",
    nadi: "Nadi",
    saturasi: "Saturasi Oksigen",
    kesadaran: "Tingkat Kesadaran",
    sip: "Surat Izin Praktik",
    rujukan: "Surat Rujukan",
    manifest: "Manifest/Tiket Pesawat",
    fotoKondisi: "Foto Kondisi Pasien",
    ktp: "KTP Pasien",
    dokPetugas: "Dokumen Petugas Medis",
    // Subcomponents
    lihatFile: "Lihat File",
    gantiFile: "Klik untuk mengganti file",
    pilihFile: "Klik untuk memilih file...",
    catatanRevisi: "REVISI:",
    suksesUpload: "Berhasil mengunggah dokumen revisi.",
    gagalUpload: "Gagal mengunggah:",
    suksesSimpan: "Data revisi berhasil disimpan dan dikirim ulang untuk verifikasi.",
    gagalSimpan: "Gagal mengirim ulang revisi.",
    errorSistem: "Terjadi kesalahan sistem."
  },
  en: {
    judul: "Revision Requests",
    desc: "List of applications requiring correction based on Admin/Verifier notes.",
    dataRevisi: "Needs Revision",
    menungguPerbaikan: "documents awaiting your correction",
    kosong: "No applications require revision.",
    revisi: "Revision",
    input: "Input:",
    sudah: "Elapsed",
    hari: "Days",
    perbaikiData: "Fix Data",
    formPerbaikan: "Data Correction Form",
    formDesc: "Correct the data marked in red according to the verifier's notes.",
    pesanVerifikator: "Message from Verifier",
    pesanKosong: "Use the form below to correct the data. Pay attention to the red boxes.",
    dataPenerbangan: "Flight Data",
    kondisiMedis: "Patient Medical Condition",
    unggahDokumen: "Re-upload Documents",
    batal: "Cancel",
    menyimpan: "Saving...",
    modeAdmin: "Admin Mode (View Only)",
    simpanKirim: "Save & Send Verification",
    previewJudul: "Document Preview",
    // Fields
    namaPasien: "Patient Name",
    jenisLayanan: "Service Type",
    noPenerbangan: "Flight Number",
    maskapai: "Airline",
    tglPerjalanan: "Travel Date",
    tekananDarah: "Blood Pressure",
    nadi: "Pulse",
    saturasi: "Oxygen Saturation",
    kesadaran: "Consciousness Level",
    sip: "Practice License",
    rujukan: "Referral Letter",
    manifest: "Manifest/Flight Ticket",
    fotoKondisi: "Patient Condition Photo",
    ktp: "Patient ID Card",
    dokPetugas: "Medical Officer Document",
    // Subcomponents
    lihatFile: "View File",
    gantiFile: "Click to replace file",
    pilihFile: "Click to select file...",
    catatanRevisi: "REVISION:",
    suksesUpload: "Successfully uploaded revision document.",
    gagalUpload: "Upload failed:",
    suksesSimpan: "Revision data successfully saved and resent for verification.",
    gagalSimpan: "Failed to resend revision.",
    errorSistem: "A system error occurred."
  }
};

// --- FUNGSI HELPER (DIPERBARUI DENGAN BAHASA) ---
function parseCatatanRevisi(note?: string | null): Record<string, string> {
  if (!note) return {};
  try {
    const parsed = JSON.parse(note);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch {
    return { _general: note };
  }
  return {};
}

function getGeneralNote(note?: string | null) {
  const parsed = parseCatatanRevisi(note);
  return (
    parsed._general ||
    (typeof note === 'string' && !note.startsWith('{') ? note : '')
  );
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return '';
  return parsedDate.toISOString().slice(0, 10);
}

function getWaktuBerjalan(dateStr?: string | null, now?: Date, lang: 'id' | 'en' = 'id') {
  if (!dateStr || !now) return '-';
  const created = new Date(dateStr);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  const createdDateOnly = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffCalendarDays = Math.round((nowDateOnly.getTime() - createdDateOnly.getTime()) / 86400000);

  if (diffCalendarDays === 0) {
    if (diffMins < 1) return lang === 'id' ? 'Baru saja' : 'Just now';
    if (diffMins < 60) return lang === 'id' ? `${diffMins} menit lalu` : `${diffMins} mins ago`;
    return lang === 'id' ? `${diffHours} jam lalu` : `${diffHours} hours ago`;
  }
  return lang === 'id' ? `${diffCalendarDays} hari lalu` : `${diffCalendarDays} days ago`;
}

function formatTanggalID(dateString?: string | null, lang: string = 'id'): string {
  if (!dateString) return '-';
  const locale = lang === 'en' ? 'en-US' : 'id-ID';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

function formatTime(dateStr?: string | null, lang: string = 'id') {
  if (!dateStr) return '-';
  const locale = lang === 'en' ? 'en-US' : 'id-ID';
  return new Date(dateStr).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// --- KOMPONEN UTAMA ---
export default function RevisiPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  
  const activeLang = (language === 'en' ? 'en' : 'id') as 'id' | 'en';
  const txt = TRANSLATIONS[activeLang];

  const [applications, setApplications] = useState<EvacuationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedApp, setSelectedApp] = useState<EvacuationApplication | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [editForm, setEditForm] = useState<EditableForm>(EMPTY_FORM);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const revisionData = parseCatatanRevisi(
    selectedApp?.catatanRevisi || selectedApp?.catatan_revisi || selectedApp?.revisionNotes,
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    fetchApplications();
  }, [authLoading]);

  async function fetchApplications() {
    try {
      const res = await fetch('/api/evacuations?status=reviewed', {
        credentials: 'include',
      });
      const result = await res.json();
      if (res.ok) {
        const sorted = (result.data || []).sort((a: EvacuationApplication, b: EvacuationApplication) => 
          new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()
        );
        setApplications(sorted);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id: string) {
    try {
      const res = await fetch(`/api/evacuations/${id}`, { credentials: 'include' });
      const result = await res.json();
      if (res.ok) {
        const data = (result.data || result) as EvacuationApplication;
        setSelectedApp(data);
        setEditForm({
          namaPasien: data.namaPasien || '', jenisLayanan: data.jenisLayanan || '',
          jenisPesawat: data.jenisPesawat || '', namaGroundhandling: data.namaGroundhandling || '',
          namaPetugas: data.namaPetugas || '', noTeleponKantor: data.noTeleponKantor || '',
          emailPerusahaan: data.emailPerusahaan || '', namaMaskapai: data.namaMaskapai || '',
          noPenerbangan: data.noPenerbangan || '', noKursi: data.noKursi || '',
          tanggalPerjalanan: toDateInputValue(data.tanggalPerjalanan), jamPerjalanan: data.jamPerjalanan || '',
          jenisKelamin: data.jenisKelamin || '', tanggalLahir: toDateInputValue(data.tanggalLahir),
          oksigen: data.oksigen || '', posisiPasien: data.posisiPasien || '',
          tingkatKesadaran: data.tingkatKesadaran || '', tekananDarah: data.tekananDarah || '',
          nadi: data.nadi || '', frekuensiPernafasan: data.frekuensiPernafasan || '',
          saturasiOksigen: data.saturasiOksigen || '', jumlahPendamping: data.jumlahPendamping || '0',
          hubunganPasien: data.hubunganPasien || '', namaPendamping: data.namaPendamping || '',
          noTeleponPendamping: data.noTeleponPendamping || '', noTeleponKeluarga: data.noTeleponKeluarga || '',
          noSuratPraktik: data.noSuratPraktik || '', fotoKondisiPasien: data.fotoKondisiPasien || '',
          ktpPasien: data.ktpPasien || '', manifetPrivateJet: data.manifetPrivateJet || '',
          rekamMedisPasien: data.rekamMedisPasien || '', suratRujukan: data.suratRujukan || '',
          tiketPesawat: data.tiketPesawat || '', dokumentPetugasMedis: data.dokumentPetugasMedis || '',
        });
        setShowDetail(true);
      }
    } catch (error) {
      console.error('Detail error:', error);
    }
  }

  async function handleFileUpload(file: File, field: keyof EditableForm) {
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('fileType', field);

      const res = await fetch('/api/upload/medical-document', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setEditForm((prev) => ({ ...prev, [field]: result.data.path }));
      Swal.fire({ icon: 'success', title: 'Success', text: txt.suksesUpload });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: `${txt.gagalUpload} ${error.message}` });
    }
  }

  async function submitRevisi() {
    if (!selectedApp) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/evacuations/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });

      const result = await res.json();
      if (!res.ok) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: result.error || txt.gagalSimpan });
        return;
      }

      Swal.fire({ icon: 'success', title: 'Terkirim', text: txt.suksesSimpan });
      setApplications((prev) => prev.filter((item) => item.id !== selectedApp.id));
      setShowDetail(false);
      setSelectedApp(null);
      setEditForm(EMPTY_FORM);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: txt.errorSistem });
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditChange<K extends keyof EditableForm>(field: K, value: EditableForm[K]) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  if (authLoading) return null;
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
      `}} />

      <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto bg-slate-50/50 min-h-screen text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {/* HEADER SECTION */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{txt.judul}</h1>
          <p className="text-slate-500 text-base md:text-lg mt-2 max-w-2xl">{txt.desc}</p>
        </div>

        <Card className="border-slate-200 shadow-lg rounded-2xl overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6 pt-8 px-6 md:px-10">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2.5 rounded-xl text-red-600">
                <FileSignature className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl font-bold text-slate-900">
                  {txt.dataRevisi}
                </CardTitle>
                <CardDescription className="text-base text-slate-500 mt-1 font-medium">
                  {applications.length} {txt.menungguPerbaikan}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-10">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-500 text-lg">
                <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                Memuat data...
              </div>
            ) : applications.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                <p className="text-lg font-medium">{txt.kosong}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((app) => (
                  <div key={app.id} className="rounded-2xl border-2 border-red-100 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-xl leading-tight">
                          {app.namaPasien || '-'}
                        </h3>
                        <Badge className="bg-red-100 text-red-700 border-none px-3 py-1 text-xs font-semibold rounded-full shrink-0">
                          {txt.revisi}
                        </Badge>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
                        <span className="text-sm font-mono font-semibold">ID: {app.id}</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <Plane className="w-4 h-4 text-slate-400" />
                          {app.noPenerbangan || app.namaMaskapai || '-'}
                        </div>
                        {app.tanggalPerjalanan && (
                          <p className="text-sm text-slate-500 pl-6">
                            {formatTanggalID(app.tanggalPerjalanan, activeLang)}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          <Clock className="w-4 h-4" />
                          {txt.input} {formatTanggalID(app.created_at, activeLang)}
                        </span>
                        
                        <Badge className="w-fit mt-1 bg-red-50 text-red-600 border border-red-200 text-[13px] font-semibold px-3 py-1 shadow-none">
                          {getWaktuBerjalan(app.updated_at || app.created_at, currentTime, activeLang)}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <Button 
                        className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl" 
                        onClick={() => openDetail(app.id)}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        {txt.perbaikiData}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* MODAL FORM REVISI */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl border-none shadow-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <DialogHeader className="p-6 md:p-8 bg-slate-900 text-white shrink-0">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-sky-400" /> {txt.formPerbaikan}
              </DialogTitle>
              <DialogDescription className="text-base text-slate-400 mt-1">
                {txt.formDesc}
              </DialogDescription>
            </DialogHeader>

            {selectedApp && (
              <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50/50 space-y-8">
                
                {/* CATATAN VERIFIKATOR */}
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-1">
                        {txt.pesanVerifikator}
                      </p>
                      <p className="text-amber-900 font-medium whitespace-pre-wrap leading-relaxed">
                        {getGeneralNote(
                          selectedApp.catatanRevisi || selectedApp.catatan_revisi || selectedApp.revisionNotes
                        ) || txt.pesanKosong}
                      </p>
                    </div>
                  </div>
                </div>

                {/* FORM SECTION: DATA PENERBANGAN */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Plane className="w-5 h-5 text-sky-600" /> {txt.dataPenerbangan}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <RevisiField label={txt.namaPasien} id="namaPasien" value={editForm.namaPasien} onChange={(v) => handleEditChange('namaPasien', v)} note={revisionData.namaPasien} txtPrefix={txt.catatanRevisi} />
                    <RevisiField label={txt.jenisLayanan} id="jenisLayanan" value={editForm.jenisLayanan} onChange={(v) => handleEditChange('jenisLayanan', v)} note={revisionData.jenisLayanan} txtPrefix={txt.catatanRevisi} />
                    <RevisiField label={txt.noPenerbangan} id="noPenerbangan" value={editForm.noPenerbangan} onChange={(v) => handleEditChange('noPenerbangan', v)} note={revisionData.noPenerbangan} txtPrefix={txt.catatanRevisi} />
                    <RevisiField label={txt.maskapai} id="namaMaskapai" value={editForm.namaMaskapai} onChange={(v) => handleEditChange('namaMaskapai', v)} note={revisionData.namaMaskapai} txtPrefix={txt.catatanRevisi} />
                    <RevisiField label={txt.tglPerjalanan} id="tanggalPerjalanan" type="date" value={editForm.tanggalPerjalanan} onChange={(v) => handleEditChange('tanggalPerjalanan', v)} note={revisionData.tanggalPerjalanan} txtPrefix={txt.catatanRevisi} />
                  </div>
                </div>

                {/* FORM SECTION: KONDISI MEDIS */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <FileText className="w-5 h-5 text-emerald-600" /> {txt.kondisiMedis}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <RevisiField label={txt.tekananDarah} id="tekananDarah" value={editForm.tekananDarah} onChange={(v) => handleEditChange('tekananDarah', v)} note={revisionData.tekananDarah} txtPrefix={txt.catatanRevisi} />
                    <RevisiField label={txt.nadi} id="nadi" value={editForm.nadi} onChange={(v) => handleEditChange('nadi', v)} note={revisionData.nadi} txtPrefix={txt.catatanRevisi} />
                    <RevisiField label={txt.saturasi} id="saturasiOksigen" value={editForm.saturasiOksigen} onChange={(v) => handleEditChange('saturasiOksigen', v)} note={revisionData.saturasiOksigen} txtPrefix={txt.catatanRevisi} />
                    <RevisiField label={txt.kesadaran} id="tingkatKesadaran" value={editForm.tingkatKesadaran} onChange={(v) => handleEditChange('tingkatKesadaran', v)} note={revisionData.tingkatKesadaran} txtPrefix={txt.catatanRevisi} />
                  </div>
                </div>

                {/* FORM SECTION: UNGGAH DOKUMEN */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <UploadCloud className="w-5 h-5 text-purple-600" /> {txt.unggahDokumen}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RevisiUpload txt={txt} label={txt.sip} fieldName="noSuratPraktik" currentPath={editForm.noSuratPraktik} onUpload={(f) => handleFileUpload(f, 'noSuratPraktik')} note={revisionData.noSuratPraktik} onPreview={() => { setPreviewFileUrl(editForm.noSuratPraktik); setPreviewModal(true); }} />
                    <RevisiUpload txt={txt} label={txt.rujukan} fieldName="suratRujukan" currentPath={editForm.suratRujukan} onUpload={(f) => handleFileUpload(f, 'suratRujukan')} note={revisionData.suratRujukan} onPreview={() => { setPreviewFileUrl(editForm.suratRujukan); setPreviewModal(true); }} />
                    <RevisiUpload txt={txt} label={txt.manifest} fieldName="manifetPrivateJet" currentPath={editForm.manifetPrivateJet} onUpload={(f) => handleFileUpload(f, 'manifetPrivateJet')} note={revisionData.manifetPrivateJet} onPreview={() => { setPreviewFileUrl(editForm.manifetPrivateJet); setPreviewModal(true); }} />
                    <RevisiUpload txt={txt} label={txt.fotoKondisi} fieldName="fotoKondisiPasien" currentPath={editForm.fotoKondisiPasien} onUpload={(f) => handleFileUpload(f, 'fotoKondisiPasien')} note={revisionData.fotoKondisiPasien} onPreview={() => { setPreviewFileUrl(editForm.fotoKondisiPasien); setPreviewModal(true); }} />
                    <RevisiUpload txt={txt} label={txt.ktp} fieldName="ktpPasien" currentPath={editForm.ktpPasien} onUpload={(f) => handleFileUpload(f, 'ktpPasien')} note={revisionData.ktpPasien} onPreview={() => { setPreviewFileUrl(editForm.ktpPasien); setPreviewModal(true); }} />
                    <RevisiUpload txt={txt} label={txt.dokPetugas} fieldName="dokumentPetugasMedis" currentPath={editForm.dokumentPetugasMedis} onUpload={(f) => handleFileUpload(f, 'dokumentPetugasMedis')} note={revisionData.dokumentPetugasMedis} onPreview={() => { setPreviewFileUrl(editForm.dokumentPetugasMedis); setPreviewModal(true); }} />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="p-6 bg-white border-t border-slate-100 shrink-0 gap-3 sm:gap-0">
              <Button variant="outline" className="h-12 px-6 rounded-xl font-semibold border-slate-300 text-slate-700" onClick={() => setShowDetail(false)} disabled={submitting}>
                {txt.batal}
              </Button>
              <Button onClick={submitRevisi} disabled={submitting || !selectedApp || isAdmin} className="h-12 px-8 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md">
                <Save className="w-5 h-5 mr-2" />
                {submitting ? txt.menyimpan : isAdmin ? txt.modeAdmin : txt.simpanKirim}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL PREVIEW DOKUMEN */}
        <Dialog open={previewModal} onOpenChange={setPreviewModal}>
          <DialogContent className="max-w-4xl p-0 rounded-2xl overflow-hidden border-none shadow-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <DialogHeader className="p-6 bg-slate-900 text-white border-b border-slate-800">
              <DialogTitle className="text-xl font-bold">{txt.previewJudul}</DialogTitle>
            </DialogHeader>
            {previewFileUrl && (
              <div className="bg-slate-100 flex items-center justify-center p-6">
                <div className="w-full h-[70vh] rounded-xl overflow-hidden bg-white shadow-inner border border-slate-200">
                  {previewFileUrl.toLowerCase().endsWith('.pdf') ? (
                    <iframe src={previewFileUrl} className="w-full h-full" title="PDF Preview" />
                  ) : (
                    <img src={previewFileUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

// --- SUB-KOMPONEN UI ---

function RevisiField({ label, id, value, onChange, note, type = 'text', txtPrefix = 'REVISI:' }: { label: string; id: string; value: string; onChange: (v: string) => void; note?: string; type?: string; txtPrefix?: string; }) {
  return (
    <div className={`space-y-2 p-3 rounded-xl transition-all ${note ? 'bg-red-50/80 border border-red-200 shadow-sm ring-1 ring-red-100' : 'bg-white'}`}>
      <Label htmlFor={id} className={`text-sm font-semibold ${note ? 'text-red-700' : 'text-slate-700'}`}>
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 rounded-lg text-base font-medium ${note ? 'border-red-300 focus-visible:ring-red-400 bg-white' : 'border-slate-200 focus-visible:ring-sky-500 bg-slate-50 hover:bg-white'}`}
      />
      {note && (
        <div className="flex items-start gap-1.5 mt-2 p-2 bg-red-100/50 rounded-lg text-sm text-red-700 font-bold leading-tight">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{txtPrefix} {note}</span>
        </div>
      )}
    </div>
  );
}

function RevisiUpload({ label, currentPath, onUpload, note, onPreview, txt }: { label: string; fieldName: string; currentPath: string; onUpload: (f: File) => void; note?: string; onPreview: () => void; txt: any; }) {
  const isUploaded = !!currentPath;
  
  return (
    <div className={`p-4 rounded-xl border transition-all ${note ? 'bg-red-50/80 border-red-200 shadow-sm ring-1 ring-red-100' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <Label className={`text-sm font-semibold ${note ? 'text-red-700' : 'text-slate-700'}`}>
          {label}
        </Label>
        {isUploaded && (
          <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-semibold border-sky-200 text-sky-700 hover:bg-sky-50 rounded-lg" onClick={onPreview}>
            <Eye className="w-3.5 h-3.5 mr-1.5" /> {txt.lihatFile}
          </Button>
        )}
      </div>

      <div className={`relative group cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-colors ${note ? 'border-red-300 bg-white hover:bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-sky-50 hover:border-sky-400'}`}>
        <input type="file" title="" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); }} />
        <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${note ? 'text-red-400 group-hover:text-red-500' : (isUploaded ? 'text-emerald-500' : 'text-slate-400 group-hover:text-sky-500')}`} />
        <p className={`text-sm font-semibold ${note ? 'text-red-700' : (isUploaded ? 'text-emerald-700' : 'text-slate-600')}`}>
          {isUploaded ? txt.gantiFile : txt.pilihFile}
        </p>
      </div>

      {note && (
        <div className="flex items-start gap-1.5 mt-3 p-2 bg-red-100/80 rounded-lg text-sm text-red-700 font-bold leading-tight">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{txt.catatanRevisi} {note}</span>
        </div>
      )}
    </div>
  );
}