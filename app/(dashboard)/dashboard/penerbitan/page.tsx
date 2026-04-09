'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { useLanguage } from '@/app/context/language-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Swal from 'sweetalert2';
import { FileText, UploadCloud, Clock, CheckCircle2, FileCheck, FileDigit, Eye } from 'lucide-react';

// --- TYPE DEFINITIONS ---
type PublicationItem = {
  id: string;
  namaPasien?: string | null;
  namaMaskapai?: string | null;
  noPenerbangan?: string | null;
  noKursi?: string | null;
  tanggalPerjalanan?: string | null;
  status: 'pending' | 'reviewed' | 'valid' | 'canceled';
  dokumenPenerbitan?: string | null;
  dokumen_penerbitan?: string | null;
  created_at?: string | null;
};

type UserPublicationItem = {
  app: PublicationItem;
  documentUrl: string;
};

type PreviewData = {
  url: string;
  isPdf: boolean;
};

// --- KAMUS TEKS INTERNAL (LOKALISASI) ---
const TRANSLATIONS = {
  id: {
    judul: "Penerbitan Dokumen",
    descAdmin: "Unggah atau perbarui dokumen surat izin resmi untuk permohonan yang telah disetujui.",
    descUser: "Dokumen surat izin Anda yang telah diterbitkan dapat ditinjau dan diunduh di sini.",
    kelolaAdmin: "Antrean Penerbitan",
    kelolaUser: "Arsip Dokumen Anda",
    validDitemukan: "permohonan menunggu/selesai diproses",
    dokumenTersedia: "dokumen resmi tersedia",
    kosongAdmin: "Belum ada permohonan yang disetujui.",
    kosongUser: "Belum ada dokumen yang diterbitkan untuk Anda.",
    disetujui: "Tervalidasi",
    input: "Diinput:",
    adaDokumen: "Dokumen telah diterbitkan. Anda dapat menggantinya di bawah ini.",
    belumAdaDokumen: "Dokumen surat izin belum diterbitkan.",
    dokumenSuratIzin: "Surat Izin Penerbangan",
    fileTerlampir: "Dokumen Terlampir:",
    pilihFile: "Pilih file PDF/Gambar...",
    menyimpan: "Menyimpan...",
    uploadSuratIzin: "Terbitkan Dokumen",
    updateSuratIzin: "Perbarui Dokumen",
    review: "Pratinjau",
    download: "Unduh",
    reviewDokumen: "Lihat",
    lihatDraft: "Lihat Draft",
    downloadDokumen: "Unduh",
    judulPreview: "Pratinjau Dokumen",
    descPreview: "Tampilan dokumen yang dipilih atau diunggah.",
    sukses: "Dokumen penerbitan berhasil disimpan.",
    gagal: "Terjadi kesalahan upload",
    formatAlert: "Format file harus PDF, JPG, PNG, atau WebP"
  },
  en: {
    judul: "Document Publication",
    descAdmin: "Upload or update official permit documents for approved applications.",
    descUser: "Your published permit documents can be reviewed and downloaded here.",
    kelolaAdmin: "Publication Queue",
    kelolaUser: "Your Document Archive",
    validDitemukan: "applications pending/processed",
    dokumenTersedia: "official documents available",
    kosongAdmin: "No approved applications yet.",
    kosongUser: "No documents published for you yet.",
    disetujui: "Validated",
    input: "Input:",
    adaDokumen: "Document is published. You can replace it below.",
    belumAdaDokumen: "Permit document has not been published.",
    dokumenSuratIzin: "Flight Permit Document",
    fileTerlampir: "Attached Document:",
    pilihFile: "Select PDF/Image file...",
    menyimpan: "Saving...",
    uploadSuratIzin: "Publish Document",
    updateSuratIzin: "Update Document",
    review: "Preview",
    download: "Download",
    reviewDokumen: "View",
    lihatDraft: "Preview Draft",
    downloadDokumen: "Download",
    judulPreview: "Document Preview",
    descPreview: "Preview of the selected or uploaded document.",
    sukses: "Publication document saved successfully.",
    gagal: "Upload error occurred",
    formatAlert: "File must be PDF, JPG, PNG, or WebP"
  }
};

// --- FUNGSI HELPER ---
function resolveDocumentUrl(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('http') || value.startsWith('/')) return value;
  return `/${value}`;
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

