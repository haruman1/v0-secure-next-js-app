'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useApplications } from '@/app/context/ApplicationContext';

export default function DraftPage() {
  const router = useRouter();
  const { getApplicationsByStatus, updateApplication, deleteApplication } =
    useApplications();
  const drafts = getApplicationsByStatus('draft');

  const handleContinue = (id: string) => {
    router.push(`/permohonan?id=${id}`);
    toast.info('Membuka draft untuk dilanjutkan');
  };

  const handleSubmit = (id: string) => {
    updateApplication(id, { status: 'verification' });
    toast.success('Draft berhasil diajukan untuk verifikasi');
  };

  const handleDelete = (id: string) => {
    deleteApplication(id);
    toast.success('Draft berhasil dihapus');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Draft</h1>
        <p className="text-gray-600">Daftar draft permohonan yang tersimpan</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Draft Tersimpan</CardTitle>
          <CardDescription>{drafts.length} draft tersimpan</CardDescription>
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Belum ada draft yang tersimpan
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map((app) => (
                <div key={app.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">
                        {app.namaPasien || 'Draft Baru'}
                      </div>
                      <div className="text-sm text-gray-600">ID: {app.id}</div>
                      {app.noPenerbangan && (
                        <div className="text-sm text-gray-600">
                          Penerbangan: {app.noPenerbangan}
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        Terakhir disimpan:{' '}
                        {new Date(app.updatedAt).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <Badge variant="outline">Draft</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContinue(app.id)}
                    >
                      Lanjutkan Edit
                    </Button>
                    <Button size="sm" onClick={() => handleSubmit(app.id)}>
                      Ajukan Sekarang
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(app.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}