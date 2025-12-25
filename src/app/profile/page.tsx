'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Shield, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Save, 
  Loader2,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { IUserPublic, IApiResponse } from '@/types';

function ProfileContent() {
  const { user, logout, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        company: user.company || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data: IApiResponse<IUserPublic> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess(true);
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b-3 border-[#1a1a2e] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#1a1a2e]" />
              </div>
              <span className="text-xl font-bold text-[#1a1a2e]">ApniSec</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-[#1a1a2e] font-semibold hover:bg-[#f1f5f9] transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="btn-neo btn-neo-secondary text-sm py-2 px-4 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-[#64748b] hover:text-[#1a1a2e] mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="card-neo p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center">
              <User className="w-10 h-10 text-[#1a1a2e]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1a1a2e]">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-[#64748b]">{user?.email}</p>
              <span className="inline-block mt-1 px-3 py-1 bg-[#f1f5f9] border-2 border-[#1a1a2e] text-sm font-bold uppercase">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-[#f1f5f9] border-2 border-[#1a1a2e]">
              <p className="text-[#64748b] uppercase tracking-wide font-medium mb-1">Member Since</p>
              <p className="font-bold text-[#1a1a2e]">{formatDate(user?.createdAt)}</p>
            </div>
            <div className="p-4 bg-[#f1f5f9] border-2 border-[#1a1a2e]">
              <p className="text-[#64748b] uppercase tracking-wide font-medium mb-1">Account Status</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span className="font-bold text-[#1a1a2e]">Verified</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-neo p-6">
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">Update Profile</h2>

          {error && (
            <div className="bg-red-50 border-3 border-red-500 p-4 mb-6">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-3 border-green-500 p-4 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-green-600 font-medium">Profile updated successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
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
                    className="input-neo pl-12"
                    placeholder="John"
                    required
                    minLength={2}
                    autoComplete="given-name"
                  />
                </div>
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
                    className="input-neo pl-12"
                    placeholder="Doe"
                    required
                    minLength={2}
                    autoComplete="family-name"
                  />
                </div>
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
                  value={user?.email || ''}
                  className="input-neo pl-12 bg-[#f1f5f9] cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="text-sm text-[#64748b] mt-1">Email address cannot be changed</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                  Phone Number
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
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                  Company
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
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-neo btn-neo-primary w-full sm:w-auto justify-center py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
