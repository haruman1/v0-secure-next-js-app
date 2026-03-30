'use client';

import Link from 'next/link';
import {
  FileText,
  CheckCircle,
  Edit,
  FileCheck,
  CheckSquare,
  FilePlus,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useApplications } from '@/app/context/ApplicationContext';
import { useAuth } from '@/app/context/auth-context';

export default function Dashboard() {
  const { getApplicationsByStatus } = useApplications();
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  const isAdmin = user?.role === 'admin';

  /**
   * USER → hanya lihat Draft / Verifikasi / Revisi
   * ADMIN → lihat semua
   */
  const stats = [
    {
      label: 'Verifikasi',
      value: getApplicationsByStatus('pending').length.toString(),
      icon: CheckCircle,
      color: 'bg-yellow-500',
      show: true,
    },
    {
      label: 'Revisi',
      value: getApplicationsByStatus('reviewed').length.toString(),
      icon: Edit,
      color: 'bg-orange-500',
      show: true,
    },
   
    {
      label: 'Penerbitan',
      value: getApplicationsByStatus('valid').length.toString(),
      icon: FileCheck,
      color: 'bg-green-500',
      show: isAdmin,
    },
    {
      label: 'Selesai',
      value: getApplicationsByStatus('completed').length.toString(),
      icon: CheckSquare,
      color: 'bg-teal-500',
      show: isAdmin,
    },
  ].filter((s) => s.show);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Sistem Manajemen Evakuasi Medis Udara</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="size-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* USER ONLY ACTION */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Mulai Permohonan Baru</CardTitle>
            <CardDescription>
              Buat permohonan evakuasi medis udara baru atau lanjutkan draft
            </CardDescription>
          </CardHeader>

          <CardContent className="flex gap-4">
            <Link
              href="dashboard/permohonan"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              Buat Permohonan Baru
            </Link>

            <Link
              href="/dashboard/draft"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg"
            >
              Lihat Draft
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}