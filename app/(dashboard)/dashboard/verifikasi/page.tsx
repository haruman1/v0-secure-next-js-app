'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { useLanguage } from '@/app/context/language-context'; 
import Swal from 'sweetalert2';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import Image from 'next/image';

/* ================= TRANSLATIONS ================= */
const translations = {
  id: {
    title: 'Verifikasi Permohonan',
    appData: 'Data Permohonan',
    dataCount: 'data',
    loading: 'Loading...',
    noData: 'Tidak ada data',
    waiting: 'Menunggu',
    revision: 'Revisi',
    valid: 'Valid',
    canceled: 'Batal',
    detail: 'Detail',
    approve: 'Setujui',
    detailTitle: 'Detail Permohonan',
    fullInfo: 'Informasi lengkap',
    flightData: 'Data Penerbangan & Pemohon',
    patientName: 'Nama Pasien',
    serviceType: 'Jenis Layanan',
    planeType: 'Jenis Pesawat',
    flightNo: 'No Penerbangan',
    airline: 'Maskapai',
    groundhandling: 'Groundhandling',
    medicalCondition: 'Kondisi Medis',
    bloodPressure: 'Tekanan Darah',
    pulse: 'Nadi',
    oxygenSaturation: 'Saturasi Oksigen',
    consciousness: 'Tingkat Kesadaran',
    uploadDocs: 'Dokumen Upload',
    sip: 'Surat Izin Praktik',
    referral: 'Surat Rujukan',
    manifest: 'Manifest/Tiket',
    conditionPhoto: 'Foto Kondisi',
    ktp: 'KTP Pasien',
    medDocs: 'Dokumen Medis',
    created: 'Dibuat',
    updated: 'Update',
    lastRevNote: 'Catatan Revisi Terakhir:',
    defaultRevMsg: 'Gunakan catatan di bawah untuk memperbaiki data:',
    genRevNote: 'Catatan Umum Revisi',
    approveAll: 'Setujui Seluruhnya',
    sendRev: 'Kirim Ke Revisi',
    sending: 'Mengirim...',
    revPlaceholder: 'Contoh: Seluruh dokumen kurang jelas, mohon upload ulang...',
    success: 'Berhasil',
    error: 'Error',
    info: 'Info',
    appApproved: 'Permohonan disetujui',
    fetchFailed: 'Gagal mengambil data',
    detailFailed: 'Gagal mengambil detail',
    approveFailed: 'Gagal approve',
    needRevReason: 'Berikan setidaknya satu alasan revisi',
    returnedForRev: 'Dikembalikan untuk revisi',
    submitRevFailed: 'Gagal submit revisi',
    revReason: 'Alasan revisi...',
  },
  en: {
    title: 'Application Verification',
    appData: 'Application Data',
    dataCount: 'records',
    loading: 'Loading...',
    noData: 'No data available',
    waiting: 'Pending',
    revision: 'Revision',
    valid: 'Valid',
    canceled: 'Canceled',
    detail: 'Detail',
    approve: 'Approve',
    detailTitle: 'Application Detail',
    fullInfo: 'Complete information',
    flightData: 'Flight & Applicant Data',
    patientName: 'Patient Name',
    serviceType: 'Service Type',
    planeType: 'Aircraft Type',
    flightNo: 'Flight Number',
    airline: 'Airline',
    groundhandling: 'Groundhandling',
    medicalCondition: 'Medical Condition',
    bloodPressure: 'Blood Pressure',
    pulse: 'Pulse',
    oxygenSaturation: 'Oxygen Saturation',
    consciousness: 'Level of Consciousness',
    uploadDocs: 'Uploaded Documents',
    sip: 'Practice License',
    referral: 'Referral Letter',
    manifest: 'Manifest/Ticket',
    conditionPhoto: 'Condition Photo',
    ktp: 'Patient ID Card',
    medDocs: 'Medical Documents',
    created: 'Created',
    updated: 'Updated',
    lastRevNote: 'Last Revision Notes:',
    defaultRevMsg: 'Use the notes below to correct the data:',
    genRevNote: 'General Revision Note',
    approveAll: 'Approve All',
    sendRev: 'Send for Revision',
    sending: 'Sending...',
    revPlaceholder: 'Example: All documents are unclear, please re-upload...',
    success: 'Success',
    error: 'Error',
    info: 'Info',
    appApproved: 'Application approved',
    fetchFailed: 'Failed to fetch data',
    detailFailed: 'Failed to fetch details',
    approveFailed: 'Failed to approve',
    needRevReason: 'Provide at least one revision reason',
    returnedForRev: 'Returned for revision',
    submitRevFailed: 'Failed to submit revision',
    revReason: 'Revision reason...',
  },
};

