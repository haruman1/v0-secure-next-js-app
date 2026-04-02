'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
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
  suratIzinTerbit?: string | null;
  surat_izin_terbit?: string | null;
  suratIzin?: string | null;
  surat_izin?: string | null;
  created_at?: string | null;
};

type UserPublicationItem = {
  app: PublicationItem;
  documentUrl: string;
};

function resolveDocumentUrl(value?: string | null): string | null {
  if (!value) return null;

  // kalau sudah full URL atau path root
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  ) {
    return value;
  }

  // 🔥 FIX: handle relative path dari backend
  return `/${value}`;
}

function formatTanggalID(dateString?: string | null): string {
  if (!dateString) return '-';

  const date = new Date(dateString);

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
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

function getPublicationDocument(app: PublicationItem): string | null {
  return (
    app.dokumenPenerbitan ||
    app.dokumen_penerbitan ||
    app.suratIzinTerbit ||
    app.surat_izin_terbit ||
    app.suratIzin ||
    app.surat_izin ||
    // 🔥 tambahan kemungkinan field backend
    (app as any).documentPath ||
    (app as any).document_path ||
    (app as any).publication_document ||
    null
  );
}

function isPdf(url: string): boolean {
  return url.toLowerCase().includes('.pdf');
}

function getDocumentName(url: string): string {
  const value = url.split('?')[0].split('#')[0];
  return value.split('/').pop() || 'Dokumen Surat Izin';
}

export default function PenerbitanPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<PublicationItem[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, File | null>
  >({});

  useEffect(() => {
    if (authLoading) return;
    fetchPublicationData();
  }, [authLoading, user?.role]);

  async function fetchPublicationData() {
    setLoading(true);

    try {
      const res = await fetch('/api/evacuations?status=valid', {
        credentials: 'include',
      });

      const result = await res.json();

      if (res.ok) {
        const filtered = (result.data || []).filter((app: PublicationItem) => {
          const doc = getPublicationDocument(app);
          return !doc;
        });

        setApplications(filtered);
      }
    } finally {
      setLoading(false);
    }
  }
  async function safeJson(res: Response) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
    }
  }
  async function handleUploadResultDocument(appId: string) {
    const file = selectedFiles[appId];

    if (!file) {
      alert('Pilih file dokumen terlebih dahulu.');
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

      const uploadResult = await safeJson(uploadRes);

      if (!uploadRes.ok || !uploadResult?.data?.path) {
        throw new Error(uploadResult?.error || 'Upload dokumen gagal');
      }

      setSavingId(appId);

      const saveRes = await fetch(
        `/api/evacuations/${appId}/publication-document`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            documentPath: uploadResult.data.path,
          }),
        },
      );

      const saveResult = await saveRes.json();

      if (!saveRes.ok) {
        throw new Error(saveResult?.error || 'Simpan dokumen penerbitan gagal');
      }
      Swal.fire({
        icon: 'success',
        title: 'Sukses',
        text: 'Dokumen penerbitan berhasil disimpan.',
      });

      setSelectedFiles((prev) => ({
        ...prev,
        [appId]: null,
      }));

      setApplications((prev) => prev.filter((a) => a.id !== appId));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Terjadi kesalahan upload';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    } finally {
      setUploadingId(null);
      setSavingId(null);
    }
  }

  const publicationCount = useMemo(() => applications.length, [applications]);

  const userPublishedDocuments = useMemo<UserPublicationItem[]>(() => {
    return applications.reduce<UserPublicationItem[]>((acc, app) => {
      const rawDocument = getPublicationDocument(app);
      const documentUrl = resolveDocumentUrl(rawDocument);

      if (documentUrl) {
        acc.push({ app, documentUrl });
      }

      return acc;
    }, []);
  }, [applications]);

  if (authLoading) return null;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Penerbitan Dokumen</h1>
        <p className="text-gray-600">
          {user?.role === 'admin'
            ? 'Admin dapat upload atau edit dokumen surat izin untuk permohonan yang disetujui.'
            : 'Dokumen penerbitan dari admin dapat langsung direview dan didownload.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === 'admin'
              ? 'Kelola Surat Izin'
              : 'Dokumen Penerbitan'}
          </CardTitle>
          <CardDescription>
            {user?.role === 'admin'
              ? `${publicationCount} permohonan valid ditemukan`
              : `${userPublishedDocuments.length} dokumen penerbitan tersedia`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-10 text-center">Loading...</div>
          ) : user?.role === 'admin' ? (
            publicationCount === 0 ? (
              <div className="py-10 text-center text-gray-500">
                Belum ada data permohonan disetujui.
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const rawDocument = getPublicationDocument(app);
                  const documentUrl = resolveDocumentUrl(rawDocument);
                  const isUploading =
                    uploadingId === app.id || savingId === app.id;
                  const selectedFile = selectedFiles[app.id] || null;

                  return (
                    <div
                      key={app.id}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">
                            {app.namaPasien || '-'}
                          </h3>
                          <p className="text-xs text-gray-500">ID: {app.id}</p>
                          <p className="text-sm text-gray-600">
                            {app.namaMaskapai || '-'} •{' '}
                            {formatTanggalID(app.tanggalPerjalanan) || '-'}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 items-center">
                            <Badge variant="outline" className="text-[10px]">
                              Input: {formatTanggalID(app.created_at)} {formatTime(app.created_at)}
                            </Badge>
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] font-bold">
                              Sudah {calculateDays(app.created_at)} Hari
                            </Badge>
                          </div>
                        </div>
                        <Badge className="bg-green-600">Disetujui</Badge>
                      </div>

                      <p className="text-xs text-gray-500">
                        {documentUrl
                          ? 'Dokumen sudah terbit. Anda bisa edit/ganti dokumen di sini.'
                          : 'Belum ada dokumen terbit untuk permohonan ini.'}
                      </p>

                      {documentUrl && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewUrl(documentUrl)}
                          >
                            Review Dokumen Penerbitan
                          </Button>

                          <Button size="sm" asChild>
                            <a
                              href={documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              Download Dokumen Saat Ini
                            </a>
                          </Button>
                        </div>
                      )}

                      <div className="space-y-2">
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/webp"
                          onChange={(event) => {
                            const file = event.target.files?.[0] || null;
                            setSelectedFiles((prev) => ({
                              ...prev,
                              [app.id]: file,
                            }));
                          }}
                          disabled={isUploading}
                          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white"
                        />

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-gray-500">
                            {selectedFile
                              ? `File dipilih: ${selectedFile.name}`
                              : 'Format: PDF/JPG/PNG/WebP'}
                          </span>

                          <Button
                            size="sm"
                            onClick={() => handleUploadResultDocument(app.id)}
                            disabled={!selectedFile || isUploading}
                          >
                            {isUploading
                              ? 'Menyimpan...'
                              : documentUrl
                                ? 'Update Surat Izin'
                                : 'Upload Surat Izin'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : userPublishedDocuments.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              Dokumen penerbitan belum tersedia.
            </div>
          ) : (
            <div className="space-y-3">
              {userPublishedDocuments.map(({ app, documentUrl }) => (
                <div
                  key={app.id}
                  className="rounded-md border p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">Dokumen Surat Izin</p>
                    <p className="text-xs text-gray-500">
                      {getDocumentName(documentUrl)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                      <Badge variant="outline" className="text-[10px]">
                        Input: {formatTanggalID(app.created_at)} {formatTime(app.created_at)}
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] font-bold">
                        Sudah {calculateDays(app.created_at)} Hari
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewUrl(documentUrl)}
                    >
                      Review
                    </Button>

                    <Button size="sm" asChild>
                      <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(previewUrl)}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Dokumen Surat Izin</DialogTitle>
            <DialogDescription>
              Pratinjau dokumen hasil penerbitan dari admin.
            </DialogDescription>
          </DialogHeader>

          {previewUrl && (
            <div className="max-h-[70vh] overflow-hidden rounded-md border">
              {isPdf(previewUrl) ? (
                <iframe
                  src={previewUrl}
                  className="h-[70vh] w-full"
                  title="Preview Dokumen Surat Izin"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Dokumen Surat Izin"
                  className="max-h-[70vh] w-full object-contain"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
