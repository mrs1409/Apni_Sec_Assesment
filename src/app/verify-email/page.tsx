'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, Loader2, CheckCircle2, AlertTriangle, Mail } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: 'GET',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to verify email');
        }

        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Failed to verify email');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center">
            <Shield className="w-7 h-7 text-[#1a1a2e]" />
          </div>
          <span className="text-2xl font-bold text-[#1a1a2e]">ApniSec</span>
        </Link>

        <div className="card-neo p-8">
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-[#1a1a2e] animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-[#1a1a2e] mb-4">Verifying Your Email</h1>
              <p className="text-[#64748b] mb-6">Please wait while we verify your email address...</p>
              <Loader2 className="w-8 h-8 animate-spin text-[#4ade80] mx-auto" />
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#1a1a2e]" />
              </div>
              <h1 className="text-2xl font-black text-[#1a1a2e] mb-4">Email Verified!</h1>
              <p className="text-[#64748b] mb-6">{message}</p>
              <p className="text-sm text-[#64748b] mb-6">Redirecting you to the dashboard...</p>
              <Link href="/dashboard" className="btn-neo btn-neo-primary w-full justify-center">
                Go to Dashboard
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-[#f59e0b] border-3 border-[#1a1a2e] flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-[#1a1a2e]" />
              </div>
              <h1 className="text-2xl font-black text-[#1a1a2e] mb-4">Verification Failed</h1>
              <p className="text-[#64748b] mb-6">{message}</p>
              <p className="text-sm text-[#64748b] mb-6">
                The verification link may have expired or already been used.
              </p>
              <div className="space-y-3">
                <Link href="/profile" className="btn-neo btn-neo-primary w-full justify-center">
                  Go to Profile
                </Link>
                <Link href="/login" className="btn-neo btn-neo-secondary w-full justify-center">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-12 h-12 animate-spin text-[#4ade80]" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
