'use client';

import { useState } from 'react';
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
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { useLanguage } from '@/app/context/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [resetType, setResetType] = useState<'email_verification' | 'otp'>(
    'email_verification',
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request password reset');
      }

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-100 p-4">
      {/* LANGUAGE SWITCHER */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md shadow-lg border border-sky-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t('auth.forgotPasswordTitle')}</CardTitle>
          <CardDescription>
            {t('auth.forgotPasswordDescription')}
          </CardDescription>
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
                  {t('auth.resetInstructionsSent')}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('auth.email')}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || success}
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">
                {t('auth.howToReset')}
              </p>
              <RadioGroup
                value={resetType}
                onValueChange={(value) => setResetType(value as any)}
              >
                <div className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-3 rounded-lg transition-colors">
                  <RadioGroupItem
                    value="email_verification"
                    id="email_verification"
                    disabled={isLoading || success}
                  />
                  <label
                    htmlFor="email_verification"
                    className="text-sm cursor-pointer flex-1"
                  >
                    {t('auth.emailVerificationLink')}
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('auth.emailVerificationLinkDesc')}
                    </p>
                  </label>
                </div>
                <div className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-3 rounded-lg transition-colors">
                  <RadioGroupItem
                    value="otp"
                    id="otp"
                    disabled={isLoading || success}
                  />
                  <label
                    htmlFor="otp"
                    className="text-sm cursor-pointer flex-1"
                  >
                    {t('auth.otpCode')}
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('auth.otpCodeDesc')}
                    </p>
                  </label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white"
              disabled={isLoading || success}
            >
              {isLoading ? t('common.loading') : t('auth.sendResetInstructions')}
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
    </div>
  );
}