/* ================= TYPES ================= */

type RawAppItem = Record<string, unknown>;

type AppItem = {
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
  status: 'pending' | 'reviewed' | 'valid' | 'canceled';
  catatanRevisi?: string | null;
  catatan_revisi?: string | null;
  revisionNotes?: string | null;
  created_at?: string;
  updated_at?: string;
  noSuratPraktik?: string | null;
  fotoKondisiPasien?: string | null;
  ktpPasien?: string | null;
  manifetPrivateJet?: string | null;
  rekamMedisPasien?: string | null;
  suratRujukan?: string | null;
  tiketPesawat?: string | null;
  dokumentPetugasMedis?: string | null;
};

/* ================= HELPERS ================= */

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

function normalizeStatus(status: unknown): AppItem['status'] {
  if (
    status === 'valid' ||
    status === 'reviewed' ||
    status === 'pending' ||
    status === 'canceled'
  )
    return status;

  if (status === 'approved') return 'valid';
  if (status === 'cancelled') return 'canceled';

  return 'pending';
}

function mapApplication(item: RawAppItem): AppItem {
  return {
    id: String(item.id ?? ''),
    namaPasien: (item.namaPasien || item.nama_pasien || item.patient_name) as string,
    jenisLayanan: item.jenisLayanan as string,
    jenisPesawat: item.jenisPesawat as string,
    namaGroundhandling: item.namaGroundhandling as string,
    namaPetugas: item.namaPetugas as string,
    noTeleponKantor: item.noTeleponKantor as string,
    emailPerusahaan: item.emailPerusahaan as string,
    namaMaskapai: item.namaMaskapai as string,
    noPenerbangan: (item.noPenerbangan || item.no_penerbangan) as string,
    noKursi: item.noKursi as string,
    tanggalPerjalanan: (item.tanggalPerjalanan || item.tanggal_perjalanan) as string,
    jamPerjalanan: item.jamPerjalanan as string,
    jenisKelamin: item.jenisKelamin as string,
    tanggalLahir: item.tanggalLahir as string,
    oksigen: item.oksigen as string,
    posisiPasien: item.posisiPasien as string,
    tingkatKesadaran: item.tingkatKesadaran as string,
    tekananDarah: item.tekananDarah as string,
    nadi: item.nadi as string,
    frekuensiPernafasan: item.frekuensiPernafasan as string,
    saturasiOksigen: item.saturasiOksigen as string,
    jumlahPendamping: String(item.jumlahPendamping || ''),
    hubunganPasien: item.hubunganPasien as string,
    namaPendamping: item.namaPendamping as string,
    noTeleponPendamping: item.noTeleponPendamping as string,
    noTeleponKeluarga: item.noTeleponKeluarga as string,
    status: normalizeStatus(item.status),
    catatanRevisi: (item.catatanRevisi as string) || null,
    catatan_revisi: (item.catatan_revisi as string) || null,
    revisionNotes: (item.revisionNotes as string) || null,
    created_at: item.created_at as string,
    updated_at: item.updated_at as string,
    noSuratPraktik: item.noSuratPraktik as string,
    fotoKondisiPasien: item.fotoKondisiPasien as string,
    ktpPasien: item.ktpPasien as string,
    manifetPrivateJet: item.manifetPrivateJet as string,
    rekamMedisPasien: item.rekamMedisPasien as string,
    suratRujukan: item.suratRujukan as string,
    tiketPesawat: item.tiketPesawat as string,
    dokumentPetugasMedis: item.dokumentPetugasMedis as string,
  };
}

function safeImage(src?: string | null) {
  return src && src.trim() !== ''
    ? src
    : 'https://placehold.co/200x200?text=No+Image';
}

