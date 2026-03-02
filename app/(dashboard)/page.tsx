import { redirect } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';

export default function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  if (!isLoading) {
    if (!user) {
      redirect('/auth/login');
    }
    redirect('/dashboard');
  }
}
