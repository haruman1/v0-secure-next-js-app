'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

import { useLanguage } from '@/app/context/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { t } = useLanguage();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validations, setValidations] = useState({
    length: false,
    hasNumber: false,
    hasUppercase: false,
  });

  useEffect(() => {
    if (!token) {
      setError(t('auth.invalidToken'));
    }
  }, [token, t]);

  const validatePassword = (pwd: string) => {
    setValidations({
      length: pwd.length >= 8,
      hasNumber: /\d/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    validatePassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!token) {
      setError(t('auth.invalidToken'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('auth.atLeast8Chars'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          otp: otp || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('messages.serverError'));
      }

      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');

      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border border-sky-100">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t('auth.resetPasswordTitle')}</CardTitle>
        <CardDescription>{t('auth.resetPasswordDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-100">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {t('auth.resetSuccess')}
              </AlertDescription>
            </Alert>
          )}

          {/* OTP Input - if needed */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('auth.otpRequired')}
            </label>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isLoading || success}
            >
              <InputOTPGroup className="justify-center">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">
              {t('auth.otpRequiredDesc')}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              {t('auth.newPassword')}
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.newPassword')}
                value={newPassword}
                onChange={handlePasswordChange}
                className="pr-10"
                required
                disabled={isLoading || success}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-sky-600 transition-colors"
                disabled={isLoading || success}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="space-y-1 text-xs mt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3 w-3 ${validations.length ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span>{t('auth.atLeast8Chars')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3 w-3 ${validations.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span>{t('auth.oneNumber')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3 w-3 ${validations.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span>{t('auth.oneUppercase')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('auth.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
                required
                disabled={isLoading || success}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-sky-600 transition-colors"
                disabled={isLoading || success}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white"
            disabled={isLoading || success}
          >
            {isLoading ? t('auth.resetting') : t('auth.resetPasswordButton')}
          </Button>

          <div className="flex items-center justify-center">
            <Link
              href="/auth/login"
              className="text-sm text-sky-600 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-100 p-4">
      {/* LANGUAGE SWITCHER */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Suspense fallback={
        <Card className="w-full max-w-md shadow-lg border border-sky-100">
          <CardHeader>
            <CardTitle>{t('common.loading')}</CardTitle>
          </CardHeader>
        </Card>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}


