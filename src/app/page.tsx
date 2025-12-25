'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Shield, 
  Cloud, 
  Search, 
  Users, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Target,
  Award,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [contactError, setContactError] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('loading');
    setContactError('');

    // Validate form
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactError('Please fill in all fields');
      setContactStatus('error');
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setContactStatus('success');
      setContactForm({ name: '', email: '', message: '' });
    } catch {
      setContactError('Failed to send message. Please try again or email us directly.');
      setContactStatus('error');
    }
  };

  const services = [
    {
      icon: Cloud,
      title: 'Cloud Security',
      description: 'Comprehensive cloud infrastructure security assessments and hardening for AWS, Azure, and GCP environments.',
      features: ['Configuration Review', 'IAM Security', 'Data Protection', 'Compliance Audit'],
    },
    {
      icon: Search,
      title: 'VAPT',
      description: 'Vulnerability Assessment and Penetration Testing to identify and exploit security weaknesses before attackers do.',
      features: ['Network Testing', 'Application Security', 'API Assessment', 'Exploit Verification'],
    },
    {
      icon: Users,
      title: 'Reteam Assessment',
      description: 'Red team exercises that simulate real-world attacks to test your organization\'s detection and response capabilities.',
      features: ['Social Engineering', 'Physical Security', 'Threat Simulation', 'Incident Response'],
    },
  ];

  const stats = [
    { label: 'Independent Security Assessments' },
    { label: 'Methodology-Driven Engagements' },
    { label: 'Clear, Actionable Reporting' },
    { label: 'Long-Term Security Partnership' },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Rapid Response',
      description: 'Swift incident response and threat mitigation within hours, not days.',
    },
    {
      icon: Target,
      title: 'Precision Testing',
      description: 'Targeted security assessments tailored to your specific industry and needs.',
    },
    {
      icon: Lock,
      title: 'Zero Trust Architecture',
      description: 'Implementation of modern security frameworks for maximum protection.',
    },
    {
      icon: Award,
      title: 'Certified Experts',
      description: 'Team of OSCP, CEH, and CISSP certified security professionals.',
    },
  ];

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} onLogout={logout} />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex items-center bg-[#fafafa] relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-72 h-72 bg-[#4ade80] rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#1a1a2e] rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white px-4 py-2 mb-6 border-3 border-[#1a1a2e]">
                  <Shield className="w-4 h-4 text-[#4ade80]" />
                  <span className="text-sm font-bold uppercase tracking-wide">Enterprise Security</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1a1a2e] leading-tight mb-6">
                  Secure Your
                  <span className="block text-[#4ade80]">Digital Assets</span>
                  With Confidence
                </h1>
                
                <p className="text-lg text-[#64748b] mb-8 max-w-lg">
                  ApniSec provides comprehensive cybersecurity solutions including Cloud Security, 
                  VAPT, and Reteam Assessment to protect your organization from evolving cyber threats.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register" className="btn-neo btn-neo-primary text-lg py-4 px-8">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link href="#services" className="btn-neo btn-neo-secondary text-lg py-4 px-8">
                    Our Services
                  </Link>
                </div>
              </div>
              
              <div className="relative hidden lg:block">
                <div className="card-neo p-8 bg-white">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-[#f1f5f9] border-2 border-[#1a1a2e]">
                      <div className="w-10 h-10 bg-[#22c55e] border-2 border-[#1a1a2e] flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1a1a2e]">Threat Detected & Blocked</p>
                        <p className="text-sm text-[#64748b]">SQL Injection attempt prevented</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#f1f5f9] border-2 border-[#1a1a2e]">
                      <div className="w-10 h-10 bg-[#4ade80] border-2 border-[#1a1a2e] flex items-center justify-center">
                        <Shield className="w-6 h-6 text-[#1a1a2e]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1a1a2e]">Security Score: 98/100</p>
                        <p className="text-sm text-[#64748b]">Your systems are well protected</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#f1f5f9] border-2 border-[#1a1a2e]">
                      <div className="w-10 h-10 bg-[#3b82f6] border-2 border-[#1a1a2e] flex items-center justify-center">
                        <Cloud className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1a1a2e]">Cloud Audit Complete</p>
                        <p className="text-sm text-[#64748b]">AWS infrastructure reviewed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-[#1a1a2e] py-12 border-y-4 border-[#4ade80]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#4ade80] flex-shrink-0" />
                    <p className="text-sm sm:text-base text-white font-semibold">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-[#1a1a2e] mb-4">
                Our Security Services
              </h2>
              <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
                Comprehensive cybersecurity solutions tailored to protect your organization 
                from modern threats and vulnerabilities.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="card-neo p-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_#1a1a2e] transition-all">
                  <div className="w-14 h-14 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center mb-6">
                    <service.icon className="w-7 h-7 text-[#1a1a2e]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-3">{service.title}</h3>
                  <p className="text-[#64748b] mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2 text-sm text-[#1a1a2e]">
                        <ChevronRight className="w-4 h-4 text-[#4ade80]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="about" className="py-20 bg-[#fafafa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#1a1a2e] mb-6">
                  Why Choose ApniSec?
                </h2>
                <p className="text-lg text-[#64748b] mb-8">
                  We combine cutting-edge technology with deep security expertise to deliver 
                  solutions that truly protect your business. Our approach is proactive, 
                  comprehensive, and tailored to your specific needs.
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 bg-white border-3 border-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-[#4ade80]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a1a2e] mb-1">{feature.title}</h4>
                        <p className="text-sm text-[#64748b]">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card-neo p-8 bg-white">
                <h3 className="text-2xl font-bold text-[#1a1a2e] mb-6">Ready to Get Started?</h3>
                <p className="text-[#64748b] mb-6">
                  Create an account to manage your security issues, track assessments, 
                  and get real-time insights into your security posture.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#4ade80] border-2 border-[#1a1a2e] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#1a1a2e]" />
                    </div>
                    <span className="text-[#1a1a2e]">Create and track security issues</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#4ade80] border-2 border-[#1a1a2e] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#1a1a2e]" />
                    </div>
                    <span className="text-[#1a1a2e]">Monitor assessment progress</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#4ade80] border-2 border-[#1a1a2e] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#1a1a2e]" />
                    </div>
                    <span className="text-[#1a1a2e]">Get email notifications</span>
                  </li>
                </ul>
                <Link href="/register" className="btn-neo btn-neo-primary w-full justify-center">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-[#1a1a2e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Get In Touch
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Have questions about our security services? Our team is ready to help 
                you protect your organization.
              </p>
            </div>
            
            <div className="max-w-xl mx-auto">
              <div className="bg-white border-4 border-[#4ade80] p-8">
                {contactStatus === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#1a1a2e]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">Message Sent!</h3>
                    <p className="text-[#64748b] mb-6">
                      Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setContactStatus('idle')}
                      className="btn-neo btn-neo-secondary py-2 px-6"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  {contactStatus === 'error' && (
                    <div className="bg-red-50 border-3 border-red-500 p-4">
                      <p className="text-red-600 font-medium">{contactError}</p>
                    </div>
                  )}
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input-neo"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input-neo"
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="input-neo resize-none"
                      placeholder="Tell us about your security needs..."
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={contactStatus === 'loading'}
                    className="btn-neo btn-neo-primary w-full justify-center disabled:opacity-50"
                  >
                    {contactStatus === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
