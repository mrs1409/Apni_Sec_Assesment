'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Loader2, CheckCircle2, Send } from 'lucide-react';

function VerificationPendingContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address not found. Please register again.');
      return;
    }

    setIsResending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      setResent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-8">
      <div className="w-full max-w-lg text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center">
            <Shield className="w-7 h-7 text-[#1a1a2e]" />
          </div>
          <span className="text-2xl font-bold text-[#1a1a2e]">ApniSec</span>
        </Link>

        <div className="card-neo p-8">
          <div className="w-24 h-24 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center mx-auto mb-6">
            <Mail className="w-12 h-12 text-[#1a1a2e]" />
          </div>

          <h1 className="text-3xl font-black text-[#1a1a2e] mb-4">Verify Your Email</h1>
          
          <p className="text-[#64748b] mb-4 text-lg">
            We&apos;ve sent a verification link to your email address. 
            Please check your inbox and click the link to verify your account.
          </p>

          {email && (
            <div className="bg-[#e0f2fe] border-2 border-[#1a1a2e] p-3 mb-6 inline-block">
              <p className="text-[#1a1a2e] font-mono text-sm">{email}</p>
            </div>
          )}

          <div className="bg-[#f1f5f9] border-2 border-[#1a1a2e] p-4 mb-6">
            <p className="text-sm text-[#64748b]">
              <strong className="text-[#1a1a2e]">Note:</strong> You must verify your email before you can log in to your dashboard.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-3 border-red-500 p-4 mb-6">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {resent ? (
            <div className="bg-green-50 border-3 border-green-500 p-4 mb-6 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-green-600 font-medium">Verification email sent! Check your inbox.</p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-[#64748b] mb-4">Didn&apos;t receive the email?</p>
              <button
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="btn-neo btn-neo-secondary py-3 px-6 inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Resend Verification Email
                  </>
                )}
              </button>
            </div>
          )}

          <div className="border-t-2 border-[#e2e8f0] pt-6 mt-6">
            <p className="text-[#64748b] mb-4">Already verified your email?</p>
            <Link href="/login" className="btn-neo btn-neo-primary py-3 px-8 inline-flex">
              Go to Login
            </Link>
          </div>
        </div>

        <p className="text-[#64748b] text-sm mt-8">
          Need help?{' '}
          <Link href="/#contact" className="text-[#4ade80] font-semibold hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerificationPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4ade80]" />
      </div>
    }>
      <VerificationPendingContent />
    </Suspense>
  );
}
