'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { Eye, AlertCircle } from 'lucide-react';
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
};

type EditableForm = {
  namaPasien: string;
  jenisLayanan: string;
  jenisPesawat: string;
  namaGroundhandling: string;
  namaPetugas: string;
  noTeleponKantor: string;
  emailPerusahaan: string;
  namaMaskapai: string;
  noPenerbangan: string;
  noKursi: string;
  tanggalPerjalanan: string;
  jamPerjalanan: string;
  jenisKelamin: string;
  tanggalLahir: string;
  oksigen: string;
  posisiPasien: string;
  tingkatKesadaran: string;
  tekananDarah: string;
  nadi: string;
  frekuensiPernafasan: string;
  saturasiOksigen: string;
  jumlahPendamping: string;
  hubunganPasien: string;
  namaPendamping: string;
  noTeleponPendamping: string;
  noTeleponKeluarga: string;
  noSuratPraktik: string;
  fotoKondisiPasien: string;
  ktpPasien: string;
  manifetPrivateJet: string;
  rekamMedisPasien: string;
  suratRujukan: string;
  tiketPesawat: string;
  dokumentPetugasMedis: string;
};

const EMPTY_FORM: EditableForm = {
  namaPasien: '',
  jenisLayanan: '',
  jenisPesawat: '',
  namaGroundhandling: '',
  namaPetugas: '',
  noTeleponKantor: '',
  emailPerusahaan: '',
  namaMaskapai: '',
  noPenerbangan: '',
  noKursi: '',
  tanggalPerjalanan: '',
  jamPerjalanan: '',
  jenisKelamin: '',
  tanggalLahir: '',
  oksigen: '',
  posisiPasien: '',
  tingkatKesadaran: '',
  tekananDarah: '',
  nadi: '',
  frekuensiPernafasan: '',
  saturasiOksigen: '',
  jumlahPendamping: '',
  hubunganPasien: '',
  namaPendamping: '',
  noTeleponPendamping: '',
  noTeleponKeluarga: '',
  noSuratPraktik: '',
  fotoKondisiPasien: '',
  ktpPasien: '',
  manifetPrivateJet: '',
  rekamMedisPasien: '',
  suratRujukan: '',
  tiketPesawat: '',
  dokumentPetugasMedis: '',
};

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

