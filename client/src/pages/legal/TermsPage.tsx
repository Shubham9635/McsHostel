import React, { useState } from 'react';
import LegalHeader from './LegalHeader';
import LegalFooter from './LegalFooter';
import {
  FileText,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  PhoneCall,
  Scale,
} from 'lucide-react';

interface TermSection {
  id: string;
  num: number;
  title: string;
  content: React.ReactNode;
}

export default function TermsPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const SECTIONS: TermSection[] = [
    {
      id: 'term-accept',
      num: 1,
      title: 'Acceptance of Terms',
      content: (
        <p>
          By creating an account, accessing, or using the HostelHub platform (accessible via web and mobile interfaces), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must discontinue using HostelHub.
        </p>
      ),
    },
    {
      id: 'term-eligibility',
      num: 2,
      title: 'Eligibility',
      content: (
        <p>
          HostelHub is exclusively available to verified students, residents, residential staff, wardens, and authorized institutional administrators of participating hostel institutions. You must provide accurate and verifiable student identification and contact details.
        </p>
      ),
    },
    {
      id: 'term-account',
      num: 3,
      title: 'Account Responsibilities',
      content: (
        <p>
          You are responsible for maintaining the confidentiality of your login credentials, password, and session access. You must promptly notify hostel authorities of any unauthorized account access. Sharing student credentials with external non-residents is strictly prohibited.
        </p>
      ),
    },
    {
      id: 'term-use',
      num: 4,
      title: 'Acceptable Use',
      content: (
        <p>
          You agree to use HostelHub in compliance with all collegiate hostel rules, national laws, and regulations. You shall not attempt to breach security, tamper with database endpoints, spam maintenance queues, or impersonate other students or staff members.
        </p>
      ),
    },
    {
      id: 'term-complaints',
      num: 5,
      title: 'Maintenance Complaints',
      content: (
        <p>
          Complaints submitted regarding electrical, plumbing, carpentry, or cleanliness issues must be truthful and describe genuine problems in your assigned hostel premises. Facilities management prioritizes tickets based on urgency, safety impact, and staff availability.
        </p>
      ),
    },
    {
      id: 'term-mess',
      num: 6,
      title: 'Mess Feedback',
      content: (
        <p>
          Ratings and reviews for mess meals must reflect authentic personal experiences. Constructive feedback aids hostel mess committees in maintaining catering standards. Defamatory or abusive language towards mess workers will result in review rejection.
        </p>
      ),
    },
    {
      id: 'term-safety',
      num: 7,
      title: 'Safety & Anti-Ragging Reports',
      content: (
        <div>
          <p>
            HostelHub provides dedicated reporting for harassment, bullying, safety hazards, and anti-ragging violations in alignment with UGC and institutional anti-ragging mandates. Reports are routed directly to authorized residential wardens and safety officers.
          </p>
          <div className="p-3.5 rounded-xl border mt-3 text-xs bg-amber-500/10 border-amber-500/25 text-amber-900 dark:text-amber-200">
            <strong>Critical Emergency Notice:</strong> HostelHub is a digital communication and ticket-routing platform. It does NOT replace emergency services (police, ambulance, fire) or immediate physical campus security intervention. In situations involving immediate danger, physical violence, or medical emergencies, you must contact campus security, local emergency services, or hostel wardens directly without delay.
          </div>
        </div>
      ),
    },
    {
      id: 'term-malicious',
      num: 8,
      title: 'False or Malicious Reports',
      content: (
        <p>
          Submitting fabricated, deceitful, or malicious complaints or safety reports intended to harass fellow students or staff is a severe violation of campus discipline. Institutional authorities reserve the right to initiate disciplinary proceedings against malicious reporters.
        </p>
      ),
    },
    {
      id: 'term-ugc',
      num: 9,
      title: 'User-Generated Content',
      content: (
        <p>
          Users retain ownership of the factual descriptions and comments they submit. By submitting content through HostelHub, you grant the institution a non-exclusive license to use the information solely to resolve tickets, maintain audit records, and ensure campus safety.
        </p>
      ),
    },
    {
      id: 'term-media',
      num: 10,
      title: 'Uploaded Photos & Videos',
      content: (
        <p>
          Photos or videos uploaded as complaint evidence must be relevant to the reported facility issue. Uploading obscene, non-consensual, infringing, or inappropriate media is strictly prohibited and subject to immediate account termination.
        </p>
      ),
    },
    {
      id: 'term-notifs',
      num: 11,
      title: 'Notifications',
      content: (
        <p>
          By using HostelHub, you consent to receive administrative notices, maintenance status updates, and emergency alerts. While non-essential alerts can be muted in Settings, critical campus safety announcements may be dispatched when deemed necessary by administration.
        </p>
      ),
    },
    {
      id: 'term-termination',
      num: 12,
      title: 'Account Suspension & Termination',
      content: (
        <p>
          Hostel management reserves the right to suspend or terminate account access for users who graduate, leave the hostel residence, or violate acceptable use guidelines, without prior notice where necessary to protect campus safety.
        </p>
      ),
    },
    {
      id: 'term-availability',
      num: 13,
      title: 'Service Availability',
      content: (
        <p>
          We endeavor to keep HostelHub available 24/7. However, temporary downtime may occur for scheduled maintenance, database upgrades, or network interruptions. We do not guarantee uninterrupted platform availability.
        </p>
      ),
    },
    {
      id: 'term-liability',
      num: 14,
      title: 'Limitation of Liability',
      content: (
        <p>
          To the fullest extent permitted by applicable law, HostelHub and its development team shall not be liable for indirect, incidental, or consequential damages resulting from ticket handling delays, physical facility failures, or third-party service interruptions.
        </p>
      ),
    },
    {
      id: 'term-changes',
      num: 15,
      title: 'Changes to Terms',
      content: (
        <p>
          We may update these terms periodically to comply with new institutional policies or statutory regulations. Continued use of HostelHub following notice of changes constitutes your acceptance of the updated terms.
        </p>
      ),
    },
    {
      id: 'term-contact',
      num: 16,
      title: 'Contact Information',
      content: (
        <div>
          <p>For questions or inquiries regarding these Terms and Conditions, please contact:</p>
          <div className="mt-2 text-xs">
            <p><strong>Support Email:</strong> <a href="mailto:hostelhub.support@gmail.com" className="text-indigo-500 hover:underline">hostelhub.support@gmail.com</a></p>
            <p><strong>WhatsApp Support:</strong> <a href="https://wa.me/919118111575" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">+91 9118111575</a></p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <LegalHeader title="Terms & Conditions" badge="Terms of Service" />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Document Header */}
        <div className="border-b pb-6 mb-8" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
            <Scale className="w-4 h-4" />
            <span>Platform Agreement &amp; Acceptable Use</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
            Terms &amp; Conditions
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)] mt-2">
            <span>Effective Date: September 12, 2026</span>
            <span>&middot;</span>
            <span>Version: 2.4.0</span>
            <span>&middot;</span>
            <span>Governing Scope: Student Residences &amp; Campus Hostels</span>
          </div>
        </div>

        {/* Emergency Alert Disclaimer Banner */}
        <div
          className="rounded-2xl p-4 sm:p-5 border mb-8 flex items-start gap-3.5"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            borderColor: 'rgba(239, 68, 68, 0.25)',
          }}
        >
          <div className="p-2 rounded-xl bg-red-500/15 text-red-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm">
            <h2 className="font-bold text-red-500 text-sm sm:text-base leading-tight">
              Emergency &amp; Immediate Assistance Notice
            </h2>
            <p className="text-[var(--text-secondary)] mt-1 leading-relaxed">
              HostelHub is a communication and administrative reporting tool. It does <strong>not</strong> replace emergency services. In situations involving immediate physical danger, medical emergencies, or urgent security threats, contact hostel wardens, campus security, or local emergency personnel immediately.
            </p>
          </div>
        </div>

        {/* 16 Sections */}
        <div className="space-y-4">
          {SECTIONS.map((sec) => {
            const isOpen = openSection === sec.id;
            return (
              <div
                key={sec.id}
                id={sec.id}
                className="rounded-2xl border transition-all overflow-hidden"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(sec.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/[0.02]"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-black text-xs"
                      style={{
                        background: 'rgba(99, 102, 241, 0.12)',
                        color: '#6366f1',
                      }}
                    >
                      {sec.num}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[var(--text-heading)] truncate">
                      {sec.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-indigo-500' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {sec.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