// Menghitung Waktu Berjalan Dinamis ("Time Ago") secara KALENDER (Mengabaikan Jam)
function getWaktuBerjalan(dateStr?: string | null, now?: Date, lang: 'id' | 'en' = 'id') {
  if (!dateStr || !now) return '-';
  const created = new Date(dateStr);
  
  // Untuk perhitungan di bawah 24 jam (hari yang sama)
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  // Untuk perhitungan hari (mengabaikan jam/menit agar seragam di tanggal yang sama)
  const createdDateOnly = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffCalendarDays = Math.round((nowDateOnly.getTime() - createdDateOnly.getTime()) / 86400000);

  // Jika inputnya di hari yang sama dengan hari ini (Kalender = 0)
  if (diffCalendarDays === 0) {
    if (diffMins < 1) return lang === 'id' ? 'Baru saja' : 'Just now';
    if (diffMins < 60) return lang === 'id' ? `${diffMins} menit lalu` : `${diffMins} mins ago`;
    return lang === 'id' ? `${diffHours} jam lalu` : `${diffHours} hours ago`;
  }
  
  // Jika beda hari kalender
  return lang === 'id' ? `${diffCalendarDays} hari lalu` : `${diffCalendarDays} days ago`;
}

function getPublicationDocument(app: PublicationItem): string | null {
  return app.dokumenPenerbitan || app.dokumen_penerbitan || (app as any).documentPath || null;
}

function checkIsPdf(url: string): boolean {
  return url.toLowerCase().includes('.pdf');
}

function getDocumentName(url: string): string {
  const value = url.split('?')[0].split('#')[0];
  const name = value.split('/').pop() || 'Dokumen Surat Izin';
  return name.length > 30 ? name.substring(0, 27) + '...' : name;
}