function formatDateTime(date?: string) {
  if (!date) return '-';
  const d = new Date(date);
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ================= COMPONENT ================= */

export default function VerifikasiPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  // setLanguage dihapus agar tidak menjadi unused variable
  const { language } = useLanguage(); 
  const t = translations[language as keyof typeof translations] || translations.id;

  const [applications, setApplications] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [revisiNote, setRevisiNote] = useState('');
  const [submittingRevisi, setSubmittingRevisi] = useState(false);
  const [fieldNotes, setFieldNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading) fetchApplications();
  }, [authLoading, user?.role]);

  async function fetchApplications() {
    setLoading(true);
    try {
      const status = user?.role === 'admin' ? 'pending' : '';

      const res = await fetch(
        status ? `/api/evacuations?status=${status}` : '/api/evacuations',
        { credentials: 'include' },
      );

      if (!res.ok) throw new Error();

      const result = await res.json();
      setApplications((result.data || []).map(mapApplication));
    } catch {
      Swal.fire(t.error, t.fetchFailed, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id: string) {
    try {
      const res = await fetch(`/api/evacuations/${id}`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error();

      const result = await res.json();
      const app = mapApplication(result.data);
      setSelectedApp(app);

      const existingNotes = parseCatatanRevisi(app.catatanRevisi);
      const { _general, ...onlyFields } = existingNotes;
      setFieldNotes(onlyFields);
      setRevisiNote(_general || '');

      setShowDetail(true);
    } catch {
      Swal.fire(t.error, t.detailFailed, 'error');
    }
  }

  async function handleApprove(id: string, redirect = false) {
    if (loadingAction) return;

    setLoadingAction(true);
    try {
      const res = await fetch(`/api/evacuations/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error();

      Swal.fire(t.success, t.appApproved, 'success');

      setApplications((prev) => prev.filter((a) => a.id !== id));
      setShowDetail(false);

      if (redirect) router.push('/dashboard/penerbitan');
    } catch {
      Swal.fire(t.error, t.approveFailed, 'error');
    } finally {
      setLoadingAction(false);
    }
  }

  async function submitRevisi() {
    if (!selectedApp) return;

    const hasAnyFieldNote = Object.values(fieldNotes).some((v) => v.trim() !== '');
    if (!revisiNote.trim() && !hasAnyFieldNote) {
      Swal.fire(t.info, t.needRevReason, 'info');
      return;
    }

    setSubmittingRevisi(true);
    try {
      const payload = {
        catatanRevisi: JSON.stringify({
          _general: revisiNote.trim(),
          ...fieldNotes,
        }),
      };

      const res = await fetch(`/api/evacuations/${selectedApp.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      Swal.fire(t.success, t.returnedForRev, 'success');

      setApplications((prev) => prev.filter((a) => a.id !== selectedApp.id));
      setShowDetail(false);
      setRevisiNote('');
      setFieldNotes({});
    } catch {
      Swal.fire(t.error, t.submitRevFailed, 'error');
    } finally {
      setSubmittingRevisi(false);
    }
  }

  function getStatusBadge(status: AppItem['status']) {
    if (status === 'pending') 
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent">{t.waiting}</Badge>;
    if (status === 'reviewed')
      return <Badge className="bg-red-600 hover:bg-red-700 text-white border-transparent">{t.revision}</Badge>;
    if (status === 'valid')
      return <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent">{t.valid}</Badge>;
    return <Badge className="bg-gray-500 hover:bg-gray-600 text-white border-transparent">{t.canceled}</Badge>;
  }

  if (authLoading) return null;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.appData}</CardTitle>
          <CardDescription>{applications.length} {t.dataCount}</CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div>{t.loading}</div>
          ) : applications.length === 0 ? (
            <div>{t.noData}</div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="flex justify-between border p-4 mb-2 rounded"
              >
                <div>
                  <div className="font-semibold">{app.namaPasien}</div>
                  <div className="text-sm text-gray-500">
                    {app.noPenerbangan}
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  {getStatusBadge(app.status)}
                  
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={() => openDetail(app.id)}
                  >
                    {t.detail}
                  </Button>

                  {user?.role === 'admin' && (
                    <>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white" 
                        onClick={() => handleApprove(app.id)}
                      >
                        {t.approve}
                      </Button>
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white" 
                        onClick={() => openDetail(app.id)}
                      >
                        {t.revision}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.detailTitle}</DialogTitle>
            <DialogDescription>{t.fullInfo}</DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto pr-2 text-sm">
              <section>
                <h3 className="font-bold border-b pb-1 mb-2 text-blue-700">
                  {t.flightData}
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <DetailField
                    label={t.patientName}
                    value={selectedApp.namaPasien}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, namaPasien: val }))}
                    currentNote={fieldNotes.namaPasien}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DetailField
                    label={t.serviceType}
                    value={selectedApp.jenisLayanan}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, jenisLayanan: val }))}
                    currentNote={fieldNotes.jenisLayanan}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DetailField
                    label={t.planeType}
                    value={selectedApp.jenisPesawat}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, jenisPesawat: val }))}
                    currentNote={fieldNotes.jenisPesawat}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DetailField
                    label={t.flightNo}
                    value={selectedApp.noPenerbangan}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, noPenerbangan: val }))}
                    currentNote={fieldNotes.noPenerbangan}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DetailField
                    label={t.airline}
                    value={selectedApp.namaMaskapai}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, namaMaskapai: val }))}
                    currentNote={fieldNotes.namaMaskapai}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DetailField
                    label={t.groundhandling}
                    value={selectedApp.namaGroundhandling}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, namaGroundhandling: val }))}
                    currentNote={fieldNotes.namaGroundhandling}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                </div>
              </section>

              <section>
                <h3 className="font-bold border-b pb-1 mb-2 text-blue-700">
                  {t.medicalCondition}
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <DetailField
                    label={t.bloodPressure}
                    value={selectedApp.tekananDarah}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, tekananDarah: val }))}
                    currentNote={fieldNotes.tekananDarah}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DetailField
                    label={t.pulse}
                    value={selectedApp.nadi}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, nadi: val }))}
                    currentNote={fieldNotes.nadi}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DetailField
                    label={t.oxygenSaturation}
                    value={selectedApp.saturasiOksigen}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, saturasiOksigen: val }))}
                    currentNote={fieldNotes.saturasiOksigen}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DetailField
                    label={t.consciousness}
                    value={selectedApp.tingkatKesadaran}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, tingkatKesadaran: val }))}
                    currentNote={fieldNotes.tingkatKesadaran}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                </div>
              </section>

              <section>
                <h3 className="font-bold border-b pb-1 mb-2 text-blue-700">
                  {t.uploadDocs}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <DocField
                    label={t.sip}
                    src={selectedApp.noSuratPraktik}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, noSuratPraktik: val }))}
                    currentNote={fieldNotes.noSuratPraktik}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DocField
                    label={t.referral}
                    src={selectedApp.suratRujukan}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, suratRujukan: val }))}
                    currentNote={fieldNotes.suratRujukan}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DocField
                    label={t.manifest}
                    src={selectedApp.manifetPrivateJet}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, manifetPrivateJet: val }))}
                    currentNote={fieldNotes.manifetPrivateJet}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DocField
                    label={t.conditionPhoto}
                    src={selectedApp.fotoKondisiPasien}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, fotoKondisiPasien: val }))}
                    currentNote={fieldNotes.fotoKondisiPasien}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DocField
                    label={t.ktp}
                    src={selectedApp.ktpPasien}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, ktpPasien: val }))}
                    currentNote={fieldNotes.ktpPasien}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                  <DocField
                    label={t.medDocs}
                    src={selectedApp.dokumentPetugasMedis}
                    onNoteChange={(val) => setFieldNotes((prev) => ({ ...prev, dokumentPetugasMedis: val }))}
                    currentNote={fieldNotes.dokumentPetugasMedis}
                    isAdmin={isAdmin}
                    placeholder={t.revReason}
                  />
                </div>
              </section>

              <div className="pt-4 border-t space-y-4">
                <div>
                  <p>
                    <b>{t.created}:</b> {formatDateTime(selectedApp.created_at)}
                  </p>
                  <p>
                    <b>{t.updated}:</b> {formatDateTime(selectedApp.updated_at)}
                  </p>
                </div>

                {selectedApp.catatanRevisi && (
                  <div className="p-3 bg-red-50 rounded border border-red-200 shadow-sm">
                    <p className="font-bold text-xs text-red-700 uppercase mb-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                      {t.lastRevNote}
                    </p>
                    <div className="space-y-2 text-red-900">
                      <p className="font-semibold underline">
                        {getGeneralNote(selectedApp.catatanRevisi) || t.defaultRevMsg}
                      </p>
                      {Object.keys(parseCatatanRevisi(selectedApp.catatanRevisi))
                        .filter((k) => k !== '_general' && parseCatatanRevisi(selectedApp.catatanRevisi)[k])
                        .map((key) => (
                          <div key={key} className="flex gap-1.5 items-start text-xs">
                            <span className="bg-red-200 px-1 rounded font-bold uppercase shrink-0">
                              {key}:
                            </span>
                            <span>{parseCatatanRevisi(selectedApp.catatanRevisi)[key]}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {user?.role === 'admin' && (
                  <div className="space-y-3 bg-red-50 p-4 rounded-lg border border-red-100">
                    <Label className="font-bold text-red-700">
                      {t.genRevNote}
                    </Label>
                    <textarea
                      className="w-full border p-2 rounded h-24 text-sm bg-white"
                      placeholder={t.revPlaceholder}
                      value={revisiNote}
                      onChange={(e) => setRevisiNote(e.target.value)}
                    />
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white" 
                        onClick={() => handleApprove(selectedApp.id)}
                      >
                        {t.approveAll}
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={submittingRevisi}
                        onClick={submitRevisi}
                      >
                        {submittingRevisi ? t.sending : t.sendRev}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailField({
  label,
  value,
  onNoteChange,
  currentNote,
  isAdmin = false,
  placeholder = "Alasan revisi..."
}: {
  label: string;
  value: string | null;
  onNoteChange: (val: string) => void;
  currentNote?: string;
  isAdmin?: boolean;
  placeholder?: string;
}) {
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="border rounded-md p-2 bg-gray-50 relative group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="font-medium text-gray-900">{value || '-'}</p>
        </div>
        {isAdmin && (
          <Button
            variant={currentNote ? 'destructive' : 'outline'}
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowInput(!showInput)}
          >
            {currentNote ? '!' : '+'}
          </Button>
        )}
      </div>
      {(showInput || currentNote) && (
        isAdmin ? (
          <input
            className="mt-2 w-full text-xs border border-red-200 p-1 rounded bg-white text-red-600 placeholder:text-red-300"
            placeholder={placeholder}
            value={currentNote || ''}
            onChange={(e) => onNoteChange(e.target.value)}
            autoFocus={showInput}
          />
        ) : (
          <p className="mt-1 text-[11px] text-red-600 font-bold bg-red-50 border border-red-100 p-1 rounded">
            REVISI: {currentNote}
          </p>
        )
      )}
    </div>
  );
}

function DocField({
  label,
  src,
  onNoteChange,
  currentNote,
  isAdmin = false,
  placeholder = "Alasan revisi..."
}: {
  label: string;
  src: string | null | undefined;
  onNoteChange: (val: string) => void;
  currentNote?: string;
  isAdmin?: boolean;
  placeholder?: string;
}) {
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="border rounded-lg p-2 bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
        {isAdmin && (
          <Button
            variant={currentNote ? 'destructive' : 'outline'}
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowInput(!showInput)}
          >
            {currentNote ? '!' : '+'}
          </Button>
        )}
      </div>
      <div className="flex flex-col items-center gap-2">
        <Image
          src={safeImage(src)}
          alt={label}
          width={120}
          height={120}
          className="rounded border bg-white object-cover shadow-sm"
        />
      </div>
      {(showInput || currentNote) && (
        isAdmin ? (
          <input
            className="mt-2 w-full text-xs border border-red-200 p-1 rounded bg-white text-red-600"
            placeholder={placeholder}
            value={currentNote || ''}
            onChange={(e) => onNoteChange(e.target.value)}
            autoFocus={showInput}
          />
        ) : (
          <p className="mt-2 text-[11px] text-red-600 font-bold bg-red-50 border border-red-100 p-1 rounded text-center">
            REVISI: {currentNote}
          </p>
        )
      )}
    </div>
  );
}