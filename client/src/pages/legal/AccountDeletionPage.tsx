import React, { useState } from 'react';
import LegalHeader from './LegalHeader';
import LegalFooter from './LegalFooter';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Trash2,
  AlertTriangle,
  Mail,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  FileText,
  UserCheck,
  Lock,
} from 'lucide-react';

export default function AccountDeletionPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const sampleTemplate = `Subject: HostelHub Account & Data Deletion Request

Dear HostelHub Data Privacy Team,

I am writing to formally request the complete deletion of my HostelHub user account and associated personal profile information.

Account Details for Verification:
- Full Name: ${user?.name || '[Your Full Name]'}
- Registered Email: ${user?.email || '[Your Registered Email]'}
- Student / Staff ID: ${user?.student_id || '[Your Student/Staff ID]'}
- Hostel & Room: ${user?.hostel ? `${user.hostel} - Room ${user.room || 'N/A'}` : '[Your Hostel & Room Number]'}
- Reason for Deletion: [Graduation / Relocated / Hostel Checkout / Other]

I understand that while my personal profile will be deleted, certain anonymized facility records and safety compliance audits may be retained in accordance with university institutional regulations.

Thank you,
${user?.name || '[Your Name]'}`;

  const mailtoUrl = `mailto:hostelhub.support@gmail.com?subject=${encodeURIComponent(
    'HostelHub Account & Data Deletion Request'
  )}&body=${encodeURIComponent(sampleTemplate)}`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleTemplate);
    setCopied(true);
    toast.success('Deletion request template copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <LegalHeader title="Account Deletion" badge="User Rights" />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Document Header */}
        <div className="border-b pb-6 mb-8" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">
            <Trash2 className="w-4 h-4" />
            <span>Data Privacy &amp; User Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
            Account &amp; Data Deletion Policy
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            HostelHub respects your right to control your personal data. Below is our transparent deletion process, details on what data is purged, and how to submit a verified deletion request.
          </p>
        </div>

        {/* What gets deleted vs retained grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Deleted Data */}
          <div
            className="rounded-2xl p-5 border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'rgba(239, 68, 68, 0.25)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm mb-3">
              <Trash2 className="w-4 h-4" />
              <span>What Gets Permanently Deleted</span>
            </div>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>User Profile &amp; Authentication:</strong> Name, personal email, phone number, password hash, and active session tokens.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>Device &amp; App Preferences:</strong> Notification settings, audio chime selections, and appearance preferences.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>Live Notification Feed:</strong> In-app unread alerts and student message streams.</span>
              </li>
            </ul>
          </div>

          {/* Retained Data */}
          <div
            className="rounded-2xl p-5 border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'rgba(99, 102, 241, 0.25)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm mb-3">
              <ShieldAlert className="w-4 h-4" />
              <span>What May Be Legally Retained for Audits</span>
            </div>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span><strong>Facility Maintenance Logs:</strong> Completed work orders, technician logs, and repair archives are preserved for hostel accounting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span><strong>Safety &amp; Anti-Ragging Records:</strong> Incident reports involving safety threats are archived pursuant to statutory university guidelines.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span><strong>Financial Records:</strong> Transaction audits and meal billing records retained for institutional compliance.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Official Request Process */}
        <div
          className="rounded-3xl p-6 sm:p-8 border mb-8"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-[var(--text-heading)] mb-2">
            <UserCheck className="w-5 h-5 text-indigo-500" />
            <span>How to Submit a Deletion Request</span>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
            To prevent accidental data loss, malicious tampering, or premature deletion while actively residing in campus hostels, deletion requests are verified by our support administrators. Send your request from your registered email address using the pre-filled template below:
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <a
              href={mailtoUrl}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md shadow-indigo-500/25 active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>Compose Deletion Email</span>
            </a>

            <button
              type="button"
              onClick={handleCopyTemplate}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors flex items-center gap-2 active:scale-95"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Template Copied' : 'Copy Request Template'}</span>
            </button>
          </div>

          {/* Template Box */}
          <div className="relative">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
              Verified Deletion Request Format
            </label>
            <pre
              className="p-4 rounded-xl border text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed select-all"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {sampleTemplate}
            </pre>
          </div>
        </div>

        {/* Processing Timeline Notice */}
        <div
          className="rounded-2xl p-4 sm:p-5 border flex items-start gap-3 text-xs sm:text-sm"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          <Clock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[var(--text-heading)]">
              Turnaround Time: Within 30 Business Days
            </p>
            <p className="text-[var(--text-secondary)] mt-0.5 leading-relaxed text-xs">
              Upon receiving your email from your registered hostel address, our data protection officer will verify your residency status with the hostel warden and complete the data purge within 30 days. You will receive a final confirmation email when the account is deactivated.
            </p>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
