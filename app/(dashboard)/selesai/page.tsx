'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type SelesaiItem = {
  id: string;
  namaPasien: string | null;
  noPenerbangan: string | null;
  tanggalPerjalanan: string | null;
  suratPenerbitan: string | null;
};

export default function SelesaiPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<SelesaiItem[]>([]);
  const [loading, setLoading] = useState(true);

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
            <div className="text-center py-10 text-gray-500">Belum ada data selesai</div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{item.namaPasien || '-'}</div>
                    <div className="text-sm text-gray-500">{item.noPenerbangan || '-'}</div>
                    <div className="text-sm text-gray-500">ID: {item.id}</div>
                  </div>

                  {item.suratPenerbitan && (
                    <Button asChild>
                      <a href={item.suratPenerbitan} target="_blank" rel="noreferrer">
                        Lihat Surat
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}