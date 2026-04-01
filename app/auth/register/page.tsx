'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Alert, AlertDescription } from '@/components/ui/alert';

import {
  Ambulance,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

import { useAuth } from '@/app/context/auth-context';
import { useLanguage } from '@/app/context/language-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user' as 'admin' | 'user',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [validations, setValidations] = useState({
    length: false,
    hasNumber: false,
    hasUppercase: false,
  });

  const validatePassword = (pwd: string) => {
    setValidations({
      length: pwd.length >= 8,
      hasNumber: /\d/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
        formData.role,
      );

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.loadingError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-100 p-6">
      <Card className="w-full max-w-md shadow-xl border border-sky-100">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-xl bg-sky-500 text-white flex items-center justify-center">
            <Ambulance className="h-6 w-6" />
          </div>

          <CardTitle className="text-2xl font-semibold">
            Buat Akun Medivac
          </CardTitle>

          <CardDescription>
            Daftar untuk evakuasi medis secara digital
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

            {/* NAMA */}

            <div className="space-y-2">
              <label className="text-sm font-medium">Nama lengkap</label>

              <Input
                name="fullName"
                placeholder="Nama lengkap"
                value={formData.fullName}
                onChange={handleChange}
                className="h-11"
                required
              />
            </div>

            {/* ROLE */}

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>

              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'user') =>
                  setFormData((prev) => ({
                    ...prev,
                    role: value,
                  }))
                }
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* EMAIL */}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>

              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="h-11"
                required
              />
            </div>

            {/* TELEPON */}

            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor telepon</label>

              <Input
                name="phone"
                type="tel"
                placeholder="Nomor telepon"
                value={formData.phone}
                onChange={handleChange}
                className="h-11"
              />
            </div>

            {/* PASSWORD */}

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              <div className="space-y-1 text-xs mt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-3 w-3 ${
                      validations.length
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span>Minimal 8 karakter</span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-3 w-3 ${
                      validations.hasNumber
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span>Memiliki angka</span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-3 w-3 ${
                      validations.hasUppercase
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span>Memiliki huruf besar</span>
                </div>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="space-y-2">
              <label className="text-sm font-medium">Konfirmasi password</label>
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Konfirmasi password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* BUTTON */}

            <Button
              type="submit"
              className="w-full h-11 bg-sky-500 hover:bg-sky-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Daftar'}
            </Button>

            {/* LOGIN */}

            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link
                href="/auth/login"
                className="text-sky-600 font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
