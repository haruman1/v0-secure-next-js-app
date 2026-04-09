'use client';

import { useEffect, useState } from 'react';
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
import { CheckCircle2, FileCheck, Plane, Clock } from 'lucide-react';

type SelesaiItem = {
  id: string;
  namaPasien?: string | null;
  noPenerbangan?: string | null;
  tanggalPerjalanan?: string | null;
  suratPenerbitan?: string | null;
  publication_document?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
  published_at?: string | null;
  publishedAt?: string | null;
};

const TRANSLATIONS = {
  id: {
    judul: 'Selesai',
    desc: 'Daftar permohonan yang telah selesai diproses dan surat izinnya telah diterbitkan.',
    kelola: 'Arsip Permohonan Selesai',
    dokumenTersedia: 'permohonan telah selesai',
    kosong: 'Belum ada data permohonan yang selesai.',
    input: 'Dibuat:',
    diterbitkan: 'Diterbitkan:',
    statusSelesai: 'Selesai',
    review: 'Lihat Dokumen',
    download: 'Unduh',
    judulPreview: 'Pratinjau Surat Penerbitan',
    descPreview: 'Tampilan dokumen surat izin yang telah diterbitkan.',
    dokumenTidakAda: 'Dokumen tidak tersedia',
    loading: 'Memuat data...',
  },
  en: {
    judul: 'Completed',
    desc: 'List of completed applications with published flight permit documents.',
    kelola: 'Completed Applications Archive',
    dokumenTersedia: 'completed applications',
    kosong: 'No completed applications available.',
    input: 'Created:',
    diterbitkan: 'Published:',
    statusSelesai: 'Completed',
    review: 'View Document',
    download: 'Download',
    judulPreview: 'Permit Document Preview',
    descPreview: 'Preview of the published permit document.',
    dokumenTidakAda: 'Document unavailable',
    loading: 'Loading data...',
  },
};

function resolveDocumentUrl(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('http') || value.startsWith('/')) return value;
  return `/${value}`;
}

