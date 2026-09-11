import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { safetyApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Plus,
  Lock,
  RefreshCw,
  CheckCircle2,
  X,
} from 'lucide-react';

interface SafetyReportItem {
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
  created_at: string;
  updated_at: string;
}

interface ReportTimelineItem {
  id: string;
  old_status: string;
  new_status: string;
  changed_by_name: string;
  note?: string;
  created_at: string;
}

export default function MySafetyReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<SafetyReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<SafetyReportItem | null>(null);
  const [timeline, setTimeline] = useState<ReportTimelineItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await safetyApi.fetchMyReports();
      setReports(res.data || []);
    } catch (err: any) {
      toast.error('Failed to load your safety reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openReportDetail = async (report: SafetyReportItem) => {
    setSelectedReport(report);
    setTimelineLoading(true);
    try {
      const res = await safetyApi.fetchReportStatus(report.id);
      setTimeline(res.data?.history || []);
    } catch {
      setTimeline([]);
    } finally {
      setTimelineLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
      case 'new':
        return {
          bg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
          dot: 'bg-purple-500 dark:bg-purple-400',
          label: 'Submitted',
        };
      case 'Under Review':
      case 'under_review':
        return {
          bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
          dot: 'bg-blue-500 dark:bg-blue-400',
          label: 'Under Review',
        };
      case 'Investigation in Progress':
      case 'investigation':
        return {
          bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          dot: 'bg-amber-500 dark:bg-amber-400',
          label: 'Investigation in Progress',
        };
      case 'Resolved':
      case 'resolved':
        return {
          bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-500 dark:bg-emerald-400',
          label: 'Resolved',
        };
      case 'Closed':
      case 'closed':
      default:
        return {
          bg: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30',
          dot: 'bg-slate-500 dark:bg-slate-400',
          label: status || 'Closed',
        };
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/student')}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 border"
              style={{
                background: 'var(--input-bg)',
                borderColor: 'var(--border-color)',
              }}
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                <Shield className="w-5 h-5 text-indigo-400" />
                <span>My Safety Reports</span>
              </h1>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Track your submitted safety & anti-ragging concerns</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/student/safety')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Report</span>
          </button>
        </div>

        {/* Identity Notice */}
        <div className="p-3 mb-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2.5 text-xs text-indigo-400">
          <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Your identity is protected. These reports are only visible to you on your account.</span>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <span className="text-xs font-semibold">Loading your safety reports...</span>
          </div>
        ) : reports.length === 0 ? (
          <div
            className="p-8 text-center rounded-2xl border mt-4"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-heading)' }}>No Safety Reports Submitted</h3>
            <p className="text-xs mb-5 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              You have not submitted any anti-ragging or safety concerns. If you experience or witness an incident, you can report it securely.
            </p>
            <button
              type="button"
              onClick={() => navigate('/student/safety')}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 shadow-md shadow-rose-600/20 active:scale-95"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Report a Safety Concern</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(report => {
              const badge = getStatusBadge(report.status);
              return (
                <div
                  key={report.id}
                  onClick={() => openReportDetail(report)}
                  className="p-4 rounded-2xl border hover:border-indigo-500/40 cursor-pointer transition-all active:scale-[0.99]"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                      {report.tracking_id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                    <span>{report.incident_type}</span>
                    {report.is_immediate_danger && (
                      <span className="text-[10px] text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded font-bold border border-rose-500/30">
                        Urgent Danger
                      </span>
                    )}
                  </h3>

                  <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {report.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between pt-2.5 border-t text-[11px] gap-2" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {report.hostel}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {report.incident_date}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-indigo-400 font-semibold text-xs">
                      <span>Timeline</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Report Detail & Timeline Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div
              className="max-w-md w-full max-h-[90vh] overflow-y-auto rounded-2xl p-5 border text-left shadow-2xl space-y-4"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Report Details</span>
                  <h3 className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">{selectedReport.tracking_id}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors border"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Current Status:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedReport.status).bg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${getStatusBadge(selectedReport.status).dot}`} />
                  {getStatusBadge(selectedReport.status).label}
                </span>
              </div>

              {/* Report Information */}
              <div className="p-3.5 rounded-xl border space-y-2.5 text-xs" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Incident Category:</span>{' '}
                  <span className="font-bold" style={{ color: 'var(--text-heading)' }}>{selectedReport.incident_type}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Severity:</span>{' '}
                  <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{selectedReport.severity}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Hostel / Location:</span>{' '}
                  <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {selectedReport.hostel}
                    {selectedReport.location ? ` - ${selectedReport.location}` : ''}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>{' '}
                  <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {selectedReport.incident_date} at {selectedReport.incident_time}
                  </span>
                </div>
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="block mb-1" style={{ color: 'var(--text-muted)' }}>Description:</span>
                  <p className="leading-relaxed p-2.5 rounded-lg border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  Status Timeline & Updates
                </h4>

                {timelineLoading ? (
                  <div className="py-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Loading timeline...</div>
                ) : timeline.length === 0 ? (
                  <div className="p-3 text-center text-xs rounded-xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Report submitted. Management review is pending.
                  </div>
                ) : (
                  <div className="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-500/30">
                    {timeline.map((item, idx) => (
                      <div key={item.id || idx} className="relative">
                        <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2" style={{ borderColor: 'var(--bg-elevated)' }} />
                        <p className="text-xs font-bold" style={{ color: 'var(--text-heading)' }}>{item.new_status}</p>
                        {item.note && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.note}</p>}
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="w-full py-2.5 rounded-xl text-xs font-bold border transition-colors"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
