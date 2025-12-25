'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-black mb-2">Forgot Password</h1>
        <p className="text-gray-700 mb-6">Enter your email to receive a password reset link</p>

        {status === 'success' ? (
          <div className="bg-green-100 border-4 border-green-500 p-4 mb-6">
            <p className="text-green-800 font-bold">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'error' && (
              <div className="bg-red-100 border-4 border-red-500 p-4">
                <p className="text-red-800 font-bold">{message}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-4 focus:ring-yellow-400"
                placeholder="your@email.com"
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-6 py-3 bg-yellow-400 text-black font-black border-4 border-black hover:bg-yellow-300 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
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
