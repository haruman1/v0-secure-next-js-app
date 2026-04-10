'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { useLanguage } from '@/app/context/language-context';
import { useTour } from '@/app/hooks/useTour';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plane,
  FileText,
  ShieldCheck,
  Activity,
  UserCircle2,
  FileCheck,
  Plus,
  Printer,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import Image from 'next/image';
import { cn } from '@/lib/utils';

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
    namaPasien: (item.namaPasien ||
      item.nama_pasien ||
      item.patient_name) as string,
    jenisLayanan: item.jenisLayanan as string,
    jenisPesawat: item.jenisPesawat as string,
    namaGroundhandling: item.namaGroundhandling as string,
    namaPetugas: item.namaPetugas as string,
    noTeleponKantor: item.noTeleponKantor as string,
    emailPerusahaan: item.emailPerusahaan as string,
    namaMaskapai: item.namaMaskapai as string,
    noPenerbangan: (item.noPenerbangan || item.no_penerbangan) as string,
    noKursi: item.noKursi as string,
    tanggalPerjalanan: (item.tanggalPerjalanan ||
      item.tanggal_perjalanan) as string,
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
  const { language, t } = useLanguage();
  useTour(user?.role === 'admin');

  const [applications, setApplications] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [revisiNote, setRevisiNote] = useState('');
  const [submittingRevisi, setSubmittingRevisi] = useState(false);
  const [fieldNotes, setFieldNotes] = useState<Record<string, string>>({});

  const [previewModal, setPreviewModal] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);

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
      Swal.fire(t('common.error'), t('pages.verifikasi.fetchFailed'), 'error');
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
      Swal.fire(t('common.error'), t('pages.verifikasi.detailFailed'), 'error');
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

      Swal.fire(
        t('common.success'),
        t('pages.verifikasi.appApproved'),
        'success',
      );

      setApplications((prev) => prev.filter((a) => a.id !== id));
      setShowDetail(false);

      if (redirect) router.push('/dashboard/penerbitan');
    } catch {
      Swal.fire(
        t('common.error'),
        t('pages.verifikasi.approveFailed'),
        'error',
      );
    } finally {
      setLoadingAction(false);
    }
  }

  async function submitRevisi() {
    if (!selectedApp) return;

    const hasAnyFieldNote = Object.values(fieldNotes).some(
      (v) => v.trim() !== '',
    );
    if (!revisiNote.trim() && !hasAnyFieldNote) {
      Swal.fire(t('common.info'), t('pages.verifikasi.needRevReason'), 'info');
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

      Swal.fire(
        t('common.success'),
        t('pages.verifikasi.returnedForRev'),
        'success',
      );

      setApplications((prev) => prev.filter((a) => a.id !== selectedApp.id));
      setShowDetail(false);
      setRevisiNote('');
      setFieldNotes({});
    } catch {
      Swal.fire(
        t('common.error'),
        t('pages.verifikasi.submitRevFailed'),
        'error',
      );
    } finally {
      setSubmittingRevisi(false);
    }
  }

  function getStatusBadge(status: AppItem['status']) {
    if (status === 'pending')
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent">
          {t('evacuation.pending')}
        </Badge>
      );
    if (status === 'reviewed')
      return (
        <Badge className="bg-red-600 hover:bg-red-700 text-white border-transparent">
          {t('evacuation.reviewed')}
        </Badge>
      );
    if (status === 'valid')
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent">
          {t('evacuation.valid')}
        </Badge>
      );
    return (
      <Badge className="bg-gray-500 hover:bg-gray-600 text-white border-transparent">
        {t('evacuation.canceled')}
      </Badge>
    );
  }

  if (authLoading) return null;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto bg-slate-50/50 min-h-screen text-slate-800">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('pages.verifikasi.title')}
        </h1>
        <p className="text-slate-500 text-base md:text-lg mt-2 max-w-2xl">
          {t('pages.verifikasi.fullInfo')}
        </p>
      </div>

      <div
        id="tour-verif-stats"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                {t('pages.verifikasi.summary')}
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {applications.length} {t('pages.verifikasi.appData')}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card
        id="tour-verif-table"
        className="border-slate-200 shadow-lg rounded-2xl overflow-hidden bg-white"
      >
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6 pt-8 px-6 md:px-10">
          <div className="flex items-center gap-3">
            <div className="bg-sky-100 p-2.5 rounded-xl text-sky-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold text-slate-900">
                {t('pages.verifikasi.appData')}
              </CardTitle>
              <CardDescription className="text-base text-slate-500 mt-1 font-medium">
                {applications.length} {t('pages.verifikasi.title')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-10">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-500 text-lg">
              <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
              {t('common.loading')}
            </div>
          ) : applications.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
              <p className="text-lg font-medium">{t('messages.noData')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-xl leading-tight">
                        {app.namaPasien || '-'}
                      </h3>
                      {getStatusBadge(app.status)}
                    </div>

                    <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
                      <span className="text-sm font-mono font-semibold">
                        ID: {app.id}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center gap-2 text-slate-700 font-medium font-sans">
                        <Plane className="w-4 h-4 text-slate-400" />
                        {app.noPenerbangan || app.namaMaskapai || '-'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Clock className="w-4 h-4" />
                        {app.tanggalPerjalanan || '-'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 gap-3">
                    <Button
                      id="tour-verif-action"
                      variant="outline"
                      className="w-full h-11 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl"
                      onClick={() => openDetail(app.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t('pages.verifikasi.detail')}
                    </Button>

                    {isAdmin && (
                      <div
                        id="tour-verif-actions"
                        className="grid grid-cols-2 gap-2"
                      >
                        <Button
                          className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(app.id);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {t('pages.verifikasi.approve')}
                        </Button>
                        <Button
                          variant="destructive"
                          className="h-11 font-semibold rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(app.id);
                          }}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {t('common.revision')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl border-none shadow-2xl">
          <DialogHeader className="p-6 md:p-8 bg-slate-900 text-white shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-sky-400" />{' '}
              {t('pages.verifikasi.detailTitle')}
            </DialogTitle>
            <DialogDescription className="text-base text-slate-400 mt-1">
              {t('pages.verifikasi.fullInfo')}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50/50 space-y-8">
              {/* SECTION: DATA PENERBANGAN */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Plane className="w-5 h-5 text-sky-600" />{' '}
                  {t('pages.verifikasi.flightData')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <DetailField
                    label={t('evacuation.patientName')}
                    value={selectedApp.namaPasien}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({ ...prev, namaPasien: val }))
                    }
                    currentNote={fieldNotes.namaPasien}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                  <DetailField
                    label={t('evacuation.serviceType')}
                    value={selectedApp.jenisLayanan}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({ ...prev, jenisLayanan: val }))
                    }
                    currentNote={fieldNotes.jenisLayanan}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                  <DetailField
                    label={t('evacuation.aircraftType')}
                    value={selectedApp.jenisPesawat}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({ ...prev, jenisPesawat: val }))
                    }
                    currentNote={fieldNotes.jenisPesawat}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                  <DetailField
                    label={t('evacuation.flightNumber')}
                    value={selectedApp.noPenerbangan}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({ ...prev, noPenerbangan: val }))
                    }
                    currentNote={fieldNotes.noPenerbangan}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                  <DetailField
                    label={t('evacuation.airlineName')}
                    value={selectedApp.namaMaskapai}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({ ...prev, namaMaskapai: val }))
                    }
                    currentNote={fieldNotes.namaMaskapai}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                  <DetailField
                    label={t('evacuation.groundHandlingName')}
                    value={selectedApp.namaGroundhandling}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({
                        ...prev,
                        namaGroundhandling: val,
                      }))
                    }
                    currentNote={fieldNotes.namaGroundhandling}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                </div>
              </div>

              {/* SECTION: KONDISI MEDIS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Activity className="w-5 h-5 text-emerald-600" />{' '}
                  {t('pages.verifikasi.medicalCondition')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <DetailField
                    label={t('evacuation.bloodPressure')}
                    value={selectedApp.tekananDarah}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({ ...prev, tekananDarah: val }))
                    }
                    currentNote={fieldNotes.tekananDarah}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                  <DetailField
                    label={t('evacuation.heartRate')}
                    value={selectedApp.nadi}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({ ...prev, nadi: val }))
                    }
                    currentNote={fieldNotes.nadi}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                  <DetailField
                    label={t('evacuation.oxygenSaturation')}
                    value={selectedApp.saturasiOksigen}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({
                        ...prev,
                        saturasiOksigen: val,
                      }))
                    }
                    currentNote={fieldNotes.saturasiOksigen}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                  <DetailField
                    label={t('evacuation.consciousnessLevel')}
                    value={selectedApp.tingkatKesadaran}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({
                        ...prev,
                        tingkatKesadaran: val,
                      }))
                    }
                    currentNote={fieldNotes.tingkatKesadaran}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                </div>
              </div>

              {/* SECTION: DOKUMEN LANJUTAN */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="w-5 h-5 text-purple-600" />{' '}
                  {t('pages.verifikasi.uploadDocs')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DocField
                    label={t('evacuation.practiceNumber')}
                    src={selectedApp.noSuratPraktik}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({
                        ...prev,
                        noSuratPraktik: val,
                      }))
                    }
                    currentNote={fieldNotes.noSuratPraktik}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                  <DocField
                    label={t('evacuation.referralLetter')}
                    src={selectedApp.suratRujukan}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({ ...prev, suratRujukan: val }))
                    }
                    currentNote={fieldNotes.suratRujukan}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                  <DocField
                    label={t('evacuation.manifestJet')}
                    src={selectedApp.manifetPrivateJet}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({
                        ...prev,
                        manifetPrivateJet: val,
                      }))
                    }
                    currentNote={fieldNotes.manifetPrivateJet}
                    isAdmin={isAdmin}
                    placeholder={t('pages.verifikasi.revPlaceholder')}
                  />
                  <DocField
                    label={t('evacuation.patientPhoto')}
                    src={selectedApp.fotoKondisiPasien}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({
                        ...prev,
                        fotoKondisiPasien: val,
                      }))
                    }
                    currentNote={fieldNotes.fotoKondisiPasien}
                    isAdmin={isAdmin}
                    onPreview={() => {
                      setPreviewFileUrl(selectedApp.fotoKondisiPasien || null);
                      setPreviewModal(true);
                    }}
                  />
                  <DocField
                    label={t('evacuation.patientID')}
                    src={selectedApp.ktpPasien}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({ ...prev, ktpPasien: val }))
                    }
                    currentNote={fieldNotes.ktpPasien}
                    isAdmin={isAdmin}
                    onPreview={() => {
                      setPreviewFileUrl(selectedApp.ktpPasien || null);
                      setPreviewModal(true);
                    }}
                  />
                  <DocField
                    label={t('evacuation.manifestJet')}
                    src={selectedApp.manifetPrivateJet}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({
                        ...prev,
                        manifetPrivateJet: val,
                      }))
                    }
                    currentNote={fieldNotes.manifetPrivateJet}
                    isAdmin={isAdmin}
                    onPreview={() => {
                      setPreviewFileUrl(selectedApp.manifetPrivateJet || null);
                      setPreviewModal(true);
                    }}
                  />
                  <DocField
                    label={t('evacuation.medicalRecord')}
                    src={selectedApp.rekamMedisPasien}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({
                        ...prev,
                        rekamMedisPasien: val,
                      }))
                    }
                    currentNote={fieldNotes.rekamMedisPasien}
                    isAdmin={isAdmin}
                    onPreview={() => {
                      setPreviewFileUrl(selectedApp.rekamMedisPasien || null);
                      setPreviewModal(true);
                    }}
                  />
                  <DocField
                    label={t('evacuation.referralLetter')}
                    src={selectedApp.suratRujukan}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({ ...prev, suratRujukan: val }))
                    }
                    currentNote={fieldNotes.suratRujukan}
                    isAdmin={isAdmin}
                    onPreview={() => {
                      setPreviewFileUrl(selectedApp.suratRujukan || null);
                      setPreviewModal(true);
                    }}
                  />
                  <DocField
                    label={t('evacuation.ticket')}
                    src={selectedApp.tiketPesawat}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({ ...prev, tiketPesawat: val }))
                    }
                    currentNote={fieldNotes.tiketPesawat}
                    isAdmin={isAdmin}
                    onPreview={() => {
                      setPreviewFileUrl(selectedApp.tiketPesawat || null);
                      setPreviewModal(true);
                    }}
                  />
                  <DocField
                    label={t('evacuation.medicalStaffDoc')}
                    src={selectedApp.dokumentPetugasMedis}
                    onNoteChange={(val) =>
                      setFieldNotes((prev) => ({
                        ...prev,
                        dokumentPetugasMedis: val,
                      }))
                    }
                    currentNote={fieldNotes.dokumentPetugasMedis}
                    isAdmin={isAdmin}
                    onPreview={() => {
                      setPreviewFileUrl(
                        selectedApp.dokumentPetugasMedis || null,
                      );
                      setPreviewModal(true);
                    }}
                  />
                </div>
              </div>

              {/* TIMESTAMPS & REVISION HISTORY */}
              <div className="pt-4 space-y-4">
                <div className="flex flex-wrap gap-6 text-slate-500 font-medium bg-slate-100/50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {t('pages.verifikasi.created')}:{' '}
                      {formatDateTime(selectedApp.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>
                      {t('pages.verifikasi.updated')}:{' '}
                      {formatDateTime(selectedApp.updated_at)}
                    </span>
                  </div>
                </div>

                {selectedApp.catatanRevisi && (
                  <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-100 shadow-sm space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-100 p-2 rounded-lg text-red-600">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-red-800 uppercase tracking-widest mb-1">
                          {t('pages.verifikasi.lastRevNote')}
                        </p>
                        <p className="text-red-900 font-medium text-lg italic bg-white/50 p-3 rounded-lg border border-red-200">
                          {getGeneralNote(selectedApp.catatanRevisi) ||
                            t('pages.revisi.desc')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.keys(
                        parseCatatanRevisi(selectedApp.catatanRevisi),
                      )
                        .filter(
                          (k) =>
                            k !== '_general' &&
                            parseCatatanRevisi(selectedApp.catatanRevisi)[k],
                        )
                        .map((key) => (
                          <div
                            key={key}
                            className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-red-100 text-[13px]"
                          >
                            <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md uppercase text-[10px]">
                              {key}
                            </span>
                            <span className="text-red-900 font-medium">
                              {
                                parseCatatanRevisi(selectedApp.catatanRevisi)[
                                  key
                                ]
                              }
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* ADMIN ACTIONS SECTION */}
                {isAdmin && (
                  <div className="space-y-6 bg-blue-50/50 p-8 rounded-3xl border border-blue-100 shadow-inner print:hidden">
                    <div className="space-y-3">
                      <Label className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        {t('pages.verifikasi.genRevNote')}
                      </Label>
                      <Textarea
                        className="w-full border-slate-200 p-4 rounded-xl h-32 text-base bg-white focus:ring-2 focus:ring-blue-200"
                        placeholder={t('pages.verifikasi.revPlaceholder')}
                        value={revisiNote}
                        onChange={(e) => setRevisiNote(e.target.value)}
                      />
                    </div>

                    <div
                      id="tour-verif-actions"
                      className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-blue-100"
                    >
                      <Button
                        variant="destructive"
                        className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-red-200"
                        onClick={submitRevisi}
                        disabled={submittingRevisi}
                      >
                        {submittingRevisi
                          ? t('common.loading')
                          : t('pages.verifikasi.sendRev')}
                      </Button>
                      <Button
                        className="h-12 px-10 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                        onClick={() => handleApprove(selectedApp.id)}
                        disabled={loadingAction}
                      >
                        {loadingAction
                          ? t('common.loading')
                          : t('pages.verifikasi.approveAll')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL PREVIEW DOKUMEN */}
      <Dialog open={previewModal} onOpenChange={setPreviewModal}>
        <DialogContent
          className="max-w-4xl p-0 rounded-2xl overflow-hidden border-none shadow-2xl"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <DialogHeader className="p-6 bg-slate-900 text-white border-b border-slate-800">
            <DialogTitle className="text-xl font-bold">
              {t('common.preview')}
            </DialogTitle>
          </DialogHeader>
          {previewFileUrl && (
            <div className="bg-slate-100 flex items-center justify-center p-6">
              <div className="w-full h-[70vh] rounded-xl overflow-hidden bg-white shadow-inner border border-slate-200 flex items-center justify-center">
                {previewFileUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={safeImage(previewFileUrl)}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                ) : (
                  <img
                    src={safeImage(previewFileUrl)}
                    alt="Preview"
                    className="w-full h-full object-contain p-2"
                  />
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
  placeholder = 'Alasan revisi...',
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
    <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm hover:border-sky-300 transition-colors relative group">
      <div className="flex justify-between items-start">
        <div>
          <p className="sm:text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            {label}
          </p>
          <p className="sm:text-sm text-xs font-semibold text-slate-900">
            {value || '-'}
          </p>
        </div>
        {isAdmin && (
          <Button
            variant={currentNote ? 'destructive' : 'ghost'}
            size="icon"
            className={cn(
              'h-7 w-7 rounded-lg transition-all print:hidden',
              currentNote
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'text-slate-400 hover:bg-slate-100 hover:text-sky-600',
            )}
            onClick={() => setShowInput(!showInput)}
          >
            {currentNote ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
      {(showInput || currentNote) &&
        (isAdmin ? (
          <input
            className="mt-2 w-full text-xs border border-red-100 p-2 rounded-lg bg-red-50/30 text-red-700 placeholder:text-red-300 focus:outline-none focus:ring-1 focus:ring-red-200"
            placeholder={placeholder}
            value={currentNote || ''}
            onChange={(e) => onNoteChange(e.target.value)}
            autoFocus={showInput}
          />
        ) : (
          <p className="mt-2 text-[11px] text-red-600 font-bold bg-red-50/50 border border-red-100 p-2 rounded-lg flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            REVISI: {currentNote}
          </p>
        ))}
    </div>
  );
}

function DocField({
  label,
  src,
  onNoteChange,
  currentNote,
  isAdmin = false,
  placeholder = 'Alasan revisi...',
}: {
  label: string;
  src: string | null | undefined;
  onNoteChange: (val: string) => void;
  currentNote?: string;
  isAdmin?: boolean;
  placeholder?: string;
  onPreview?: () => void;
}) {
  const [showInput, setShowInput] = useState(false);
  const isPdf = src?.toLowerCase().endsWith('.pdf');

  return (
    <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm hover:border-sky-300 transition-all flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        {isAdmin && (
          <Button
            variant={currentNote ? 'destructive' : 'ghost'}
            size="icon"
            className={cn(
              'h-7 w-7 rounded-lg transition-all print:hidden',
              currentNote
                ? 'bg-red-50 text-red-600'
                : 'text-slate-400 hover:bg-slate-100 hover:text-sky-600',
            )}
            onClick={() => setShowInput(!showInput)}
          >
            {currentNote ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
      <div
        className="relative group w-full aspect-square max-w-[160px] cursor-pointer overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
        onClick={() => {
          if (src) {
            window.open(safeImage(src), '_blank');
          }
        }}
      >
        {isPdf ? (
          <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 group-hover:bg-slate-200 transition-colors">
            <FileText className="w-12 h-12 mb-2 text-rose-500 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-[10px] font-bold tracking-wider text-slate-500 group-hover:text-slate-800">
              PDF FILE
            </span>
          </div>
        ) : (
          <Image
            src={safeImage(src)}
            alt={label}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
            Review
          </div>
        </div>
      </div>

      {(showInput || currentNote) &&
        (isAdmin ? (
          <input
            className="mt-3 w-full text-xs border border-red-100 p-2 rounded-lg bg-red-50/30 text-red-700 placeholder:text-red-300 focus:outline-none focus:ring-1 focus:ring-red-200"
            placeholder={placeholder}
            value={currentNote || ''}
            onChange={(e) => onNoteChange(e.target.value)}
            autoFocus={showInput}
          />
        ) : (
          <p className="mt-3 w-full text-[11px] text-red-600 font-bold bg-red-50/50 border border-red-100 p-2 rounded-lg flex items-center gap-1.5 justify-center">
            <AlertCircle className="w-3 h-3" />
            REVISI: {currentNote}
          </p>
        ))}
    </div>
  );
}
