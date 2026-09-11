import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsApi } from '../../services/api';
import type { Complaint } from '../../types';
import ComplaintCard from '../../components/ComplaintCard';
import { ArrowLeft, Plus, Search, ClipboardList, AlertCircle } from 'lucide-react';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: '🟠 Pending' },
  { value: 'assigned', label: '🔵 Assigned' },
  { value: 'in_progress', label: '🟣 In Progress' },
  { value: 'resolved', label: '🟢 Resolved' },
];

export default function MyComplaintsPage() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    complaintsApi.getAll({ status, search: search || undefined })
      .then(res => setComplaints(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  const filtered = complaints.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.complaint_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-xl lg:max-w-4xl mx-auto px-3.5 sm:px-4 pt-3 sm:pt-4 pb-24">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border-color)',
              }}
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <div>
              <h1
                className="text-lg sm:text-xl font-black tracking-tight"
                style={{ color: 'var(--text-heading)' }}
              >
                My Complaints
              </h1>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {complaints.length} total {complaints.length === 1 ? 'complaint' : 'complaints'}
              </p>
            </div>
          </div>

          <button
            id="new-complaint-btn"
            onClick={() => navigate('/student/report')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-150 active:scale-95 shadow-md shadow-indigo-500/20"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            }}
            aria-label="New Complaint"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* ── Search Input ─────────────────────────────────────────────────── */}
        <div className="relative mb-3.5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search complaints by title or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none transition-all duration-200 border focus:border-indigo-500/60"
            style={{
              background: 'var(--input-bg)',
              borderColor: 'var(--border-input)',
              color: 'var(--input-text)',
            }}
          />
        </div>

        {/* ── Status Filter Pills ─────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
                status === f.value
                  ? 'text-white shadow-md shadow-indigo-500/30'
                  : 'hover:border-indigo-400/40'
              }`}
              style={
                status === f.value
                  ? {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      border: '1px solid transparent',
                    }
                  : {
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                    }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Complaints Feed / Loading / Empty ────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-28 rounded-2xl skeleton-dark border"
                style={{ borderColor: 'var(--border-color)' }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center border mt-2"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <ClipboardList className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-heading)' }}>No complaints found</h3>
            <p className="text-xs mb-4 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Try a different search term' : 'You have not submitted any complaints yet.'}
            </p>
            <button
              onClick={() => navigate('/student/report')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
              }}
            >
              <Plus className="w-4 h-4" />
              Report a Problem
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(complaint => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onClick={() => navigate(`/student/complaints/${complaint.id}`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
