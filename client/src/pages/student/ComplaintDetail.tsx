import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintsApi } from '../../services/api';
import type { Complaint } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/ComplaintCard';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, User, CheckCircle2, XCircle, Calendar, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface StatusHistoryEntry {
  id: string;
  complaint_id: string;
  old_status: string | null;
  new_status: string;
  changed_by_name: string | null;
  note: string | null;
  created_at: string;
}

const STATUS_ICONS: Record<string, string> = {
  pending: '📝',
  assigned: '👨‍🔧',
  in_progress: '🔧',
  resolved: '✅',
  reopened: '🔁',
  rejected: '❌',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Complaint Submitted',
  assigned: 'Assigned to Staff',
  in_progress: 'Work Started',
  resolved: 'Resolved',
  reopened: 'Reopened',
  rejected: 'Closed',
};

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ solved: true, rating: 5, comment: '' });
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      complaintsApi.getById(id),
      complaintsApi.getHistory(id),
    ])
      .then(([cRes, hRes]) => {
        setComplaint(cRes.data);
        setHistory(hRes.data || []);
      })
      .catch(() => toast.error('Complaint not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFeedback = async (solved: boolean) => {
    if (!complaint) return;
    setFeedbackLoading(true);
    try {
      await complaintsApi.submitFeedback(complaint.id, { ...feedback, solved });
      if (solved) {
        toast.success('Glad it\'s resolved! ✅');
      } else {
        toast.success('Complaint reopened — management will look into it 🔁');
        const updated = await complaintsApi.getById(complaint.id);
        setComplaint(updated.data);
        const updatedHistory = await complaintsApi.getHistory(complaint.id);
        setHistory(updatedHistory.data || []);
      }
      setShowFeedback(false);
      setComplaint(prev => prev ? {
        ...prev,
        feedback: { ...feedback, solved, id: '', complaint_id: prev.id, student_id: '', created_at: new Date().toISOString() }
      } : prev);
    } catch {
      toast.error('Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="max-w-xl lg:max-w-4xl mx-auto px-3.5 sm:px-4 pt-4 pb-24 space-y-4">
          <div className="h-9 w-36 skeleton-dark rounded-xl" />
          <div className="h-44 skeleton-dark rounded-2xl" />
          <div className="h-36 skeleton-dark rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="text-center py-16">
          <div className="text-5xl mb-3">😕</div>
          <p className="font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Complaint not found</p>
          <button
            onClick={() => navigate('/student/complaints')}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            Back to Complaints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-xl lg:max-w-4xl mx-auto px-3.5 sm:px-4 pt-3 sm:pt-4 pb-24">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 shrink-0"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
            }}
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1
              className="text-base sm:text-lg font-black truncate leading-tight"
              style={{ color: 'var(--text-heading)' }}
            >
              {complaint.title}
            </h1>
            <p className="text-indigo-500 text-xs font-mono font-bold mt-0.5">
              {complaint.complaint_id}
            </p>
          </div>
        </div>

        {/* ── Badges ───────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          <span
            className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
          >
            {complaint.category}
          </span>
        </div>

        {/* ── Photo Preview (if any) ────────────────────────────────────────── */}
        {complaint.photo_url && (
          <div
            className="mb-4 rounded-2xl overflow-hidden border"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <img src={complaint.photo_url} alt="Complaint" className="w-full h-48 object-cover" />
          </div>
        )}

        {/* ── Details Card ─────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-4 mb-4 border"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 className="font-bold text-sm mb-2" style={{ color: 'var(--text-heading)' }}>Problem Details</h2>
          <p className="text-xs sm:text-sm leading-relaxed mb-4" style={{ color: 'var(--text-primary)' }}>
            {complaint.description}
          </p>

          <div
            className="grid grid-cols-2 gap-2.5 text-xs pt-3 border-t"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
          >
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{complaint.room} · {complaint.hostel}</span>
            </div>
            {complaint.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{complaint.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{format(new Date(complaint.created_at), 'dd MMM yyyy, hh:mm a')}</span>
            </div>
            {complaint.assigned_staff_name && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{complaint.assigned_staff_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Status Timeline Card ─────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-4 mb-4 border"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-heading)' }}>Status Timeline</h2>
          {history.length === 0 ? (
            <div className="text-center py-4 text-xs" style={{ color: 'var(--text-muted)' }}>No history available</div>
          ) : (
            <div className="space-y-0">
              {history.map((step, idx) => (
                <div key={step.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 border"
                      style={{
                        background: 'var(--bg-secondary)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <span>{STATUS_ICONS[step.new_status] || '📌'}</span>
                    </div>
                    {idx < history.length - 1 && (
                      <div className="w-0.5 h-6 mt-1 rounded-full bg-indigo-500/30" />
                    )}
                  </div>
                  <div className="pb-3.5 flex-1 min-w-0">
                    <p className="font-bold text-xs sm:text-sm" style={{ color: 'var(--text-heading)' }}>
                      {STATUS_LABELS[step.new_status] || step.new_status}
                    </p>
                    {step.note && (
                      <p className="text-xs text-indigo-400 font-medium mt-0.5">{step.note}</p>
                    )}
                    {step.changed_by_name && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {format(new Date(step.created_at), 'dd MMM, hh:mm a')}
                          {step.changed_by_name !== 'System' && ` · ${step.changed_by_name}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Feedback Verification Card (When Resolved) ────────────────────── */}
        {complaint.status === 'resolved' && !complaint.feedback && (
          <div
            className="rounded-2xl p-4 mb-4 border border-indigo-500/30"
            style={{
              background: 'rgba(79, 70, 229, 0.08)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            }}
          >
            <h2 className="font-bold text-sm mb-1" style={{ color: 'var(--text-heading)' }}>Was your problem solved? 🤔</h2>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Please verify the resolution of your complaint.</p>

            {!showFeedback ? (
              <div className="flex gap-2.5">
                <button
                  id="feedback-solved-btn"
                  onClick={() => { setFeedback(f => ({ ...f, solved: true })); setShowFeedback(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" /> Yes, Solved!
                </button>
                <button
                  id="feedback-not-solved-btn"
                  onClick={() => { setFeedback(f => ({ ...f, solved: false })); setShowFeedback(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all active:scale-95 shadow-md shadow-rose-600/20"
                >
                  <XCircle className="w-4 h-4" /> Still a Problem
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-3">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Rate the Resolution
                  </label>
                  <StarRating value={feedback.rating} onChange={v => setFeedback(f => ({ ...f, rating: v }))} size="md" />
                </div>
                <div className="mb-3">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Comments (Optional)
                  </label>
                  <textarea
                    value={feedback.comment}
                    onChange={e => setFeedback(f => ({ ...f, comment: e.target.value }))}
                    placeholder={feedback.solved
                      ? "Any feedback about the resolution quality..."
                      : "What is still wrong? This will reopen the complaint."}
                    className="w-full px-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none transition-all duration-200 resize-none border focus:border-indigo-500/60"
                    style={{
                      background: 'var(--input-bg)',
                      borderColor: 'var(--border-input)',
                      color: 'var(--input-text)',
                    }}
                    rows={2}
                  />
                </div>
                {!feedback.solved && (
                  <div className="mb-3 p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-400">
                    ⚠️ Submitting will <strong>reopen</strong> your complaint and notify management.
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleFeedback(feedback.solved)}
                    disabled={feedbackLoading}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 active:scale-95 disabled:opacity-50"
                  >
                    {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Feedback Display Card (If already submitted) ─────────────────── */}
        {complaint.feedback && (
          <div
            className="rounded-2xl p-4 mb-4 border border-emerald-500/20"
            style={{ background: 'rgba(16, 185, 129, 0.08)' }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs sm:text-sm text-emerald-400">Your Feedback</h3>
            </div>
            <p className="text-xs text-emerald-500 mb-2">
              Status: <strong>{complaint.feedback.solved ? '✅ Problem Solved' : '❌ Still a Problem'}</strong>
            </p>
            {complaint.feedback.rating && (
              <StarRating value={complaint.feedback.rating} readonly size="sm" />
            )}
            {complaint.feedback.comment && (
              <p className="text-xs mt-2 italic" style={{ color: 'var(--text-secondary)' }}>"{complaint.feedback.comment}"</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
