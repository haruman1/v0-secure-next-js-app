'use client';

import { useEffect, useState } from 'react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SelesaiItem = {
  id: string;
  namaPasien: string | null;
  noPenerbangan: string | null;
  tanggalPerjalanan: string | null;
  suratPenerbitan: string | null;
  created_at?: string | null;
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

function formatTime(dateStr?: string | null) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function calculateDays(dateStr?: string | null) {
  if (!dateStr) return 0;
  const created = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function isPdf(url: string) {
  return url.toLowerCase().includes('.pdf');
}

export default function SelesaiPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<SelesaiItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 state untuk modal preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        }
      );
      const result = await res.json();

      if (res.ok) {
        setItems(result.data || []);
      }
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Selesai</h1>
        <p className="text-gray-600">
          Daftar permohonan yang sudah terbit suratnya dan selesai diproses
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Selesai</CardTitle>
          <CardDescription>{items.length} permohonan selesai</CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Belum ada data selesai
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold">
                      {item.namaPasien || '-'}
                    </div>
                     <div className="text-sm text-gray-500">
                      ID: {item.id}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                      <Badge variant="outline" className="text-[10px]">
                        Input: {formatDate(item.created_at)} {formatTime(item.created_at)}
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] font-bold">
                        Sudah {calculateDays(item.created_at)} Hari
                      </Badge>
                    </div>
                  </div>

                  {item.suratPenerbitan && (
                    <div className="flex gap-2">
                      {/* 🔥 PREVIEW MODAL */}
                      <Button
                        variant="outline"
                        onClick={() =>
                          setPreviewUrl(item.suratPenerbitan!)
                        }
                      >
                        Lihat Surat
                      </Button>

                      {/* OPTIONAL DOWNLOAD */}
                      <Button asChild>
                        <a
                          href={item.suratPenerbitan}
                          target="_blank"
                          rel="noreferrer"
                          download
                        >
                          Download
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔥 MODAL PREVIEW */}
      <Dialog
        open={Boolean(previewUrl)}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Preview Surat Penerbitan</DialogTitle>
          </DialogHeader>

          {previewUrl && (
            <div className="h-[75vh] w-full border rounded-md overflow-hidden">
              {isPdf(previewUrl) ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title="Preview PDF"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview Surat"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}