import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Info,
  ShieldCheck,
  FileText,
  Trash2,
  MessageSquareHeart,
  ChevronRight,
  ChevronDown,
  Scale,
  ExternalLink,
  ArrowRight,
  Mail,
} from 'lucide-react';

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const WHATSAPP_URL =
  'https://wa.me/91911811575?text=' +
  encodeURIComponent('Hi HostelHub Team, I would like to share some feedback/suggestions about the app.');

const EMAIL_URL =
  'mailto:hostelhub.support@gmail.com?subject=' +
  encodeURIComponent('HostelHub Feedback & Suggestion');

const LEGAL_PAGES = [
  {
    id: 'about',
    title: 'About HostelHub',
    desc: 'Platform overview, vision & core campus features',
    path: '/about',
    icon: Info,
    color: 'text-indigo-500 dark:text-indigo-400',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/20',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    desc: 'Data collection, storage security & identity protection',
    path: '/privacy-policy',
    icon: ShieldCheck,
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20',
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    desc: 'Acceptable use, hostel guidelines & platform rules',
    path: '/terms',
    icon: FileText,
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/20',
  },
  {
    id: 'deletion',
    title: 'Account & Data Deletion',
    desc: 'Data retention, user rights & removal request process',
    path: '/account-deletion',
    icon: Trash2,
    color: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/20',
  },
];

export default function AboutLegalCard() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <section
      aria-labelledby="about-legal-heading"
      className="rounded-2xl p-3.5 sm:p-4 border transition-colors duration-200"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* ── Section Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-indigo-500"
            style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)' }}
          >
            <Scale className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3
              id="about-legal-heading"
              className="text-sm sm:text-base font-bold tracking-tight leading-tight"
              style={{ color: 'var(--text-heading)' }}
            >
              About &amp; Legal
            </h3>
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5 leading-tight">
              Policies, compliance, platform overview and user rights
            </p>
          </div>
        </div>

        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          v2.4.0
        </span>
      </div>

      {/* ── First 4 Legal Pages ───────────────────────────────────────────── */}
      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {LEGAL_PAGES.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className="py-2.5 sm:py-3 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/[0.02] active:scale-[0.99] group select-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${item.bg}`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-heading)] leading-tight group-hover:text-indigo-500 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[10.5px] sm:text-[11px] text-[var(--text-secondary)] mt-0.5 truncate leading-tight">
                    {item.desc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
            </NavLink>
          );
        })}

        {/* ── 5. Feedback & Support Accordion / Detail Section ────────────── */}
        <div className="pt-0.5">
          <button
            type="button"
            id="btn-toggle-feedback-support"
            onClick={() => setFeedbackOpen((prev) => !prev)}
            aria-expanded={feedbackOpen}
            className="w-full py-2.5 sm:py-3 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/[0.02] active:scale-[0.99] group select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/20">
                <MessageSquareHeart className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-heading)] leading-tight group-hover:text-indigo-500 transition-colors">
                    Feedback &amp; Support
                  </p>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                    Dev Team
                  </span>
                </div>
                <p className="text-[10.5px] sm:text-[11px] text-[var(--text-secondary)] mt-0.5 truncate leading-tight">
                  Official WhatsApp &amp; Email developer communication
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-transform duration-200 shrink-0 ${
                feedbackOpen ? 'rotate-180 text-indigo-500' : ''
              }`}
            />
          </button>

          {feedbackOpen && (
            <div className="pt-1.5 pb-2.5 space-y-2.5 animate-fade-in border-t border-[var(--border-subtle)] mt-1">
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-tight pt-1">
                Contact the HostelHub development team. We&apos;d love to hear from you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* WhatsApp Card */}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-whatsapp-support"
                  aria-label="Contact WhatsApp Support at +91 91181 11575"
                  className="group relative rounded-xl p-2.5 sm:p-3 border transition-all duration-200 block text-left active:scale-[0.98] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        boxShadow: '0 3px 10px rgba(37, 211, 102, 0.25)',
                      }}
                    >
                      <WhatsAppIcon className="w-4 h-4 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className="text-xs sm:text-sm font-bold truncate leading-tight group-hover:text-emerald-500 transition-colors"
                          style={{ color: 'var(--text-heading)' }}
                        >
                          WhatsApp Support
                        </h4>
                        <ExternalLink className="w-3 h-3 text-emerald-500/70 group-hover:text-emerald-500 transition-colors shrink-0" />
                      </div>

                      <p className="text-[10.5px] sm:text-[11px] mt-0.5 leading-tight text-[var(--text-secondary)] truncate">
                        Share feedback, report an issue, or ask for advice.
                      </p>

                      <div
                        className="mt-2 pt-1.5 border-t flex items-center justify-between gap-1"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <span
                          className="text-[10.5px] sm:text-[11.5px] font-bold tracking-wide"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          +91 91181 11575
                        </span>
                        <span className="text-[10.5px] sm:text-[11px] font-bold text-emerald-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
                          Share feedback &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </a>

                {/* Email Card */}
                <a
                  href={EMAIL_URL}
                  id="btn-email-support"
                  aria-label="Send email to hostelhub.support@gmail.com"
                  className="group relative rounded-xl p-2.5 sm:p-3 border transition-all duration-200 block text-left active:scale-[0.98] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        boxShadow: '0 3px 10px rgba(79, 70, 229, 0.25)',
                      }}
                    >
                      <Mail className="w-4 h-4 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className="text-xs sm:text-sm font-bold truncate leading-tight group-hover:text-indigo-500 transition-colors"
                          style={{ color: 'var(--text-heading)' }}
                        >
                          Email Support
                        </h4>
                        <ArrowRight className="w-3 h-3 text-indigo-500/70 group-hover:text-indigo-500 transition-colors shrink-0" />
                      </div>

                      <p className="text-[10.5px] sm:text-[11px] mt-0.5 leading-tight text-[var(--text-secondary)] truncate">
                        Send us your feedback, suggestions, or questions.
                      </p>

                      <div
                        className="mt-2 pt-1.5 border-t flex items-center justify-between gap-1"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <span
                          className="text-[10.5px] sm:text-[11.5px] font-bold truncate max-w-[130px] xs:max-w-[160px] sm:max-w-[140px] md:max-w-none"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          hostelhub.support@gmail.com
                        </span>
                        <span className="text-[10.5px] sm:text-[11px] font-bold text-indigo-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
                          Send email &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
