'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type AppItem = {
  id: string;
  namaPasien: string | null;
  noPenerbangan: string | null;
  tanggalPerjalanan: string | null;
  status: 'pending' | 'reviewed' | 'valid' | 'canceled';
  catatanRevisi?: string | null;
  catatan_revisi?: string | null;
  revisionNotes?: string | null;
};

export default function VerifikasiPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [applications, setApplications] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);

  const [showDetail, setShowDetail] = useState(false);
  const [showRevisiModal, setShowRevisiModal] = useState(false);

  const [revisiNote, setRevisiNote] = useState('');
  const [revisiId, setRevisiId] = useState<string | null>(null);
  const [submittingRevisi, setSubmittingRevisi] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    fetchApplications();
  }, [authLoading, user?.role]);

  async function fetchApplications() {
    setLoading(true);

    try {
      const status = user?.role === 'admin' ? 'pending' : '';

      const res = await fetch(
        status ? `/api/evacuations?status=${status}` : '/api/evacuations',
        { credentials: 'include' }
      );

      const result = await res.json();

      if (res.ok) {
        setApplications((result.data || []) as AppItem[]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id: string) {
    const res = await fetch(`/api/evacuations/${id}`, {
      credentials: 'include',
    });

    const result = await res.json();

    if (res.ok) {
      setSelectedApp(result.data);
      setShowDetail(true);
    }
  }
async function handleApprove(
    id: string,
    redirectToPublication = false,
  ) {
    const res = await fetch(`/api/evacuations/${id}/approve`, {
      method: 'POST',
      credentials: 'include',
    });

    if (res.ok) {
      alert('Permohonan disetujui');

      setApplications((prev) => prev.filter((app) => app.id !== id));

      setShowDetail(false);
      if (redirectToPublication) {
        router.push('/dashboard/penerbitan');
      }
    }
  }

  async function submitRevisi() {
    if (!revisiId || !revisiNote.trim()) return;

    setSubmittingRevisi(true);

    try {
      const res = await fetch(`/api/evacuations/${revisiId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          catatanRevisi: revisiNote.trim(),
        }),
      });

      if (res.ok) {
        alert('Permohonan dikembalikan untuk revisi');

        setApplications((prev) =>
          prev.filter((app) => app.id !== revisiId)
        );

        setShowRevisiModal(false);
        setShowDetail(false);
        setRevisiNote('');
      }
    } finally {
      setSubmittingRevisi(false);
    }
  }

  function getStatusBadge(status: AppItem['status']) {
    if (status === 'pending')
      return <Badge variant="secondary">Menunggu Verifikasi</Badge>;

    if (status === 'reviewed')
      return <Badge variant="destructive">Perlu Revisi</Badge>;

    if (status === 'valid')
      return <Badge className="bg-green-600">Disetujui</Badge>;

    return <Badge variant="outline">Dibatalkan</Badge>;
  }

  const getNote = (app: AppItem) =>
    app.catatanRevisi || app.catatan_revisi || app.revisionNotes || '-';

  if (authLoading) return null;

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Verifikasi Permohonan
        </h1>

        <p className="text-gray-600">
          {user?.role === 'admin'
            ? 'Daftar permohonan yang menunggu verifikasi admin'
            : 'Status verifikasi permohonan Anda'}
        </p>
      </div>

      {/* LIST DATA */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === 'admin'
              ? 'Permohonan Pending'
              : 'Riwayat Verifikasi'}
          </CardTitle>

          <CardDescription>
            {applications.length} data ditemukan
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Tidak ada permohonan
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold">
                      {app.namaPasien || '-'}
                    </div>

                    <div className="text-sm text-gray-500">
                      ID: {app.id}
                    </div>

                    <div className="text-sm text-gray-500">
                      {app.noPenerbangan || '-'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(app.status)}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetail(app.id)}
                    >
                      Detail
                    </Button>

                    {user?.role === 'admin' && (
                      <>
                        <Button
                          size="sm"
                           onClick={() =>
                            handleApprove(app.id, true)
                          }
                        >
                          Setujui
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setRevisiId(app.id);
                            setShowRevisiModal(true);
                          }}
                        >
                          Revisi
                        </Button>
                      </>
                    )}

                    {user?.role !== 'admin' &&
                      app.status === 'reviewed' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            router.push('/dashboard/revisi')
                          }
                        >
                          Perbaiki Revisi
                        </Button>
                      )}

                    {user?.role !== 'admin' &&
                      app.status === 'valid' && (
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push('/dashboard/penerbitan')
                          }
                        >
                          Lihat Penerbitan
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DETAIL */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Permohonan</DialogTitle>
            <DialogDescription>
              Informasi ringkas permohonan
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">
                  Nama Pasien
                </p>
                <p className="font-medium">
                  {selectedApp.namaPasien || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Status</p>
                <div>
                  {getStatusBadge(selectedApp.status)}
                </div>
              </div>

              {selectedApp.status === 'reviewed' && (
                <div>
                  <p className="text-xs text-gray-500">
                    Catatan Revisi
                  </p>
                  <p className="font-medium">
                    {getNote(selectedApp)}
                  </p>
                </div>
              )}
            </div>
          )}

          {user?.role === 'admin' && selectedApp && (
            <DialogFooter>
              <Button
                onClick={() =>
                  handleApprove(selectedApp.id, true)
                }
              >
                Setujui
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  setRevisiId(selectedApp.id);
                  setShowRevisiModal(true);
                }}
              >
                Revisi
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL CATATAN REVISI */}
      <Dialog
        open={showRevisiModal}
        onOpenChange={setShowRevisiModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Catatan Revisi</DialogTitle>

            <DialogDescription>
              Masukkan catatan revisi untuk pemohon
            </DialogDescription>
          </DialogHeader>

          <textarea
            className="w-full border rounded-md p-2 text-sm"
            rows={4}
            placeholder="Contoh: Mohon lengkapi nomor surat izin..."
            value={revisiNote}
            onChange={(e) => setRevisiNote(e.target.value)}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRevisiModal(false)}
              disabled={submittingRevisi}
            >
              Batal
            </Button>

            <Button
              variant="destructive"
              onClick={submitRevisi}
              disabled={
                submittingRevisi || !revisiNote.trim()
              }
            >
              {submittingRevisi
                ? 'Menyimpan...'
                : 'Submit Revisi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}