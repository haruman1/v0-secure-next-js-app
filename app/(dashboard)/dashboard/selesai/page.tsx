'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { useLanguage } from '@/app/context/language-context';
import { useTour } from '@/app/hooks/useTour';
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


function resolveDocumentUrl(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('http') || value.startsWith('/')) return value;
  return `/${value}`;
}

function isPdf(url: string) {
  return url.toLowerCase().includes('.pdf');
}

export default function SelesaiPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  useTour(user?.role === 'admin');

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
      const res = await fetch(
        '/api/publications?status=valid&publishedOnly=true',
        {
          credentials: 'include',
        },
      );
      const result = await res.json();

      if (res.ok) {
        const sortedData = (result.data || []).sort(
          (a: SelesaiItem, b: SelesaiItem) => {
            const timeA = new Date(
              a.updated_at ||
                a.updatedAt ||
                a.published_at ||
                a.publishedAt ||
                a.created_at ||
                a.createdAt ||
                0,
            ).getTime();

            const timeB = new Date(
              b.updated_at ||
                b.updatedAt ||
                b.published_at ||
                b.publishedAt ||
                b.created_at ||
                b.createdAt ||
                0,
            ).getTime();

            return timeB - timeA;
          },
        );

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
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            {t('pages.selesai.title')}
          </h1>
          <p className="max-w-3xl text-sm md:text-base text-slate-500 leading-relaxed">
            {t('pages.selesai.desc')}
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
                  {t('pages.selesai.title')}
                </CardTitle>
                <CardDescription className="mt-1 text-sm md:text-base font-medium text-slate-500">
                  {items.length} {t('pages.selesai.desc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            {loading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-slate-500">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
                <p className="text-base font-medium">{t('common.loading')}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-slate-500">
                <CheckCircle2 className="mb-4 h-14 w-14 text-emerald-400" />
                <p className="text-base md:text-lg font-medium">{t('messages.noData')}</p>
              </div>
            ) : (
              <div id="tour-sele-archive" className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                  const documentRaw =
                    item.publication_document || item.suratPenerbitan;
                  const documentUrl = resolveDocumentUrl(documentRaw);

                  const waktuTerbit =
                    item.updated_at ||
                    item.updatedAt ||
                    item.published_at ||
                    item.publishedAt;
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
                            {t('evacuation.status')}
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
                                  {new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(item.tanggalPerjalanan))}
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
                                <span className="font-medium">{t('pages.selesai.tour.archive')}</span>{' '}
                                <span className="text-slate-700">
                                  {new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(waktuInput))}{' '}
                                  {new Date(waktuInput).toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </p>
                            </div>
                          )}

                          {waktuTerbit && (
                            <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                              <p className="leading-relaxed break-words">
                                <span className="font-medium">
                                  {t('pages.selesai.desc')}
                                </span>{' '}
                                <span className="font-semibold">
                                  {new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(waktuTerbit))}{' '}
                                  {new Date(waktuTerbit).toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </p>
                            </div>
                          )}

                          {(waktuTerbit || waktuInput) && (
                            <Badge className="w-fit rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                                {language === 'id' ? 'Selesai' : 'Completed'}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* BUTTONS */}
                      <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                        {documentUrl ? (
                          <>
                            <Button
                              id="tour-sele-preview"
                              variant="outline"
                              className="h-11 w-full rounded-2xl border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                              onClick={() => setPreviewUrl(documentUrl)}
                            >
                              <span className="truncate">{t('common.view')}</span>
                            </Button>

                            <Button
                              id="tour-sele-download"
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
                                <span className="truncate">{t('common.download')}</span>
                              </a>
                            </Button>
                          </>
                        ) : (
                          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-3 text-center text-sm italic text-slate-400">
                            {t('pages.selesai.desc')}
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
      <Dialog
        open={Boolean(previewUrl)}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
      >
        <DialogContent
          className="w-[95vw] max-w-6xl overflow-hidden rounded-3xl border-none p-0 shadow-2xl"
        >
          <DialogHeader className="border-b border-slate-800 bg-slate-900 px-6 py-6 text-white md:px-8">
            <DialogTitle className="text-xl md:text-2xl font-bold">
              {t('pages.selesai.judulPreview')}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm md:text-base text-slate-400">
              {t('pages.selesai.descPreview')}
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
  );
}
