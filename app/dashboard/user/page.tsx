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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, LogOut, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/app/context/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';

interface EvacuationRequest {
  id: number;
  patient_name: string;
  location: string;
  priority_level: string;
  status: string;
  request_date: string;
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  approved: 'bg-green-100 text-green-800',
  in_transit: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-200 text-green-900',
  cancelled: 'bg-red-100 text-red-800',
};

export default function UserDashboard() {
  const { user, logout, isLoading } = useAuth();
  const { t, setLanguage } = useLanguage();
  const router = useRouter();
  const [evacuations, setEvacuations] = useState<EvacuationRequest[]>([]);
  const [error, setError] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    } else if (user && user.role === 'admin') {
      router.push('/dashboard/admin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchEvacuations();
  }, []);

  const fetchEvacuations = async () => {
    try {
      setDataLoading(true);
      const response = await fetch('/api/evacuations');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEvacuations(data.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load evacuations',
      );
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-primary text-lg font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  const approvedCount = evacuations.filter(
    (e) => e.status === 'approved',
  ).length;
  const completedCount = evacuations.filter(
    (e) => e.status === 'completed',
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Medical Evacuation System
              </h1>
              <p className="text-sm text-muted-foreground">My Requests</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {user?.fullName}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {evacuations.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total evacuations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/10 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-500">
                {approvedCount}
              </div>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                Approved requests
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/10 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-500">
                {completedCount}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Completed evacuations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create New Request */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/dashboard/evacuation/new')}
            className="gap-2"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Create New Request
          </Button>
        </div>

        {/* Evacuations List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Evacuation Requests</CardTitle>
            <CardDescription>
              Track all your medical evacuation requests
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {evacuations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-muted-foreground"
                      >
                        No evacuation requests yet. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    evacuations.map((evac) => (
                      <tr
                        key={evac.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-foreground">
                          {evac.patient_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground truncate max-w-xs">
                          {evac.location}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`${priorityColors[evac.priority_level] || 'bg-gray-100 text-gray-800'} capitalize`}
                          >
                            {evac.priority_level}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`${statusColors[evac.status] || 'bg-gray-100 text-gray-800'} capitalize`}
                          >
                            {evac.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(evac.request_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/evacuation/${evac.id}`)
                            }
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
