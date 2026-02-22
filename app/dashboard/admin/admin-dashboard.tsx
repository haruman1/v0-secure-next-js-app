'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { useLanguage } from '@/app/context/language-context';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { StatusCards } from '@/components/status-cards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StatusCounts {
  total: number;
  verification: number;
  revision: number;
  submitted: number;
  completed: number;
  draft: number;
}

export function AdminDashboardContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [counts, setCounts] = useState<StatusCounts>({
    total: 0,
    verification: 0,
    revision: 0,
    submitted: 0,
    completed: 0,
    draft: 0,
  });
  const [error, setError] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    } else if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/evacuations');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        const evacuations = data.data || [];

        const newCounts = {
          total: evacuations.length,
          verification: evacuations.filter((e: any) => e.status === 'valid').length,
          revision: evacuations.filter((e: any) => e.status === 'reviewed').length,
          submitted: evacuations.filter((e: any) => e.status === 'pending').length,
          completed: evacuations.filter((e: any) => e.status === 'completed').length,
          draft: evacuations.filter((e: any) => e.status === 'draft').length,
        };

        setCounts(newCounts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setDataLoading(false);
      }
    };

    if (user && !isLoading) {
      fetchCounts();
    }
  }, [user, isLoading]);

  if (isLoading || dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">{t('messages.loading')}</div>;
  }

  return (
    <div className="flex gap-0">
      <DashboardSidebar />
      
      <main className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-border p-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('dashboard.admin')}</h1>
          <p className="text-muted-foreground">{t('evacuation.title')}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Status Cards */}
          <StatusCards counts={counts} />

          {/* Admin Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>{t('dashboard.statistics')}</CardTitle>
              <CardDescription>
                System overview and management information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">{t('dashboard.totalEvacuations')}</p>
                  <p className="text-2xl font-bold">{counts.total}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">{t('dashboard.pendingRequests')}</p>
                  <p className="text-2xl font-bold">{counts.submitted}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">{t('dashboard.completedRequests')}</p>
                  <p className="text-2xl font-bold">{counts.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
