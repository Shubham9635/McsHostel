import React, { useEffect, useState } from 'react';
import { safetyApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Shield,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Lock,
  Camera,
  Video,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  X,
  FileText,
  UserCheck,
} from 'lucide-react';

interface SafetyReport {
  id: string;
  tracking_id: string;
  incident_type: string;
  severity: string;
  is_immediate_danger: boolean;
  description: string;
  hostel: string;
  block?: string;
  floor?: string;
  location?: string;
  incident_date: string;
  incident_time: string;
  status: string;
  priority: string;
  internal_notes?: string;
  evidence_count: number;
  reporter: string;
  identity_status: string;
  created_at: string;
  updated_at: string;
}

interface EvidenceFile {
  id: string;
  file_name?: string;
  file_type: string;
  file_size: number;
  signed_url?: string;
}

interface HistoryItem {
  id: string;
  old_status: string;
  new_status: string;
  changed_by_name: string;
  note?: string;
  created_at: string;
}

export default function AdminSafetyPage() {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    new_reports: 0,
    under_review: 0,
    investigation: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Selected Detail Modal
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);
  const [reportHistory, setReportHistory] = useState<HistoryItem[]>([]);
  const [reportEvidence, setReportEvidence] = useState<EvidenceFile[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Action fields in modal
  const [actionStatus, setActionStatus] = useState('');
  const [actionPriority, setActionPriority] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Active full photo modal
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes] = await Promise.all([
        safetyApi.fetchStats().catch(() => ({ data: null })),
        safetyApi.fetchAll({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          severity: severityFilter !== 'all' ? severityFilter : undefined,
          search: search.trim() || undefined,
        }),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
      }
      setReports(reportsRes.data || []);
    } catch (err: any) {
      toast.error('Failed to load safety reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openReportModal = async (report: SafetyReport) => {
    setSelectedReport(report);
    setActionStatus(report.status);
    setActionPriority(report.priority || 'Normal');
    setActionNote(report.internal_notes || '');
    setDetailLoading(true);
    setEvidenceLoading(true);

    try {
      // Fetch report details & history
      const detailRes = await safetyApi.fetchReport(report.id);
      setReportHistory(detailRes.data?.history || []);

      // Fetch signed evidence URLs
      const evRes = await safetyApi.fetchEvidenceUrls(report.id);
      setReportEvidence(evRes.data || []);
    } catch (err) {
      console.error('Failed to load details', err);
    } finally {
      setDetailLoading(false);
      setEvidenceLoading(false);
    }
  };

  const handleSaveAction = async () => {
    if (!selectedReport) return;
    setActionSubmitting(true);
    try {
      const res = await safetyApi.updateStatus(selectedReport.id, {
        status: actionStatus,
        priority: actionPriority,
        note: actionNote.trim() || undefined,
      });

      toast.success('Report updated successfully! ✅');
      setSelectedReport(prev => (prev ? { ...prev, ...res.data } : null));

      // Refresh list & stats
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update report.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
      case 'new':
        return {
          bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400',
          label: 'Submitted',
        };
      case 'Under Review':
      case 'under_review':
        return {
          bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
          dot: 'bg-blue-400',
          label: 'Under Review',
        };
      case 'Investigation in Progress':
      case 'investigation':
        return {
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
          label: 'Investigation in Progress',
        };
      case 'Resolved':
      case 'resolved':
        return {
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: 'Resolved',
        };
      case 'Closed':
      case 'closed':
      default:
        return {
          bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
          dot: 'bg-slate-400',
          label: status || 'Closed',
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-heading)] tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/20 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </span>
            Safety & Anti-Ragging
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1.5 leading-relaxed">
            Anonymous student incident reports and safety investigation oversight
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)]">
            Total Logged: <strong className="text-[var(--text-heading)] font-bold">{stats.total}</strong>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 6 Statistics Cards (Requirement 14) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          className="p-4 rounded-2xl border border-[var(--border-color)] shadow-lg flex flex-col justify-between"
          style={{ background: 'var(--bg-card)' }}
        >
          <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Total Reports</p>
          <p className="text-2xl sm:text-3xl font-black text-[var(--text-heading)]">{stats.total}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-2">All incidents</p>
        </div>

        <div
          className="p-4 rounded-2xl border border-purple-500/25 shadow-lg flex flex-col justify-between"
          style={{ background: 'var(--bg-card)' }}
        >
          <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">New Reports</p>
          <p className="text-2xl sm:text-3xl font-black text-purple-300">{stats.new_reports}</p>
          <p className="text-[11px] text-purple-400/70 mt-2">Awaiting triage</p>
        </div>

        <div
          className="p-4 rounded-2xl border border-blue-500/25 shadow-lg flex flex-col justify-between"
          style={{ background: 'var(--bg-card)' }}
        >
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-2">Under Review</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-300">{stats.under_review}</p>
          <p className="text-[11px] text-blue-400/70 mt-2">Warden reviewing</p>
        </div>

        <div
          className="p-4 rounded-2xl border border-amber-500/25 shadow-lg flex flex-col justify-between"
          style={{ background: 'var(--bg-card)' }}
        >
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">Investigation</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-300">{stats.investigation}</p>
          <p className="text-[11px] text-amber-400/70 mt-2">Active inquiry</p>
        </div>

        <div
          className="p-4 rounded-2xl border border-emerald-500/25 shadow-lg flex flex-col justify-between"
          style={{ background: 'var(--bg-card)' }}
        >
          <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Resolved</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-300">{stats.resolved}</p>
          <p className="text-[11px] text-emerald-400/70 mt-2">Action concluded</p>
        </div>

        <div
          className="p-4 rounded-2xl border border-rose-500/35 shadow-lg flex flex-col justify-between"
          style={{ background: 'var(--bg-card)' }}
        >
          <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-2">Urgent</p>
          <p className="text-2xl sm:text-3xl font-black text-rose-400">{stats.urgent}</p>
          <p className="text-[11px] text-rose-400/70 mt-2">Critical severity</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] shadow-2xl space-y-3.5"
        style={{ background: 'var(--bg-card)' }}
      >
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by tracking ID, incident type, hostel, or keyword..."
            className="w-full pl-10 pr-28 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-indigo-500/20"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-xs font-semibold text-[var(--input-text)] focus:outline-none focus:border-indigo-500/60 cursor-pointer"
          >
            <option value="all" className="bg-[var(--bg-card)] text-[var(--text-primary)]">All Statuses</option>
            <option value="Submitted" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Submitted</option>
            <option value="Under Review" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Under Review</option>
            <option value="Investigation in Progress" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Investigation</option>
            <option value="Resolved" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Resolved</option>
            <option value="Closed" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Closed</option>
          </select>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-xs font-semibold text-[var(--input-text)] focus:outline-none focus:border-indigo-500/60 cursor-pointer"
          >
            <option value="all" className="bg-[var(--bg-card)] text-[var(--text-primary)]">All Severities</option>
            <option value="Normal" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Normal</option>
            <option value="Serious" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Serious</option>
            <option value="Urgent" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Urgent</option>
          </select>
        </div>
      </div>

      {/* Reports Table (Requirement 15) */}
      <div
        className="rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-xl"
        style={{ background: 'var(--bg-card)' }}
      >
        {loading ? (
          <div className="py-20 text-center text-[var(--text-secondary)] flex flex-col items-center justify-center gap-2.5">
            <RefreshCw className="w-7 h-7 animate-spin text-indigo-400" />
            <p className="text-sm font-semibold">Loading safety reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-20 px-4 text-center text-[var(--text-secondary)] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center mb-3 text-[var(--text-muted)]">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-heading)] mb-1">No safety reports found</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
              Try adjusting your search query or reset the filter dropdowns above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-primary)]">
              <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Incident Type</th>
                  <th className="py-3 px-4">Hostel / Location</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Evidence</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {reports.map(report => {
                  const badge = getStatusBadge(report.status);
                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
                      onClick={() => openReportModal(report)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                        {report.tracking_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[var(--text-heading)]">
                        {report.incident_type}
                        {report.is_immediate_danger && (
                          <span className="block text-[9px] text-rose-400 font-bold mt-0.5">⚠️ Danger Flagged</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-primary)]">
                        <span className="block font-medium">{report.hostel}</span>
                        {report.location && (
                          <span className="text-[10px] text-[var(--text-muted)]">{report.location}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] whitespace-nowrap">
                        {report.incident_date}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            report.severity === 'Urgent'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : report.severity === 'Serious'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {report.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {report.evidence_count > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[var(--text-primary)] font-bold bg-[var(--bg-primary)] px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[10px]">
                            📷 {report.evidence_count} file(s)
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] text-[10px]">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          <span>Anonymous</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            openReportModal(report);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-semibold text-xs border border-indigo-500/30 transition-all active:scale-95"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Report Details & Evidence Modal (Requirements 16, 17, 18, 19) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div
            className="max-w-3xl w-full max-h-[92vh] overflow-y-auto rounded-2xl p-6 border border-[var(--border-color)] text-[var(--text-primary)] shadow-2xl space-y-5"
            style={{ background: 'var(--bg-elevated)' }}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <span className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    Safety Report Details
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-heading)] font-mono">
                  #{selectedReport.tracking_id}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reporter Protection Callout (Requirement 24) */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">Reporter: 🔒 Identity Protected</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Student identity is hidden by system policy
              </span>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs">
              <div>
                <p className="text-[var(--text-muted)] mb-0.5">Incident Type</p>
                <p className="font-bold text-[var(--text-heading)] text-sm">{selectedReport.incident_type}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] mb-0.5">Severity</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedReport.severity === 'Urgent'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : selectedReport.severity === 'Serious'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {selectedReport.severity}
                </span>
              </div>
              <div>
                <p className="text-[var(--text-muted)] mb-0.5">Date & Time</p>
                <p className="font-semibold text-[var(--text-primary)]">
                  {selectedReport.incident_date} at {selectedReport.incident_time}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-[var(--border-subtle)]">
                <p className="text-[var(--text-muted)] mb-0.5">Location</p>
                <p className="font-semibold text-[var(--text-primary)]">
                  {selectedReport.hostel}
                  {selectedReport.block ? ` · Block ${selectedReport.block}` : ''}
                  {selectedReport.floor ? ` · Floor ${selectedReport.floor}` : ''}
                  {selectedReport.location ? ` · ${selectedReport.location}` : ''}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Incident Description
              </h3>
              <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {selectedReport.description}
              </div>
            </div>

            {/* Evidence Viewer (Requirement 17) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                Submitted Evidence ({reportEvidence.length})
              </h3>

              {evidenceLoading ? (
                <div className="p-4 text-center text-xs text-[var(--text-muted)]">Loading evidence files...</div>
              ) : reportEvidence.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)]">No photo or video evidence was attached.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reportEvidence.map((ev, idx) => {
                    const isVideo = ev.file_type.startsWith('video/') || ev.file_name?.match(/\.(mp4|webm|mov)$/i);
                    return (
                      <div
                        key={ev.id || idx}
                        className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2 overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                          <span className="truncate max-w-[180px] font-mono text-[11px]">
                            {ev.file_name || `Evidence_${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {(ev.file_size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>

                        {isVideo ? (
                          ev.signed_url ? (
                            <video
                              src={ev.signed_url}
                              controls
                              className="w-full h-44 rounded-lg bg-black object-contain"
                            />
                          ) : (
                            <div className="h-28 flex items-center justify-center text-xs text-[var(--text-muted)]">
                              Video link unavailable
                            </div>
                          )
                        ) : (
                          ev.signed_url ? (
                            <div
                              onClick={() => setPreviewPhotoUrl(ev.signed_url!)}
                              className="relative h-40 rounded-lg overflow-hidden cursor-zoom-in bg-black group"
                            >
                              <img
                                src={ev.signed_url}
                                alt="Evidence"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                                Click to Zoom
                              </span>
                            </div>
                          ) : (
                            <div className="h-28 flex items-center justify-center text-xs text-[var(--text-muted)]">
                              Image link unavailable
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Audit Log / Status History Timeline (Requirement 19) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Status History & Audit Trail
              </h3>
              <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-3">
                {reportHistory.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">No status changes recorded yet.</p>
                ) : (
                  <div className="relative pl-5 space-y-3 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-500/30">
                    {reportHistory.map((item, idx) => (
                      <div key={item.id || idx} className="relative text-xs">
                        <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-[var(--bg-elevated)]" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--text-heading)]">{item.new_status}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)]">By {item.changed_by_name}</p>
                        {item.note && (
                          <p className="text-[11px] text-[var(--text-primary)] mt-1 italic bg-[var(--bg-card)] border border-[var(--border-subtle)] p-1.5 rounded">
                            "{item.note}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Admin Actions Panel (Requirement 18) */}
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                Take Administrative Action
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Update Investigation Status
                  </label>
                  <select
                    value={actionStatus}
                    onChange={e => setActionStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs text-[var(--input-text)] bg-[var(--input-bg)] border border-[var(--border-input)] focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Submitted" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Submitted (New)</option>
                    <option value="Under Review" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Under Review</option>
                    <option value="Investigation in Progress" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Investigation in Progress</option>
                    <option value="Resolved" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Resolved</option>
                    <option value="Closed" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Priority Level
                  </label>
                  <select
                    value={actionPriority}
                    onChange={e => setActionPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs text-[var(--input-text)] bg-[var(--input-bg)] border border-[var(--border-input)] focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Normal" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Normal</option>
                    <option value="Medium" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Medium</option>
                    <option value="Urgent" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Internal Investigation Note (Audit Only)
                </label>
                <textarea
                  value={actionNote}
                  onChange={e => setActionNote(e.target.value)}
                  placeholder="Record investigation findings, actions taken, or instructions..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-xs text-[var(--input-text)] bg-[var(--input-bg)] border border-[var(--border-input)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-primary)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAction}
                  disabled={actionSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
                >
                  {actionSubmitting ? 'Saving Changes...' : 'Save & Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Photo Zoom Modal */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewPhotoUrl}
              alt="Evidence Fullscreen"
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