function formatTanggal(dateString?: string | null, lang: string = 'id'): string | null {
  if (!dateString) return null;
  const locale = lang === 'en' ? 'en-US' : 'id-ID';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

function formatTime(dateStr?: string | null, lang: string = 'id'): string | null {
  if (!dateStr) return null;
  const locale = lang === 'en' ? 'en-US' : 'id-ID';
  return new Date(dateStr).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getWaktuBerjalan(dateStr?: string | null, now?: Date, lang: 'id' | 'en' = 'id') {
  if (!dateStr || !now) return '-';
  const created = new Date(dateStr);

  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  const createdDateOnly = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffCalendarDays = Math.round(
    (nowDateOnly.getTime() - createdDateOnly.getTime()) / 86400000
  );

  if (diffCalendarDays === 0) {
    if (diffMins < 1) return lang === 'id' ? 'Baru saja' : 'Just now';
    if (diffMins < 60) return lang === 'id' ? `${diffMins} menit lalu` : `${diffMins} mins ago`;
    return lang === 'id' ? `${diffHours} jam lalu` : `${diffHours} hours ago`;
  }

  return lang === 'id' ? `${diffCalendarDays} hari lalu` : `${diffCalendarDays} days ago`;
}

function isPdf(url: string) {
  return url.toLowerCase().includes('.pdf');
}

export default function SelesaiPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();

  const activeLang = (language === 'en' ? 'en' : 'id') as 'id' | 'en';
  const txt = TRANSLATIONS[activeLang];

  const [items, setItems] = useState<SelesaiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [authLoading, user?.role]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch('/api/publications?status=valid&publishedOnly=true', {
        credentials: 'include',
      });
      const result = await res.json();

      if (res.ok) {
        const sortedData = (result.data || []).sort((a: SelesaiItem, b: SelesaiItem) => {
          const timeA = new Date(
            a.updated_at ||
              a.updatedAt ||
              a.published_at ||
              a.publishedAt ||
              a.created_at ||
              a.createdAt ||
              0
          ).getTime();

          const timeB = new Date(
            b.updated_at ||
              b.updatedAt ||
              b.published_at ||
              b.publishedAt ||
              b.created_at ||
              b.createdAt ||
              0
          ).getTime();

          return timeB - timeA;
        });

        setItems(sortedData);
      }
    } catch (error) {
      console.error('Gagal mengambil data selesai:', error);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
      `,
        }}
      />

      <div
        className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 md:px-8 lg:px-10"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="mx-auto max-w-7xl space-y-8">
          {/* HEADER */}
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              {txt.judul}
            </h1>
            <p className="max-w-3xl text-sm md:text-base text-slate-500 leading-relaxed">
              {txt.desc}
            </p>
          </div>

          {/* MAIN CARD */}
          <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-6 py-6 md:px-8">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                  <FileCheck className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-2xl font-bold text-slate-900">
                    {txt.kelola}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm md:text-base font-medium text-slate-500">
                    {items.length} {txt.dokumenTersedia}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
              {loading ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-slate-500">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
                  <p className="text-base font-medium">{txt.loading}</p>
                </div>
              ) : items.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-slate-500">
                  <CheckCircle2 className="mb-4 h-14 w-14 text-emerald-400" />
                  <p className="text-base md:text-lg font-medium">{txt.kosong}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => {
                    const documentRaw = item.publication_document || item.suratPenerbitan;
                    const documentUrl = resolveDocumentUrl(documentRaw);

                    const waktuTerbit =
                      item.updated_at || item.updatedAt || item.published_at || item.publishedAt;
                    const waktuInput = item.created_at || item.createdAt;

                    return (
                      <div
                        key={item.id}
                        className="flex min-h-[460px] flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-6"
                      >
                        {/* TOP CONTENT */}
                        <div className="flex flex-1 flex-col gap-4">
                          {/* TITLE + BADGE */}
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="min-h-[56px] flex-1 break-words text-xl font-bold leading-snug text-slate-900">
                              {item.namaPasien || '-'}
                            </h3>

                            <Badge className="shrink-0 whitespace-nowrap rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                              {txt.statusSelesai}
                            </Badge>
                          </div>

                          {/* ID BOX */}
                          <div className="rounded-2xl bg-slate-100 px-4 py-3">
                            <p className="break-all text-sm font-semibold text-slate-700">
                              ID: {item.id}
                            </p>
                          </div>

                          {/* FLIGHT INFO */}
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                            <div className="flex items-start gap-2 text-slate-700">
                              <Plane className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                              <div className="min-w-0 flex-1">
                                <p className="break-words text-base font-semibold">
                                  {item.noPenerbangan || '-'}
                                </p>
                                {item.tanggalPerjalanan && (
                                  <p className="mt-2 text-sm text-slate-500 break-words">
                                    {formatTanggal(item.tanggalPerjalanan, activeLang)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* TIME INFO */}
                          <div className="mt-1 flex flex-col gap-3 border-t border-slate-100 pt-4">
                            {waktuInput && (
                              <div className="flex items-start gap-2 text-sm text-slate-500">
                                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                                <p className="leading-relaxed break-words">
                                  <span className="font-medium">{txt.input}</span>{' '}
                                  <span className="text-slate-700">
                                    {formatTanggal(waktuInput, activeLang)}{' '}
                                    {formatTime(waktuInput, activeLang)}
                                  </span>
                                </p>
                              </div>
                            )}

                            {waktuTerbit && (
                              <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                <p className="leading-relaxed break-words">
                                  <span className="font-medium">{txt.diterbitkan}</span>{' '}
                                  <span className="font-semibold">
                                    {formatTanggal(waktuTerbit, activeLang)}{' '}
                                    {formatTime(waktuTerbit, activeLang)}
                                  </span>
                                </p>
                              </div>
                            )}

                            {(waktuTerbit || waktuInput) && (
                              <Badge className="w-fit rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                                {getWaktuBerjalan(
                                  waktuTerbit || waktuInput,
                                  currentTime,
                                  activeLang
                                )}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                          {documentUrl ? (
                            <>
                              <Button
                                variant="outline"
                                className="h-11 w-full rounded-2xl border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                onClick={() => setPreviewUrl(documentUrl)}
                              >
                                <span className="truncate">{txt.review}</span>
                              </Button>

                              <Button
                                className="h-11 w-full rounded-2xl bg-blue-700 text-sm font-semibold text-white hover:bg-blue-800"
                                asChild
                              >
                                <a
                                  href={documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="flex items-center justify-center"
                                >
                                  <span className="truncate">{txt.download}</span>
                                </a>
                              </Button>
                            </>
                          ) : (
                            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-3 text-center text-sm italic text-slate-400">
                              {txt.dokumenTidakAda}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PREVIEW MODAL */}
        <Dialog open={Boolean(previewUrl)} onOpenChange={(open) => !open && setPreviewUrl(null)}>
          <DialogContent
            className="w-[95vw] max-w-6xl overflow-hidden rounded-3xl border-none p-0 shadow-2xl"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <DialogHeader className="border-b border-slate-800 bg-slate-900 px-6 py-6 text-white md:px-8">
              <DialogTitle className="text-xl md:text-2xl font-bold">
                {txt.judulPreview}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm md:text-base text-slate-400">
                {txt.descPreview}
              </DialogDescription>
            </DialogHeader>

            {previewUrl && (
              <div className="flex items-center justify-center bg-slate-100 p-4 md:p-6">
                <div className="h-[75vh] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner">
                  {isPdf(previewUrl) ? (
                    <iframe
                      src={previewUrl}
                      className="h-full w-full"
                      title="Preview Dokumen"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Preview Dokumen"
                      className="h-full w-full object-contain p-4"
                    />
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