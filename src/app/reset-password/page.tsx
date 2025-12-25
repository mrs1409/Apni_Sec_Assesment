'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setStatus('error');
      setMessage('Invalid reset link');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  if (!token && status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="max-w-md w-full bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-black mb-4">Invalid Link</h1>
            <p className="text-gray-700 mb-6">{message}</p>
            <Link
              href="/forgot-password"
              className="inline-block px-6 py-3 bg-black text-white font-bold border-4 border-black hover:bg-white hover:text-black transition-colors"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-black mb-2">Reset Password</h1>
        <p className="text-gray-700 mb-6">Enter your new password</p>

        {status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black mb-4">Password Reset!</h2>
            <p className="text-gray-700 mb-4">{message}</p>
            <p className="text-sm text-gray-600">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'error' && (
              <div className="bg-red-100 border-4 border-red-500 p-4">
                <p className="text-red-800 font-bold">{message}</p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block font-bold mb-2">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-yellow-400"
                placeholder="••••••••"
                disabled={status === 'loading'}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-bold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-yellow-400"
                placeholder="••••••••"
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-6 py-3 bg-yellow-400 text-black font-black border-4 border-black hover:bg-yellow-300 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-blue-600 hover:underline font-bold">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
