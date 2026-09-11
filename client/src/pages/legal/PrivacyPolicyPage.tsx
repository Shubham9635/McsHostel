import React, { useState } from 'react';
import LegalHeader from './LegalHeader';
import LegalFooter from './LegalFooter';
import {
  Shield,
  Lock,
  Database,
  EyeOff,
  Bell,
  Trash2,
  HelpCircle,
  FileCheck,
  ChevronDown,
  Mail,
  ExternalLink,
} from 'lucide-react';

interface PolicySection {
  id: string;
  num: number;
  title: string;
  content: React.ReactNode;
}

export default function PrivacyPolicyPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const SECTIONS: PolicySection[] = [
    {
      id: 'sec-intro',
      num: 1,
      title: 'Introduction',
      content: (
        <p>
          HostelHub (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) provides an integrated digital hostel residence management platform. This Privacy Policy governs our privacy practices and explains how personal information, residential details, maintenance requests, meal feedback, and incident reports are collected, stored, processed, and safeguarded when using our web portal, mobile app interface, and associated backend API services.
        </p>
      ),
    },
    {
      id: 'sec-collect',
      num: 2,
      title: 'Information We Collect',
      content: (
        <p>
          We collect only the information necessary to provide reliable hostel residential services, coordinate facility repairs, facilitate campus safety reporting, and manage meal administration. Data is collected directly when you register, log in, submit complaints, submit feedback, or interact with notifications.
        </p>
      ),
    },
    {
      id: 'sec-account',
      num: 3,
      title: 'Account Information',
      content: (
        <p>
          When you register or sign in to HostelHub, we collect your full name, educational or institutional email address, hashed password (using industry-standard bcrypt salt and hash algorithm), contact phone number, and account role (student, staff, or administrator). We do not store raw plaintext passwords.
        </p>
      ),
    },
    {
      id: 'sec-hostel',
      num: 4,
      title: 'Hostel & Student Information',
      content: (
        <p>
          To route maintenance requests and administrative notices accurately, our database stores residential placement parameters including your assigned hostel name, block, room number, institutional student ID number, academic course/branch, and year of study.
        </p>
      ),
    },
    {
      id: 'sec-complaints',
      num: 5,
      title: 'Complaint Information',
      content: (
        <p>
          When students submit a maintenance ticket, we record the category (e.g., electrical, plumbing, carpentry, cleaning), issue title, detailed description, physical location/room, timestamp, priority level, status history transitions, technician notes, and feedback ratings.
        </p>
      ),
    },
    {
      id: 'sec-media',
      num: 6,
      title: 'Photos and Media',
      content: (
        <p>
          When users attach photo or video evidence to maintenance tickets or safety reports, media files are stored on secure cloud object storage (Supabase Storage) and accessed through authenticated URLs. Uploaded media is used exclusively to assist maintenance personnel and administrators in identifying and resolving reported issues.
        </p>
      ),
    },
    {
      id: 'sec-mess',
      num: 7,
      title: 'Mess Feedback',
      content: (
        <p>
          Mess ratings, star evaluations, and meal review comments (for breakfast, lunch, or dinner) are collected to monitor caterer compliance and dietary quality. Students have the option to submit mess reviews anonymously to the mess council.
        </p>
      ),
    },
    {
      id: 'sec-safety',
      num: 8,
      title: 'Safety & Anti-Ragging Reports',
      content: (
        <p>
          Safety reports contain incident category, description, physical location, date/time of occurrence, immediate danger indicator, and optional photo/audio evidence. These reports receive immediate escalation to authorized hostel wardens and anti-ragging committee personnel.
        </p>
      ),
    },
    {
      id: 'sec-anon',
      num: 9,
      title: 'Anonymous / Identity-Protected Reporting',
      content: (
        <div>
          <p>
            HostelHub provides <strong>Identity-Protected Reporting</strong> for safety and anti-ragging submissions. In the application interface, normal hostel administrators and staff view the reporter&apos;s name and identity as protected (&ldquo;Anonymous Student&rdquo;).
          </p>
          <div className="p-3 rounded-xl border mt-2.5 text-xs" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <strong>Technical Transparency Note:</strong> To ensure platform integrity, prevent malicious false reporting, and support legal inquiries where legally mandated by campus authorities or law enforcement, the internal user account ID is maintained in secure audit tables on the server database. It is strictly never displayed in operational staff interfaces.
          </div>
        </div>
      ),
    },
    {
      id: 'sec-notif',
      num: 10,
      title: 'Notifications',
      content: (
        <p>
          HostelHub uses real-time communication technologies, including Server-Sent Events (SSE) and Supabase Realtime WebSocket channels, to dispatch live status notifications regarding ticket updates, emergency notices, and mess menus. Notification preferences and audio alert toggles can be customized at any time in Settings.
        </p>
      ),
    },
    {
      id: 'sec-use',
      num: 11,
      title: 'How We Use Information',
      content: (
        <ul className="list-disc pl-5 space-y-1 mt-1 text-xs sm:text-sm">
          <li>To authenticate user sessions and maintain role-based access control.</li>
          <li>To assign maintenance technicians to specific hostel rooms and track resolution.</li>
          <li>To alert authorities to campus safety emergencies and anti-ragging violations.</li>
          <li>To compile aggregated hostel analytics (average repair times, meal satisfaction).</li>
          <li>To deliver real-time push and in-app notifications.</li>
        </ul>
      ),
    },
    {
      id: 'sec-share',
      num: 12,
      title: 'How We Share Information',
      content: (
        <p>
          We do not sell, rent, or monetize your personal data. Data is shared internally strictly with authorized hostel administrators, wardens, and maintenance personnel tasked with resolving your specific requests. Third-party infrastructure providers (Supabase, cloud hosting) process data strictly as data processors under confidentiality agreements.
        </p>
      ),
    },
    {
      id: 'sec-security',
      num: 13,
      title: 'Data Storage & Security',
      content: (
        <p>
          All data in transit is encrypted using HTTPS / Transport Layer Security (TLS 1.2+). Data is stored in secure managed PostgreSQL databases provided by Supabase with Row Level Security (RLS) policies, parameterised queries, secure JWT session management, and server-side secret isolation.
        </p>
      ),
    },
    {
      id: 'sec-retention',
      num: 14,
      title: 'Data Retention',
      content: (
        <p>
          Account and residential profile information is retained for the duration of the student&apos;s active campus residency. Maintenance history, audit logs, and safety reports may be archived for institutional compliance, facility auditing, and statutory safety recordkeeping requirements.
        </p>
      ),
    },
    {
      id: 'sec-rights',
      num: 15,
      title: 'User Rights',
      content: (
        <p>
          Users have the right to inspect their personal profile information, request corrections to inaccurate room/phone data via the profile editor, review their submitted complaints, and request account deactivation or deletion as described below.
        </p>
      ),
    },
    {
      id: 'sec-deletion',
      num: 16,
      title: 'Account & Data Deletion',
      content: (
        <div>
          <p>
            Users wishing to delete their account and associated profile records can submit a verified request through our official data privacy portal at{' '}
            <a href="/account-deletion" className="text-indigo-500 font-bold underline">
              /account-deletion
            </a>{' '}
            or by emailing{' '}
            <a href="mailto:hostelhub.support@gmail.com" className="text-indigo-500 font-bold underline">
              hostelhub.support@gmail.com
            </a>
            . We process verified requests within 30 days, subject to statutory hostel audit retention rules.
          </p>
        </div>
      ),
    },
    {
      id: 'sec-minors',
      num: 17,
      title: "Children's / Minor Users",
      content: (
        <p>
          HostelHub is designed for university and college student residents aged 16 and above enrolled in collegiate hostel institutions. We do not knowingly collect personal data from children under the age of 13.
        </p>
      ),
    },
    {
      id: 'sec-changes',
      num: 18,
      title: 'Changes to Privacy Policy',
      content: (
        <p>
          We may update this Privacy Policy periodically to reflect technological enhancements or administrative policy adjustments. Material updates will be announced through in-app system notifications and updated version timestamps on this page.
        </p>
      ),
    },
    {
      id: 'sec-contact',
      num: 19,
      title: 'Contact Information',
      content: (
        <div>
          <p>If you have any questions or privacy concerns regarding this policy, please reach out directly:</p>
          <div className="mt-2 text-xs">
            <p><strong>Support Email:</strong> <a href="mailto:hostelhub.support@gmail.com" className="text-indigo-500 hover:underline">hostelhub.support@gmail.com</a></p>
            <p><strong>WhatsApp Support:</strong> <a href="https://wa.me/91911811575" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">+91 91181 11575</a></p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <LegalHeader title="Privacy Policy" badge="Legal & Compliance" />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Document Header */}
        <div className="border-b pb-6 mb-8" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4" />
            <span>HostelHub Public Privacy Disclosure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
            Privacy Policy
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)] mt-2">
            <span>Effective Date: September 12, 2026</span>
            <span>&middot;</span>
            <span>Version: 2.4.0</span>
            <span>&middot;</span>
            <span>Status: Active &amp; Google Play Ready</span>
          </div>
        </div>

        {/* Quick Summary Box */}
        <div
          className="rounded-2xl p-4 sm:p-5 border mb-8"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-500 mb-2">
            <Lock className="w-4 h-4" />
            <span>Privacy Highlights at a Glance</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            HostelHub protects student privacy. We only collect details essential for hostel room allocation, maintenance management, and emergency response. Safety reports feature identity protection to shield reporters from retaliation, and we never sell user data.
          </p>
        </div>

        {/* 19 Numbered Sections */}
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
                    <h2 className="text-sm sm:text-base font-bold text-[var(--text-heading)] truncate">
                      {sec.title}
                    </h2>
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
