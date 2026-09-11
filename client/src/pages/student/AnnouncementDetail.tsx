import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Megaphone,
  ArrowLeft,
  Calendar,
  Clock,
  Paperclip,
  Download,
  Building2,
  Share2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { announcementsApi, notificationsApi } from '../../services/api';
import type { Announcement } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    announcementsApi
      .getById(id)
      .then((res) => {
        setAnnouncement(res.data?.announcement || null);
      })
      .catch((err) => {
        console.error('Failed to load announcement detail:', err);
        setError('This announcement could not be loaded or has expired.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleShare = () => {
    if (navigator.share && announcement) {
      navigator
        .share({
          title: announcement.title,
          text: announcement.message,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[var(--text-secondary)] font-semibold">Loading announcement details...</p>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <div
          className="max-w-md w-full p-8 rounded-3xl border text-center shadow-xl space-y-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-heading)]">Notice Not Available</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {error || 'This announcement could not be found.'}
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  const isUrgent = announcement.priority === 'urgent';
  const isImportant = announcement.priority === 'important';
  const isImageAttachment =
    announcement.attachment_type?.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(announcement.attachment_name || announcement.attachment_url || '');

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 pt-4 sm:pt-6">
        {/* Navigation back bar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border text-indigo-500 hover:bg-indigo-500/10"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* ── Main Announcement Card ───────────────────────────────────────── */}
        <article
          className={`rounded-3xl p-5 sm:p-8 border shadow-xl transition-all ${
            isUrgent ? 'border-rose-500/40' : isImportant ? 'border-amber-500/30' : ''
          }`}
          style={{
            background: 'var(--bg-card)',
            borderColor: isUrgent ? undefined : isImportant ? undefined : 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                isUrgent
                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                  : isImportant
                  ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                  : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
              }`}
            >
              {isUrgent ? '🔴 Urgent Priority' : isImportant ? '🟠 Important Notice' : '🔵 General Notice'}
            </span>

            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {announcement.category}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight"
            style={{ color: 'var(--text-heading)' }}
          >
            {announcement.title}
          </h1>

          {/* Publisher & Date Metadata banner */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 pb-3 border-y text-xs text-[var(--text-secondary)]"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)] leading-none">Hostel Management</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Official Residence Broadcast</p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end text-[11px] text-[var(--text-muted)]">
              {announcement.published_at && (
                <span>
                  Published: {format(new Date(announcement.published_at), 'MMMM d, yyyy • h:mm a')}
                </span>
              )}
              {announcement.expires_at && (
                <span className="text-amber-500 dark:text-amber-400 font-semibold">
                  Valid until: {format(new Date(announcement.expires_at), 'MMM d, yyyy • h:mm a')}
                </span>
              )}
            </div>
          </div>

          {/* Message content */}
          <div className="mt-6 text-sm sm:text-base leading-relaxed whitespace-pre-line text-[var(--text-primary)] font-normal">
            {announcement.message}
          </div>

          {/* Attachment section if available */}
          {announcement.attachment_url && (
            <div className="mt-8 pt-6 border-t space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                <Paperclip className="w-4 h-4 text-indigo-500" />
                <span>Notice Attachment</span>
              </div>

              {isImageAttachment ? (
                <div className="rounded-2xl overflow-hidden border shadow-md max-w-lg" style={{ borderColor: 'var(--border-color)' }}>
                  <img
                    src={announcement.attachment_url}
                    alt={announcement.attachment_name || 'Notice Attachment'}
                    className="w-full object-cover max-h-96"
                  />
                  <div
                    className="p-3 flex items-center justify-between text-xs border-t"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                  >
                    <span className="font-semibold truncate text-[var(--text-primary)]">
                      {announcement.attachment_name || 'Attached Image'}
                    </span>
                    <a
                      href={announcement.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-indigo-500 hover:text-indigo-400 shrink-0"
                    >
                      <span>Open Full</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <a
                  href={announcement.attachment_url}
                  download={announcement.attachment_name || 'announcement_attachment'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl border transition-all hover:border-indigo-500 active:scale-[0.99]"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold truncate text-[var(--text-heading)]">
                        {announcement.attachment_name || 'Download Attached Document'}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">Click to download file</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-indigo-500 shrink-0" />
                </a>
              )}
            </div>
          )}

          {/* Footer note */}
          <div
            className="mt-8 pt-4 border-t flex items-center gap-2 text-xs text-[var(--text-muted)]"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Verified notification broadcasted by HostelHub Administration</span>
          </div>
        </article>
      </div>
    </div>
  );
}
