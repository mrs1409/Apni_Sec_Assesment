'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setSuccess(true);
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
            Forgot Your<br />
            <span className="text-[#4ade80]">Password?</span>
          </h1>
          
          <p className="text-gray-400 text-lg max-w-md">
            No worries! Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#2a2a4e] border-2 border-[#4ade80] max-w-sm">
              <div className="w-10 h-10 bg-[#4ade80] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#1a1a2e]" />
              </div>
              <div>
                <p className="text-white font-semibold">Secure Reset</p>
                <p className="text-gray-400 text-sm">Link expires in 1 hour</p>
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
              <h2 className="text-3xl font-black text-[#1a1a2e] mb-4">Check Your Email</h2>
              <p className="text-[#64748b] mb-8">
                We&apos;ve sent a password reset link to <strong className="text-[#1a1a2e]">{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
              <p className="text-sm text-[#64748b] mb-6">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button 
                  onClick={() => setSuccess(false)} 
                  className="text-[#4ade80] font-semibold hover:underline"
                >
                  try again
                </button>
              </p>
              <Link href="/login" className="btn-neo btn-neo-primary w-full justify-center">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-black text-[#1a1a2e] mb-2">Reset Password</h2>
              <p className="text-[#64748b] mb-8">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <div className="bg-red-50 border-3 border-red-500 p-4 mb-6">
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-neo pl-12"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
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
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <p className="text-center text-[#64748b] text-sm mt-8">
                Remember your password?{' '}
                <Link href="/login" className="text-[#4ade80] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
