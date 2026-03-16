'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      setError('Invalid or missing reset token');
    }
  }, [token]);

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
      setError('Invalid reset token');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
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
        throw new Error(errorData.error || 'Failed to reset password');
      }

      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');

      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create New Password</CardTitle>
        <CardDescription>Enter your new password to complete the reset</CardDescription>
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
                Password reset successfully! Redirecting to login...
              </AlertDescription>
            </Alert>
          )}

          {/* OTP Input - if needed */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              One-Time Password (if required)
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
              Only fill this if you received a one-time password via email
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Create a strong password"
              value={newPassword}
              onChange={handlePasswordChange}
              required
              disabled={isLoading || success}
            />
            <div className="space-y-1 text-xs mt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3 w-3 ${validations.length ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3 w-3 ${validations.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span>Contains a number</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-3 w-3 ${validations.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span>Contains uppercase letter</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading || success}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || success}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <div className="flex items-center justify-center">
            <Link
              href="/auth/login"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

