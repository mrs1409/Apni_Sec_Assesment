'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, LogIn } from 'lucide-react';

interface NavbarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export default function Navbar({ isAuthenticated = false, onLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/#services', label: 'Services' },
    { href: '/#about', label: 'About' },
    { href: '/#contact', label: 'Contact' },
  ];

  const authLinks = isAuthenticated
    ? [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/profile', label: 'Profile' },
      ]
    : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-3 border-[#1a1a2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center group-hover:shadow-[2px_2px_0_#1a1a2e] transition-shadow">
              <Shield className="w-6 h-6 text-[#1a1a2e]" />
            </div>
            <span className="text-xl font-bold text-[#1a1a2e] tracking-tight">ApniSec</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#1a1a2e] font-semibold hover:text-[#4ade80] transition-colors uppercase text-sm tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[#1a1a2e] font-semibold hover:text-[#4ade80] transition-colors uppercase text-sm tracking-wide ${
                  pathname === link.href ? 'text-[#4ade80]' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="btn-neo btn-neo-secondary text-sm py-2 px-4"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-neo btn-neo-primary text-sm py-2 px-4 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-neo btn-neo-dark text-sm py-2 px-4"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 border-2 border-[#1a1a2e]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-[#1a1a2e]" />
            ) : (
              <Menu className="w-6 h-6 text-[#1a1a2e]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-3 border-[#1a1a2e] bg-white">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-[#1a1a2e] font-semibold py-2 uppercase text-sm tracking-wide"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-[#1a1a2e] font-semibold py-2 uppercase text-sm tracking-wide"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t-2 border-[#e2e8f0] space-y-3">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    onLogout?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn-neo btn-neo-secondary w-full text-sm py-2"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="btn-neo btn-neo-primary w-full text-sm py-2 flex items-center justify-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="btn-neo btn-neo-dark w-full text-sm py-2 text-center block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
