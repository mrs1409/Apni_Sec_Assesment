'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, Lock, Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#4ade80] opacity-20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#4ade80] opacity-10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-[#4ade80] border-3 border-white flex items-center justify-center">
              <Shield className="w-7 h-7 text-[#1a1a2e]" />
            </div>
            <span className="text-2xl font-bold text-white">ApniSec</span>
          </Link>
          
          <h1 className="text-4xl font-black text-white mb-6">
            Create a New<br />
            <span className="text-[#4ade80]">Secure Password</span>
          </h1>
          
          <p className="text-gray-400 text-lg max-w-md">
            Choose a strong password that you haven&apos;t used before. 
            A good password is at least 8 characters long and includes a mix of letters, numbers, and symbols.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#2a2a4e] border-2 border-[#4ade80] max-w-sm">
              <div className="w-10 h-10 bg-[#4ade80] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#1a1a2e]" />
              </div>
              <div>
                <p className="text-white font-semibold">Password Tips</p>
                <p className="text-gray-400 text-sm">Use a unique, complex password</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-[#64748b] hover:text-[#1a1a2e] mb-8 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#1a1a2e]" />
            </div>
            <span className="text-xl font-bold text-[#1a1a2e]">ApniSec</span>
          </div>

          {success ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#1a1a2e]" />
              </div>
              <h2 className="text-3xl font-black text-[#1a1a2e] mb-4">Password Reset!</h2>
              <p className="text-[#64748b] mb-8">
                Your password has been successfully reset. You will be redirected to the login page in a few seconds.
              </p>
              <Link href="/login" className="btn-neo btn-neo-primary w-full justify-center">
                Go to Login
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-[#f59e0b] border-3 border-[#1a1a2e] flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-[#1a1a2e]" />
              </div>
              <h2 className="text-3xl font-black text-[#1a1a2e] mb-4">Invalid Link</h2>
              <p className="text-[#64748b] mb-8">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/forgot-password" className="btn-neo btn-neo-primary w-full justify-center">
                Request New Link
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-black text-[#1a1a2e] mb-2">Reset Password</h2>
              <p className="text-[#64748b] mb-8">
                Enter your new password below.
              </p>

              {error && (
                <div className="bg-red-50 border-3 border-red-500 p-4 mb-6">
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-neo pl-12 pr-12"
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1a1a2e]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-neo pl-12 pr-12"
                      placeholder="Confirm your password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1a1a2e]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-neo btn-neo-primary w-full justify-center text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-12 h-12 animate-spin text-[#4ade80]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
