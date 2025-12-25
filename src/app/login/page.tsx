'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Shield, Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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
            Welcome Back to<br />
            <span className="text-[#4ade80]">Your Security Hub</span>
          </h1>
          
          <p className="text-gray-400 text-lg max-w-md">
            Access your dashboard to manage security issues, track assessments, 
            and stay on top of your organization&apos;s security posture.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#2a2a4e] border-2 border-[#4ade80] max-w-sm">
              <div className="w-10 h-10 bg-[#4ade80] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#1a1a2e]" />
              </div>
              <div>
                <p className="text-white font-semibold">Secure Access</p>
                <p className="text-gray-400 text-sm">Protected by industry-standard encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#64748b] hover:text-[#1a1a2e] mb-8 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#1a1a2e]" />
            </div>
            <span className="text-xl font-bold text-[#1a1a2e]">ApniSec</span>
          </div>

          <h2 className="text-3xl font-black text-[#1a1a2e] mb-2">Sign In</h2>
          <p className="text-[#64748b] mb-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#4ade80] font-semibold hover:underline">
              Sign up
            </Link>
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

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-neo pl-12 pr-12"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={isLoading}
              className="btn-neo btn-neo-primary w-full justify-center text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-[#64748b] text-sm mt-8">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-[#1a1a2e] font-medium hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#1a1a2e] font-medium hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4ade80]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