// --- KOMPONEN UTAMA ---
export default function PenerbitanPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  
  const activeLang = (language === 'en' ? 'en' : 'id') as 'id' | 'en';
  const txt = TRANSLATIONS[activeLang];

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<PublicationItem[]>([]);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});

  // State untuk Real-Time Timer (Update setiap menit)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Jalankan timer untuk memperbarui "waktu berjalan" setiap 60 detik
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    fetchPublicationData();
  }, [authLoading, user?.role]);

  async function fetchPublicationData() {
    setLoading(true);
    try {
      const res = await fetch('/api/evacuations?status=valid', { credentials: 'include' });
      const result = await res.json();
      if (res.ok) setApplications(result.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadResultDocument(appId: string) {
    const file = selectedFiles[appId];

    if (!file) {
      Swal.fire({ icon: 'warning', text: txt.pilihFile });
      return;
    }

    setUploadingId(appId);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('fileType', 'dokumen-penerbitan');

      const uploadRes = await fetch('/api/upload/medical-document', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });
      const uploadResult = await uploadRes.json();

      if (!uploadRes.ok || !uploadResult?.data?.path) {
        throw new Error(uploadResult?.error || txt.gagal);
      }

      const saveRes = await fetch(`/api/evacuations/${appId}/publication-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ documentPath: uploadResult.data.path }),
      });

      if (!saveRes.ok) throw new Error(txt.gagal);

      Swal.fire({ icon: 'success', title: 'Sukses', text: txt.sukses });
      setSelectedFiles((prev) => ({ ...prev, [appId]: null }));
      setApplications((prev) => 
        prev.map(app => app.id === appId ? { ...app, dokumenPenerbitan: uploadResult.data.path } : app)
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : txt.gagal;
      Swal.fire({ icon: 'error', title: 'Error', text: message });
    } finally {
      setUploadingId(null);
    }
  }

  const openServerPreview = (url: string) => {
    setPreviewData({ url, isPdf: checkIsPdf(url) });
  };

  const openDraftPreview = (file: File) => {
    const localUrl = URL.createObjectURL(file);
    const isPdfType = file.type === 'application/pdf';
    setPreviewData({ url: localUrl, isPdf: isPdfType });
  };

  const appsToProcess = useMemo(() => 
    applications.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()), 
  [applications]);

  const userPublishedDocuments = useMemo<UserPublicationItem[]>(() => {
    return applications.reduce<UserPublicationItem[]>((acc, app) => {
      const rawDocument = getPublicationDocument(app);
      const documentUrl = resolveDocumentUrl(rawDocument);
      if (documentUrl) acc.push({ app, documentUrl });
      return acc;
    }, []);
  }, [applications]);

  if (authLoading) return null;
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Import Font Poppins */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
      `}} />

      <div 
        className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto bg-slate-50/50 min-h-screen text-slate-800" 
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{txt.judul}</h1>
            <p className="text-slate-500 text-base md:text-lg mt-2 max-w-2xl">
              {isAdmin ? txt.descAdmin : txt.descUser}
            </p>
          </div>
        </div>

        <Card className="border-slate-200 shadow-lg rounded-2xl overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6 pt-8 px-6 md:px-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                <FileDigit className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl font-bold text-slate-900">
                  {isAdmin ? txt.kelolaAdmin : txt.kelolaUser}
                </CardTitle>
                <CardDescription className="text-base text-slate-500 mt-1 font-medium">
                  {isAdmin
                    ? `${appsToProcess.length} ${txt.validDitemukan}`
                    : `${userPublishedDocuments.length} ${txt.dokumenTersedia}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-10">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-500 text-lg">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                Loading data...
              </div>
            ) : isAdmin ? (
              appsToProcess.length === 0 ? (
                <div className="py-20 flex flex-col items-center text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                  <p className="text-lg font-medium">{txt.kosongAdmin}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {appsToProcess.map((app) => {
                    const rawDocument = getPublicationDocument(app);
                    const documentUrl = resolveDocumentUrl(rawDocument);
                    const isUploading = uploadingId === app.id;
                    const selectedFile = selectedFiles[app.id] || null;

                    return (
                      <div key={app.id} className="rounded-2xl border border-slate-200 p-6 md:p-8 flex flex-col lg:flex-row gap-8 bg-white shadow-sm hover:shadow-md transition-shadow">
                        
                        {/* INFO PASIEN (KIRI) */}
                        <div className="flex-1 space-y-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                                {app.namaPasien || '-'}
                              </h3>
                              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-lg mt-2">
                                <span className="text-sm font-mono font-semibold">ID: {app.id}</span>
                              </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-4 py-1.5 text-sm font-semibold rounded-full shadow-sm">
                              {txt.disetujui}
                            </Badge>
                          </div>
                          
                          <p className="text-lg text-slate-700 font-medium flex items-center gap-2">
                            {app.namaMaskapai || '-'} <span className="text-slate-300">•</span> {formatTanggalID(app.tanggalPerjalanan, activeLang) || '-'}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 items-center pt-2">
                            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <Clock className="w-4 h-4" />
                              {txt.input} {formatTanggalID(app.created_at, activeLang)} {formatTime(app.created_at, activeLang)}
                            </span>
                            
                            {/* BADGE WAKTU BERJALAN DINAMIS */}
                            <Badge className="bg-[#fef3c7] text-[#b45309] hover:bg-[#fde68a] border border-[#fde68a] text-[13px] font-semibold px-3 py-1.5 shadow-none transition-colors duration-300">
                              {getWaktuBerjalan(app.created_at, currentTime, activeLang)}
                            </Badge>
                          </div>
                        </div>

                        {/* GARIS PEMISAH */}
                        <div className="hidden lg:block w-px bg-slate-200 self-stretch"></div>
                        <div className="block lg:hidden h-px bg-slate-200 w-full"></div>

                        {/* AREA UPLOAD & DOKUMEN (KANAN) */}
                        <div className="lg:w-[400px] flex flex-col justify-center space-y-4">
                          
                          {/* KOTAK DOKUMEN SAAT INI (Jika sudah ada) */}
                          {documentUrl ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <FileCheck className="w-6 h-6 text-blue-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-blue-600 font-semibold">{txt.fileTerlampir}</p>
                                  <p className="text-base text-slate-800 font-medium truncate" title={getDocumentName(documentUrl)}>
                                    {getDocumentName(documentUrl)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 bg-white hover:bg-blue-50 border-blue-200 text-blue-700 h-10" onClick={() => openServerPreview(documentUrl)}>
                                  {txt.reviewDokumen}
                                </Button>
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10" asChild>
                                  <a href={documentUrl} target="_blank" rel="noopener noreferrer" download>
                                    {txt.downloadDokumen}
                                  </a>
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-base text-slate-500 font-medium">
                              {txt.belumAdaDokumen}
                            </p>
                          )}

                         {/* DRAG & DROP CUSTOM UPLOAD ZONE */}
                          <div className="relative">
                            <input
                              type="file"
                              id={`file-${app.id}`}
                              accept=".pdf,image/png,image/jpeg,image/webp"
                              title="" /* Menghilangkan tooltip default browser yang kadang mengganggu */
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                const file = event.target.files?.[0] || null;
                                setSelectedFiles((prev) => ({ ...prev, [app.id]: file }));
                              }}
                              disabled={!!isUploading} /* Memastikan selalu terbaca sebagai boolean oleh TypeScript */
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${selectedFile ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}`}>
                              <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${selectedFile ? 'text-blue-500' : 'text-slate-400'}`} />
                              <p className={`text-base font-semibold truncate ${selectedFile ? 'text-blue-700 px-2' : 'text-slate-600'}`}>
                                {selectedFile ? selectedFile.name : txt.pilihFile}
                              </p>
                              {!selectedFile && (
                                <p className="text-sm text-slate-400 mt-1">{txt.formatAlert}</p>
                              )}
                            </div>
                          </div>

                          {/* TOMBOL SUBMIT & LIHAT DRAFT */}
                          {selectedFile ? (
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                onClick={() => openDraftPreview(selectedFile)}
                                className="h-12 px-4 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                                title="Lihat dokumen sebelum diterbitkan"
                              >
                                <Eye className="w-5 h-5 mr-2" />
                                {txt.lihatDraft}
                              </Button>
                              
                              <Button
                                onClick={() => handleUploadResultDocument(app.id)}
                                disabled={isUploading}
                                className={`flex-1 h-12 text-base font-semibold rounded-xl shadow-sm transition-all ${
                                  isUploading ? 'bg-slate-500' : 'bg-slate-900 hover:bg-slate-800 text-white'
                                }`}
                              >
                                {isUploading ? txt.menyimpan : (documentUrl ? txt.updateSuratIzin : txt.uploadSuratIzin)}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              disabled={true}
                              className="w-full h-12 text-base font-semibold rounded-xl shadow-sm bg-slate-200 text-slate-500"
                            >
                              {documentUrl ? txt.updateSuratIzin : txt.uploadSuratIzin}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : userPublishedDocuments.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <FileText className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-lg font-medium">{txt.kosongUser}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPublishedDocuments.map(({ app, documentUrl }) => (
                  <div key={app.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between h-full group">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                           <FileText className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-slate-900 text-lg leading-tight">{txt.dokumenSuratIzin}</p>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-base font-semibold text-slate-800">{app.namaPasien || '-'}</p>
                        <p className="text-sm text-slate-500 mt-1 truncate" title={getDocumentName(documentUrl)}>
                          {getDocumentName(documentUrl)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          <Clock className="w-4 h-4" />
                          {txt.input} {formatTanggalID(app.created_at, activeLang)}
                        </span>
                        
                        {/* BADGE WAKTU BERJALAN DINAMIS (USER VIEW) */}
                        <Badge className="w-fit bg-[#fef3c7] text-[#b45309] hover:bg-[#fde68a] border border-[#fde68a] text-[13px] font-semibold px-3 py-1 shadow-none transition-colors duration-300">
                          {getWaktuBerjalan(app.created_at, currentTime, activeLang)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
                      <Button variant="outline" className="flex-1 text-base h-11 border-slate-200 hover:bg-slate-50 rounded-xl" onClick={() => openServerPreview(documentUrl)}>
                        {txt.review}
                      </Button>
                      <Button className="flex-1 text-base h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl" asChild>
                        <a href={documentUrl} target="_blank" rel="noopener noreferrer" download>
                          {txt.download}
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* MODAL PREVIEW DOKUMEN (Draft Lokal & Dokumen Server) */}
        <Dialog open={Boolean(previewData)} onOpenChange={(open) => !open && setPreviewData(null)}>
          <DialogContent className="max-w-5xl w-[90vw] p-0 rounded-2xl overflow-hidden border-none shadow-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <DialogHeader className="p-6 md:p-8 bg-slate-900 text-white border-b border-slate-800">
              <DialogTitle className="text-2xl font-bold">{txt.judulPreview}</DialogTitle>
              <DialogDescription className="text-base text-slate-400 mt-1">{txt.descPreview}</DialogDescription>
            </DialogHeader>

            {previewData && (
              <div className="bg-slate-100 flex items-center justify-center p-4 md:p-8">
                <div className="w-full h-[70vh] rounded-xl overflow-hidden bg-white shadow-inner border border-slate-200">
                  {previewData.isPdf ? (
                    <iframe src={previewData.url} className="w-full h-full" title="Preview Dokumen" />
                  ) : (
                    <img src={previewData.url} alt="Preview Dokumen" className="w-full h-full object-contain p-4" />
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