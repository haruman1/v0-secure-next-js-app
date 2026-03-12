
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';

import { Ambulance, AlertCircle } from 'lucide-react';

import { useAuth } from '@/app/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

import { useLanguage } from '@/app/context/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function LoginPage() {

  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [isLoading,setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {

      await login(email,password);

      toast({
        title: t('auth.loginSuccess'),
        description: t('auth.loginSuccessDesc'),
        variant: 'success',
      });

      setTimeout(()=>{
        router.push('/dashboard');
      },1500);

    } catch (err) {

      const message =
        err instanceof Error
        ? err.message
        : t('auth.loginFailedDesc');

      setError(message);

      toast({
        title: t('auth.loginFailed'),
        description: message,
        variant: 'destructive',
      });

    } finally {

      setIsLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-100 p-6">

      {/* LANGUAGE SWITCHER */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md shadow-xl border border-sky-100">

        <CardHeader className="text-center space-y-3">

          <div className="mx-auto h-12 w-12 rounded-xl bg-sky-500 text-white flex items-center justify-center">
            <Ambulance className="h-6 w-6" />
          </div>

          <CardTitle className="text-2xl font-semibold">
            {t('auth.login')}
          </CardTitle>

          <CardDescription>
            {t('auth.loginDescription')}
          </CardDescription>

        </CardHeader>

        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* EMAIL */}
            <div className="space-y-2">

              <label className="text-sm font-medium">
                {t('auth.email')}
              </label>

              <Input
                type="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="h-11"
                required
                disabled={isLoading}
              />

            </div>

            {/* PASSWORD */}
            <div className="space-y-2">

              <div className="flex justify-between items-center">

                <label className="text-sm font-medium">
                  {t('auth.password')}
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-sky-600 hover:underline"
                >
                  {t('auth.forgotPassword')}
                </Link>

              </div>

              <Input
                type="password"
                placeholder={t('auth.password')}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="h-11"
                required
                disabled={isLoading}
              />

            </div>

            {/* LOGIN BUTTON */}
            <Button
              type="submit"
              className="w-full h-11 bg-sky-500 hover:bg-sky-600 text-white"
              disabled={isLoading}
            >
              {isLoading
                ? t('auth.loggingIn')
                : t('auth.login')}
            </Button>

            {/* DIVIDER */}
            <div className="relative">

              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"/>
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">
                  {t('auth.or')}
                </span>
              </div>

            </div>

            {/* REGISTER */}
            <p className="text-center text-sm text-muted-foreground">

              {t('auth.dontHaveAccount')}{' '}

              <Link
                href="/auth/register"
                className="text-sky-600 hover:underline font-medium"
              >
                {t('auth.register')}
              </Link>

            </p>

          </form>

        </CardContent>

      </Card>

      <Toaster />

    </div>

  );

}
