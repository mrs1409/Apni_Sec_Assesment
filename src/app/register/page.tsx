'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Shield, Mail, Lock, User, Building2, Phone, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (formData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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
            Start Your<br />
            <span className="text-[#4ade80]">Security Journey</span>
          </h1>
          
          <p className="text-gray-400 text-lg max-w-md">
            Create an account to access our comprehensive security management platform. 
            Track issues, manage assessments, and protect your organization.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#2a2a4e] border-2 border-[#4ade80] max-w-sm">
              <div className="w-10 h-10 bg-[#4ade80] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#1a1a2e]" />
              </div>
              <div>
                <p className="text-white font-semibold">Free to Start</p>
                <p className="text-gray-400 text-sm">No credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
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

          <h2 className="text-3xl font-black text-[#1a1a2e] mb-2">Create Account</h2>
          <p className="text-[#64748b] mb-8">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4ade80] font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="bg-red-50 border-3 border-red-500 p-4 mb-6">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`input-neo pl-12 ${fieldErrors.firstName ? 'border-red-500' : ''}`}
                    placeholder="John"
                    required
                    autoComplete="given-name"
                  />
                </div>
                {fieldErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`input-neo pl-12 ${fieldErrors.lastName ? 'border-red-500' : ''}`}
                    placeholder="Doe"
                    required
                    autoComplete="family-name"
                  />
                </div>
                {fieldErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-neo pl-12 ${fieldErrors.email ? 'border-red-500' : ''}`}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
              )}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-neo pl-12 pr-12 ${fieldErrors.password ? 'border-red-500' : ''}`}
                  placeholder="Min. 8 characters"
                  required
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
              {fieldErrors.password && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-neo pl-12 pr-12 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                  required
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
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                  Phone <span className="text-[#64748b] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-neo pl-12"
                    placeholder="+91 98765..."
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                  Company <span className="text-[#64748b] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="input-neo pl-12"
                    placeholder="Your company"
                    autoComplete="organization"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-neo btn-neo-primary w-full justify-center text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-[#64748b] text-sm mt-8">
            By creating an account, you agree to our{' '}
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
