import React from 'react';
import { Mail, ExternalLink, ArrowRight, HeartHandshake } from 'lucide-react';

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
  'https://wa.me/919118111575?text=' +
  encodeURIComponent('Hi HostelHub Team, I would like to share some feedback/suggestions about the app.');

const EMAIL_URL =
  'mailto:hostelhub.support@gmail.com?subject=' +
  encodeURIComponent('HostelHub Feedback & Suggestion');

export default function FeedbackSupportCard() {
  return (
    <section
      aria-labelledby="feedback-support-heading"
      className="rounded-2xl p-3.5 sm:p-4 border transition-colors duration-200"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* ── Section Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 mb-2.5 sm:mb-3">
        <div>
          <h3
            id="feedback-support-heading"
            className="text-sm sm:text-base font-bold tracking-tight leading-tight"
            style={{ color: 'var(--text-heading)' }}
          >
            Feedback &amp; Support
          </h3>
          <p
            className="text-[11px] sm:text-xs mt-0.5 leading-tight"
            style={{ color: 'var(--text-secondary)' }}
          >
            Contact developer Shubham Gupta &amp; the HostelHub team. We&apos;d love to hear from you.
          </p>
        </div>

        <div
          className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shrink-0"
          style={{
            background: 'rgba(99, 102, 241, 0.10)',
            color: '#6366f1',
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}
        >
          <HeartHandshake className="w-3 h-3 text-indigo-500" />
          <span className="font-bold">Dev Team</span>
        </div>
      </div>

      {/* ── 2 Contact Options (Mobile: Stacked, Desktop: Side-by-side) ─────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 1. WhatsApp Card */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          id="btn-whatsapp-support"
          aria-label="Contact WhatsApp Support at +91 9118111575"
          className="group relative rounded-xl p-2.5 sm:p-3 border transition-all duration-200 block text-left active:scale-[0.98] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-start gap-2.5">
            {/* WhatsApp Icon */}
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

              <p
                className="text-[10.5px] sm:text-[11px] mt-0.5 leading-tight text-[var(--text-secondary)] truncate"
              >
                Share feedback, report an issue, or ask for advice.
              </p>

              {/* Number and CTA footer */}
              <div
                className="mt-2 pt-1.5 border-t flex items-center justify-between gap-1"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <span
                  className="text-[10.5px] sm:text-[11.5px] font-bold tracking-wide"
                  style={{ color: 'var(--text-primary)' }}
                >
                  +91 9118111575
                </span>
                <span className="text-[10.5px] sm:text-[11px] font-bold text-emerald-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
                  Share feedback &rarr;
                </span>
              </div>
            </div>
          </div>
        </a>

        {/* 2. Email Card */}
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
            {/* Email Icon */}
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

              <p
                className="text-[10.5px] sm:text-[11px] mt-0.5 leading-tight text-[var(--text-secondary)] truncate"
              >
                Send us your feedback, suggestions, or questions.
              </p>

              {/* Email Address and CTA footer */}
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
    </section>
  );
}
