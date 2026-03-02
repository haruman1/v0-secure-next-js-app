'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { EvacuationForm } from '../form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

export default function EvacuationDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [evacuation, setEvacuation] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchEvacuation();
  }, [id]);

  const fetchEvacuation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/evacuations/${id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEvacuation(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load evacuation',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/evacuations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update');
      }

      // Refresh the data
      await fetchEvacuation();
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/evacuations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-primary text-lg font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  if (!evacuation) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Evacuation request not found</AlertDescription>
          </Alert>
          <Button
            onClick={() => router.back()}
            className="mt-4 gap-2"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          onClick={() => router.back()}
          className="mb-6 gap-2"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  {evacuation.namaPasien}
                </CardTitle>
                <CardDescription className="mt-2">
                  Request #E{evacuation.id} -{' '}
                  {new Date(evacuation.tanggalPerjalanan).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge
                  className={
                    statusColors[evacuation.status] ||
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {evacuation.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Current Location
                </p>
                <p className="text-foreground font-medium">
                  {evacuation.location}
                </p>
              </div>
              {evacuation.destination && (
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="text-foreground font-medium">
                    {evacuation.destination}
                  </p>
                </div>
              )}
              {evacuation.patient_age && (
                <div>
                  <p className="text-sm text-muted-foreground">Patient Age</p>
                  <p className="text-foreground font-medium">
                    {evacuation.patient_age} years
                  </p>
                </div>
              )}
              {evacuation.contact_phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Contact Phone</p>
                  <p className="text-foreground font-medium">
                    {evacuation.contact_phone}
                  </p>
                </div>
              )}
            </div>
            {evacuation.patient_condition && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Medical Condition
                </p>
                <p className="text-foreground">
                  {evacuation.patient_condition}
                </p>
              </div>
            )}
            {evacuation.medical_notes && (
              <div>
                <p className="text-sm text-muted-foreground">Medical Notes</p>
                <p className="text-foreground">{evacuation.medical_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <EvacuationForm
          initialData={evacuation}
          onSubmit={handleSubmit}
          isAdmin={user?.role === 'admin'}
          isLoading={isSubmitting}
        />

        {/* Delete Button */}
        <div className="mt-6 flex gap-2">
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="gap-2"
            disabled={isSubmitting}
          >
            <Trash2 className="h-4 w-4" />
            {deleteConfirm ? 'Confirm Delete' : 'Delete Request'}
          </Button>
          {deleteConfirm && (
            <Button
              onClick={() => setDeleteConfirm(false)}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
