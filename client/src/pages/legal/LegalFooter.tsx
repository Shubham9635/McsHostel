import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, ShieldCheck, Heart } from 'lucide-react';

export default function LegalFooter() {
  return (
    <footer
      className="border-t mt-12 py-8 transition-colors text-xs"
      style={{
        borderColor: 'var(--border-color)',
        background: 'var(--bg-card)',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="HostelHub Logo" className="w-5 h-5 object-contain" />
            <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-heading)' }}>
              Hostel<span style={{ color: '#f97316' }}>Hub</span>
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">&middot; Smart Hostel Platform</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold">
            <NavLink to="/about" className="hover:text-indigo-500 transition-colors">
              About
            </NavLink>
            <NavLink to="/privacy-policy" className="hover:text-indigo-500 transition-colors">
              Privacy Policy
            </NavLink>
            <NavLink to="/terms" className="hover:text-indigo-500 transition-colors">
              Terms &amp; Conditions
            </NavLink>
            <NavLink to="/account-deletion" className="hover:text-indigo-500 transition-colors">
              Account Deletion
            </NavLink>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
          <p>
            &copy; {new Date().getFullYear()} HostelHub. All rights reserved. Built for modern student campus life.
          </p>
          <div className="flex items-center gap-3">
            <span>Official Support:</span>
            <a
              href="mailto:hostelhub.support@gmail.com"
              className="text-indigo-500 hover:underline font-medium"
            >
              hostelhub.support@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
