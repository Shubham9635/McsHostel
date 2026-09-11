import React from 'react';
import LegalHeader from './LegalHeader';
import LegalFooter from './LegalFooter';
import {
  Wrench,
  Activity,
  LayoutDashboard,
  UtensilsCrossed,
  BellRing,
  ShieldAlert,
  EyeOff,
  MessagesSquare,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Mail,
  Smartphone,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Wrench,
    title: 'Maintenance Complaint Reporting',
    desc: 'Students can report electrical, plumbing, carpentry, and cleanliness issues in seconds with room-level tracking.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Activity,
    title: 'End-to-End Complaint Tracking',
    desc: 'Transparent progress milestones from submission, staff assignment, work in progress to verified resolution.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: LayoutDashboard,
    title: 'Hostel Management Dashboard',
    desc: 'Unified administration command center with real-time room occupancy metrics, workload routing, and analytics.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: UtensilsCrossed,
    title: 'Mess Schedule & Food Feedback',
    desc: 'Live daily meal menus with nutritional ratings and authentic student meal reviews for mess quality accountability.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: BellRing,
    title: 'Real-Time Notification System',
    desc: 'Server-Sent Events (SSE) and live database stream dispatching instant audio chimes and status banners across devices.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: ShieldAlert,
    title: 'Safety & Anti-Ragging Reporting',
    desc: 'Dedicated high-priority channel for campus safety incidents, harassment alerts, and immediate hostel escalation.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
  {
    icon: EyeOff,
    title: 'Identity-Protected Safety Reports',
    desc: 'Reporters’ personal names and student identifiers are strictly shielded from hostel staff UI views to prevent retaliation.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: MessagesSquare,
    title: 'Student & Management Communication',
    desc: 'Closes the feedback loop with official administration announcements, repair notes, and direct developer communication channels.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <LegalHeader title="About HostelHub" badge="Platform Overview" />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <div
          className="relative rounded-3xl p-6 sm:p-10 text-center overflow-hidden border shadow-xl mb-10"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(45, 36, 117, 0.9) 50%, rgba(15, 12, 38, 0.98) 100%)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
          }}
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/40 flex items-center justify-center p-3 shadow-lg shadow-indigo-500/30">
              <img src="/logo.png" alt="HostelHub Logo" className="w-full h-full object-contain" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Official Platform Overview
            </span>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Hostel<span style={{ color: '#f97316' }}>Hub</span>
            </h1>

            <p className="text-base sm:text-lg font-bold text-indigo-200 mt-1">
              &ldquo;Connect. Report. Improve.&rdquo;
            </p>

            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
              HostelHub is a modern digital hostel management platform designed to make hostel life more organized, transparent, and connected. By bridging students and hostel administration in real time, HostelHub eliminates paperwork delays, provides accountable maintenance resolution, and fosters a secure campus environment.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs font-semibold text-white">
              <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/15">
                Version 2.4.0 (Production)
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Cloud Architecture
              </span>
            </div>
          </div>
        </div>

        {/* ── Core Platform Capabilities ─────────────────────────────────── */}
        <div className="mb-12">
          <div className="text-center sm:text-left mb-6">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
              Core Platform Capabilities
            </h2>
            <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Engineered with modern web and mobile standards to transform student residential operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-md"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.bg}`}>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold leading-tight" style={{ color: 'var(--text-heading)' }}>
                        {item.title}
                      </h3>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Development & Technical Specifications ─────────────────────── */}
        <div
          className="rounded-3xl p-6 sm:p-8 border mb-10"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>
            System Architecture &amp; Technology Stack
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <p className="font-bold text-[var(--text-heading)]">Client Frontend</p>
              <p className="text-[var(--text-secondary)] mt-1">React 18 &middot; Vite &middot; TailwindCSS tokens &middot; Lucide Icons &middot; Mobile PWA / Web</p>
            </div>
            <div className="p-3.5 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <p className="font-bold text-[var(--text-heading)]">Backend &amp; API</p>
              <p className="text-[var(--text-secondary)] mt-1">Node.js Express &middot; TypeScript &middot; JWT &middot; Server-Sent Events (SSE)</p>
            </div>
            <div className="p-3.5 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
              <p className="font-bold text-[var(--text-heading)]">Database &amp; Storage</p>
              <p className="text-[var(--text-secondary)] mt-1">Supabase PostgreSQL &middot; Supabase Storage &middot; Realtime WebSocket channels</p>
            </div>
          </div>
        </div>

        {/* ── Official Developer & Support Contacts ───────────────────────── */}
        <div
          className="rounded-3xl p-6 sm:p-8 border"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                Developer Team &amp; Official Support
              </h2>
              <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                For official assistance, campus integrations, or technical reports, reach our team directly:
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href="https://wa.me/91911811575"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>+91 91181 11575</span>
              </a>
              <a
                href="mailto:hostelhub.support@gmail.com"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>hostelhub.support@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
