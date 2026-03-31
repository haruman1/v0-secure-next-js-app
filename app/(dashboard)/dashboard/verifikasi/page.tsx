'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import Image from 'next/image';

/* ================= TYPES ================= */

type RawAppItem = Record<string, unknown>;

type AppItem = {
  id: string;
  namaPasien: string | null;
  noPenerbangan: string | null;
  tanggalPerjalanan: string | null;
  status: 'pending' | 'reviewed' | 'valid' | 'canceled';
  catatanRevisi?: string | null;
  catatan_revisi?: string | null;
  revisionNotes?: string | null;
  created_at?: string;
  updated_at?: string;
  fotoKondisiPasien?: string | null;
  ktpPasien?: string | null;
  manifetPrivateJet?: string | null;
  rekamMedisPasien?: string | null;
  suratRujukan?: string | null;
  tiketPesawat?: string | null;
};

/* ================= HELPERS ================= */

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
    namaPasien:
      (item.namaPasien as string) ||
      (item.nama_pasien as string) ||
      (item.patient_name as string) ||
      null,
    noPenerbangan:
      (item.noPenerbangan as string) || (item.no_penerbangan as string) || null,
    tanggalPerjalanan:
      (item.tanggalPerjalanan as string) ||
      (item.tanggal_perjalanan as string) ||
      null,
    status: normalizeStatus(item.status),
    catatanRevisi: (item.catatanRevisi as string) || null,
    catatan_revisi: (item.catatan_revisi as string) || null,
    revisionNotes: (item.revisionNotes as string) || null,
    created_at: item.created_at as string,
    updated_at: item.updated_at as string,
    fotoKondisiPasien: item.fotoKondisiPasien as string,
    ktpPasien: item.ktpPasien as string,
    manifetPrivateJet: item.manifetPrivateJet as string,
    rekamMedisPasien: item.rekamMedisPasien as string,
    suratRujukan: item.suratRujukan as string,
    tiketPesawat: item.tiketPesawat as string,
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

  const [applications, setApplications] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [showRevisiModal, setShowRevisiModal] = useState(false);
  const [revisiNote, setRevisiNote] = useState('');
  const [revisiId, setRevisiId] = useState<string | null>(null);
  const [submittingRevisi, setSubmittingRevisi] = useState(false);

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
      Swal.fire('Error', 'Gagal mengambil data', 'error');
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
      setSelectedApp(mapApplication(result.data));
      setShowDetail(true);
    } catch {
      Swal.fire('Error', 'Gagal mengambil detail', 'error');
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

      Swal.fire('Berhasil', 'Permohonan disetujui', 'success');

      setApplications((prev) => prev.filter((a) => a.id !== id));
      setShowDetail(false);

      if (redirect) router.push('/dashboard/penerbitan');
    } catch {
      Swal.fire('Error', 'Gagal approve', 'error');
    } finally {
      setLoadingAction(false);
    }
  }

  async function submitRevisi() {
    if (!revisiId || !revisiNote.trim()) return;

    setSubmittingRevisi(true);
    try {
      const res = await fetch(`/api/evacuations/${revisiId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ catatanRevisi: revisiNote.trim() }),
      });

      if (!res.ok) throw new Error();

      Swal.fire('Berhasil', 'Dikembalikan untuk revisi', 'success');

      setApplications((prev) => prev.filter((a) => a.id !== revisiId));
      setShowRevisiModal(false);
      setShowDetail(false);
      setRevisiNote('');
    } catch {
      Swal.fire('Error', 'Gagal submit revisi', 'error');
    } finally {
      setSubmittingRevisi(false);
    }
  }

  function getStatusBadge(status: AppItem['status']) {
    if (status === 'pending') return <Badge>Menunggu</Badge>;
    if (status === 'reviewed')
      return <Badge variant="destructive">Revisi</Badge>;
    if (status === 'valid')
      return <Badge className="bg-green-600">Valid</Badge>;
    return <Badge variant="outline">Batal</Badge>;
  }

  const getNote = (app: AppItem) =>
    app.catatanRevisi || app.catatan_revisi || app.revisionNotes || '-';

  if (authLoading) return null;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Verifikasi Permohonan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Data Permohonan</CardTitle>
          <CardDescription>{applications.length} data</CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : applications.length === 0 ? (
            <div>Tidak ada data</div>
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
                  <Button onClick={() => openDetail(app.id)}>Detail</Button>

                  {user?.role === 'admin' && (
                    <>
                      <Button onClick={() => handleApprove(app.id)}>
                        Setujui
                      </Button>
                      <Button
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
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* DETAIL MODAL FULL */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Permohonan</DialogTitle>
            <DialogDescription>Informasi lengkap</DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-3 text-sm">
              <p>
                <b>Nama:</b> {selectedApp.namaPasien}
              </p>
              <p>
                <b>Penerbangan:</b> {selectedApp.noPenerbangan}
              </p>
              <p>
                <b>Tanggal:</b> {selectedApp.tanggalPerjalanan}
              </p>
              <p>
                <b>Dibuat:</b> {formatDateTime(selectedApp.created_at)}
              </p>
              <p>
                <b>Update:</b> {formatDateTime(selectedApp.updated_at)}
              </p>
              <p>
                <b>Catatan:</b> {getNote(selectedApp)}
              </p>
              <p>
                <b>Status:</b> {getStatusBadge(selectedApp.status)}
              </p>
              <div>
                <p className="font-semibold mb-2">Dokumen:</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: 'Foto kondisi pasien',
                      src: selectedApp.fotoKondisiPasien,
                    },
                    { label: 'KTP pasien', src: selectedApp.ktpPasien },
                    {
                      label: 'Manifest private jet',
                      src: selectedApp.manifetPrivateJet,
                    },
                    { label: 'Rekam medis', src: selectedApp.rekamMedisPasien },
                    { label: 'Surat rujukan', src: selectedApp.suratRujukan },
                    { label: 'Tiket pesawat', src: selectedApp.tiketPesawat },
                  ].map((doc, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-2 flex flex-col items-center"
                    >
                      <p className="text-xs text-gray-500 mb-2 text-center">
                        {doc.label}
                      </p>

                      <Image
                        src={safeImage(doc.src)}
                        alt={doc.label}
                        width={150}
                        height={150}
                        className="rounded object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {user?.role === 'admin' && (
                <DialogFooter>
                  <Button onClick={() => handleApprove(selectedApp.id)}>
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* REVISI */}
      <Dialog open={showRevisiModal} onOpenChange={setShowRevisiModal}>
        <DialogContent>
          <textarea
            className="w-full border p-2"
            value={revisiNote}
            onChange={(e) => setRevisiNote(e.target.value)}
          />
          <Button onClick={submitRevisi}>Submit</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
