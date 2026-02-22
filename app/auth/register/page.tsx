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
import { useAuth } from '@/app/context/auth-context';
import { useLanguage } from '@/app/context/language-context';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [validations, setValidations] = useState({
    length: false,
    hasNumber: false,
    hasUppercase: false,
    hasSpecial: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const validatePassword = (pwd: string) => {
    setValidations({
      length: pwd.length >= 8,
      hasNumber: /\d/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
      hasSpecial: /[!@#$%^&*]/.test(pwd),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('auth.atLeast8Chars'));
      return;
    }

    setIsLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone,
      );
      toast({
        title: t('auth.registrationSuccess'),
        description: t('auth.registrationSuccessDesc'),
        variant: 'default',
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.loadingError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t('auth.register')}</CardTitle>
          <CardDescription>{t('evacuation.title')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                {t('auth.fullName')}
              </label>
              <Input
                id="fullName"
                name="fullName"
                placeholder={t('auth.fullName')}
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('auth.email')}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('auth.email')}
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                {t('auth.phone')}
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder={t('auth.phonePlaceholder')}
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('auth.password')}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <div className="space-y-1 text-xs mt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-3 w-3 ${validations.length ? 'text-green-600' : 'text-muted-foreground'}`}
                  />
                  <span>{t('auth.atLeast8Chars')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-3 w-3 ${validations.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}
                  />
                  <span>{t('auth.oneNumber')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-3 w-3 ${validations.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`}
                  />
                  <span>{t('auth.oneUppercase')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                {t('auth.confirmPassword')}
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t('auth.confirmPassword')}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('messages.pleaseWait') : t('auth.register')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link
                href="/auth/login"
                className="text-primary hover:underline font-medium"
              >
                {t('auth.login')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