function calculateDays(dateStr?: string | null) {
  if (!dateStr) return 0;
  const created = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatTime(dateStr?: string | null) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RevisiPage() {
  const [applications, setApplications] = useState<EvacuationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedApp, setSelectedApp] = useState<EvacuationApplication | null>(
    null,
  );
  const [showDetail, setShowDetail] = useState(false);
  const [editForm, setEditForm] = useState<EditableForm>(EMPTY_FORM);
  const { user, isLoading: authLoading } = useAuth();
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState(false);

  const revisionData = parseCatatanRevisi(
    selectedApp?.catatanRevisi ||
      selectedApp?.catatan_revisi ||
      selectedApp?.revisionNotes,
  );

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const res = await fetch('/api/evacuations?status=reviewed', {
        credentials: 'include',
      });
      const result = await res.json();
      if (res.ok) {
        setApplications(result.data || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id: string) {
    try {
      const res = await fetch(`/api/evacuations/${id}`, {
        credentials: 'include',
      });
      const result = await res.json();
      if (res.ok) {
        const data = (result.data || result) as EvacuationApplication;
        setSelectedApp(data);
        setEditForm({
          namaPasien: data.namaPasien || '',
          jenisLayanan: data.jenisLayanan || '',
          jenisPesawat: data.jenisPesawat || '',
          namaGroundhandling: data.namaGroundhandling || '',
          namaPetugas: data.namaPetugas || '',
          noTeleponKantor: data.noTeleponKantor || '',
          emailPerusahaan: data.emailPerusahaan || '',
          namaMaskapai: data.namaMaskapai || '',
          noPenerbangan: data.noPenerbangan || '',
          noKursi: data.noKursi || '',
          tanggalPerjalanan: toDateInputValue(data.tanggalPerjalanan),
          jamPerjalanan: data.jamPerjalanan || '',
          jenisKelamin: data.jenisKelamin || '',
          tanggalLahir: toDateInputValue(data.tanggalLahir),
          oksigen: data.oksigen || '',
          posisiPasien: data.posisiPasien || '',
          tingkatKesadaran: data.tingkatKesadaran || '',
          tekananDarah: data.tekananDarah || '',
          nadi: data.nadi || '',
          frekuensiPernafasan: data.frekuensiPernafasan || '',
          saturasiOksigen: data.saturasiOksigen || '',
          jumlahPendamping: data.jumlahPendamping || '0',
          hubunganPasien: data.hubunganPasien || '',
          namaPendamping: data.namaPendamping || '',
          noTeleponPendamping: data.noTeleponPendamping || '',
          noTeleponKeluarga: data.noTeleponKeluarga || '',
          noSuratPraktik: data.noSuratPraktik || '',
          fotoKondisiPasien: data.fotoKondisiPasien || '',
          ktpPasien: data.ktpPasien || '',
          manifetPrivateJet: data.manifetPrivateJet || '',
          rekamMedisPasien: data.rekamMedisPasien || '',
          suratRujukan: data.suratRujukan || '',
          tiketPesawat: data.tiketPesawat || '',
          dokumentPetugasMedis: data.dokumentPetugasMedis || '',
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

      setEditForm((prev) => ({
        ...prev,
        [field]: result.data.path,
      }));

      alert('Berhasil upload revisi ' + field);
    } catch (error: any) {
      alert('Upload gagal: ' + error.message);
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
        alert(result.error || 'Gagal mengirim ulang revisi');
        return;
      }

      alert('Data revisi berhasil disimpan dan dikirim ulang untuk verifikasi');
      setApplications((prev) =>
        prev.filter((item) => item.id !== selectedApp.id),
      );
      setShowDetail(false);
      setSelectedApp(null);
      setEditForm(EMPTY_FORM);
    } catch (error) {
      console.error('Submit revisi error:', error);
      alert('Terjadi kesalahan saat mengirim ulang untuk verifikasi');
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditChange<K extends keyof EditableForm>(
    field: K,
    value: EditableForm[K],
  ) {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function formatDate(date: string | null | undefined) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  if (authLoading) return null;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Permohonan Revisi</h1>
        <p className="text-gray-600">Daftar permohonan yang perlu diperbaiki</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Revisi</CardTitle>
          <CardDescription>
            {applications.length} permohonan perlu revisi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Tidak ada permohonan revisi
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold">{app.namaPasien || '-'}</div>
                    <div className="text-sm text-gray-500">ID: {app.id}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(app.tanggalPerjalanan)}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                      <Badge variant="outline" className="text-[10px]">
                        Input: {formatDate(app.created_at)} {formatTime(app.created_at)}
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] font-bold">
                        Sudah {calculateDays(app.created_at)} Hari
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Revisi</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetail(app.id)}
                    >
                      Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DETAIL */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Permohonan Revisi</DialogTitle>
            <DialogDescription>
              Data permohonan yang perlu diperbaiki
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 text-sm max-h-[75vh] overflow-y-auto pr-2">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">
                  Pesan dari Verifikator
                </p>
                <p className="text-amber-900 whitespace-pre-wrap">
                  {getGeneralNote(
                    selectedApp.catatanRevisi ||
                      selectedApp.catatan_revisi ||
                      selectedApp.revisionNotes,
                  ) || 'Gunakan form di bawah untuk memperbaiki data.'}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold border-b pb-1 text-blue-700">
                  Data Penerbangan
                </h3>
                <div className="space-y-4">
                  <RevisiField
                    label="Nama Pasien"
                    id="namaPasien"
                    value={editForm.namaPasien}
                    onChange={(v) => handleEditChange('namaPasien', v)}
                    note={revisionData.namaPasien}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <RevisiField
                      label="No Penerbangan"
                      id="noPenerbangan"
                      value={editForm.noPenerbangan}
                      onChange={(v) => handleEditChange('noPenerbangan', v)}
                      note={revisionData.noPenerbangan}
                    />
                    <RevisiField
                      label="Maskapai"
                      id="namaMaskapai"
                      value={editForm.namaMaskapai}
                      onChange={(v) => handleEditChange('namaMaskapai', v)}
                      note={revisionData.namaMaskapai}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <RevisiField
                      label="Jenis Layanan"
                      id="jenisLayanan"
                      value={editForm.jenisLayanan}
                      onChange={(v) => handleEditChange('jenisLayanan', v)}
                      note={revisionData.jenisLayanan}
                    />
                    <RevisiField
                      label="Tanggal Perjalanan"
                      id="tanggalPerjalanan"
                      type="date"
                      value={editForm.tanggalPerjalanan}
                      onChange={(v) => handleEditChange('tanggalPerjalanan', v)}
                      note={revisionData.tanggalPerjalanan}
                    />
                  </div>
                </div>

                <h3 className="font-bold border-b pb-1 pt-4 text-blue-700">
                  Kondisi Medis
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <RevisiField
                    label="Tekanan Darah"
                    id="tekananDarah"
                    value={editForm.tekananDarah}
                    onChange={(v) => handleEditChange('tekananDarah', v)}
                    note={revisionData.tekananDarah}
                  />
                  <RevisiField
                    label="Nadi"
                    id="nadi"
                    value={editForm.nadi}
                    onChange={(v) => handleEditChange('nadi', v)}
                    note={revisionData.nadi}
                  />
                  <RevisiField
                    label="Saturasi Oksigen"
                    id="saturasiOksigen"
                    value={editForm.saturasiOksigen}
                    onChange={(v) => handleEditChange('saturasiOksigen', v)}
                    note={revisionData.saturasiOksigen}
                  />
                  <RevisiField
                    label="Tingkat Kesadaran"
                    id="tingkatKesadaran"
                    value={editForm.tingkatKesadaran}
                    onChange={(v) => handleEditChange('tingkatKesadaran', v)}
                    note={revisionData.tingkatKesadaran}
                  />
                </div>

                <h3 className="font-bold border-b pb-1 pt-4 text-blue-700">
                  Unggah Dokumen Baru
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RevisiUpload
                    label="Surat Izin Praktik"
                    fieldName="noSuratPraktik"
                    currentPath={editForm.noSuratPraktik}
                    onUpload={(f) => handleFileUpload(f, 'noSuratPraktik')}
                    note={revisionData.noSuratPraktik}
                    onPreview={() => {
                      setPreviewFileUrl(editForm.noSuratPraktik);
                      setPreviewModal(true);
                    }}
                  />
                  <RevisiUpload
                    label="Surat Rujukan"
                    fieldName="suratRujukan"
                    currentPath={editForm.suratRujukan}
                    onUpload={(f) => handleFileUpload(f, 'suratRujukan')}
                    note={revisionData.suratRujukan}
                    onPreview={() => {
                      setPreviewFileUrl(editForm.suratRujukan);
                      setPreviewModal(true);
                    }}
                  />
                  <RevisiUpload
                    label="Manifest/Tiket"
                    fieldName="manifetPrivateJet"
                    currentPath={editForm.manifetPrivateJet}
                    onUpload={(f) => handleFileUpload(f, 'manifetPrivateJet')}
                    note={revisionData.manifetPrivateJet}
                    onPreview={() => {
                      setPreviewFileUrl(editForm.manifetPrivateJet);
                      setPreviewModal(true);
                    }}
                  />
                  <RevisiUpload
                    label="Foto Kondisi"
                    fieldName="fotoKondisiPasien"
                    currentPath={editForm.fotoKondisiPasien}
                    onUpload={(f) => handleFileUpload(f, 'fotoKondisiPasien')}
                    note={revisionData.fotoKondisiPasien}
                    onPreview={() => {
                      setPreviewFileUrl(editForm.fotoKondisiPasien);
                      setPreviewModal(true);
                    }}
                  />
                  <RevisiUpload
                    label="KTP Pasien"
                    fieldName="ktpPasien"
                    currentPath={editForm.ktpPasien}
                    onUpload={(f) => handleFileUpload(f, 'ktpPasien')}
                    note={revisionData.ktpPasien}
                    onPreview={() => {
                      setPreviewFileUrl(editForm.ktpPasien);
                      setPreviewModal(true);
                    }}
                  />
                  <RevisiUpload
                    label="Dokumen Medis"
                    fieldName="dokumentPetugasMedis"
                    currentPath={editForm.dokumentPetugasMedis}
                    onUpload={(f) => handleFileUpload(f, 'dokumentPetugasMedis')}
                    note={revisionData.dokumentPetugasMedis}
                    onPreview={() => {
                      setPreviewFileUrl(editForm.dokumentPetugasMedis);
                      setPreviewModal(true);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDetail(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={submitRevisi}
              disabled={submitting || !selectedApp || isAdmin}
              className="bg-blue-600 hover:bg-blue-700 font-bold"
            >
              {submitting ? 'Mengirim...' : isAdmin ? 'Hanya untuk User' : 'Kirim Ulang Verifikasi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewModal} onOpenChange={setPreviewModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview Dokumen</DialogTitle>
          </DialogHeader>
          {previewFileUrl && (
            <div className="flex justify-center bg-gray-100 p-4 rounded">
              {previewFileUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewFileUrl}
                  className="w-full h-[60vh]"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewFileUrl}
                  alt="Preview"
                  className="max-h-[60vh] object-contain"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RevisiField({
  label,
  id,
  value,
  onChange,
  note,
  type = 'text',
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  note?: string;
  type?: string;
}) {
  return (
    <div
      className={`space-y-1.5 p-2 rounded-md ${
        note ? 'bg-red-50 border border-red-100 shadow-sm' : ''
      }`}
    >
      <Label htmlFor={id} className={note ? 'text-red-700 font-bold' : ''}>
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={note ? 'border-red-300 focus-visible:ring-red-400' : ''}
      />
      {note && (
        <div className="flex items-start gap-1.5 text-[11px] text-red-600 font-bold leading-tight">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>REVISI: {note}</span>
        </div>
      )}
    </div>
  );
}

function RevisiUpload({
  label,
  fieldName,
  currentPath,
  onUpload,
  note,
  onPreview,
}: {
  label: string;
  fieldName: string;
  currentPath: string;
  onUpload: (f: File) => void;
  note?: string;
  onPreview: () => void;
}) {
  return (
    <div
      className={`p-3 rounded-md border ${
        note ? 'bg-red-50 border-red-200' : 'bg-gray-50'
      }`}
    >
      <Label
        className={`text-xs block mb-2 ${
          note ? 'text-red-700 font-bold' : 'text-gray-500'
        }`}
      >
        {label}
      </Label>
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white hover:border-blue-400 transition-colors flex-1">
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
          <p className="text-[10px] text-center text-gray-400">
            Klik untuk ganti file
          </p>
        </div>
        {currentPath && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onPreview}
          >
            <Eye size={16} />
          </Button>
        )}
      </div>
      {note && (
        <p className="mt-2 text-[11px] text-red-600 font-bold flex items-start gap-1 leading-tight">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          REVISI: {note}
        </p>
      )}
    </div>
  );
}