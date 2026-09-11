import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { complaintsApi, adminApi } from '../../services/api';
import type { Complaint, Staff } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/ComplaintCard';
import toast from 'react-hot-toast';
import {
  Search,
  X,
  UserCheck,
  Filter,
  ClipboardList,
  Building2,
  Calendar,
  Wrench,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  Ban,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const CATEGORIES = [
  'All',
  'Fan',
  'Light',
  'Electricity',
  'Water',
  'Plumbing',
  'Furniture',
  'Cleaning',
  'Bathroom',
  'Door / Lock',
  'Wi-Fi',
  'Other',
];

const HOSTELS = [
  'All',
  'New Girls Hostel',
  'Old Girls Hostel',
  'New Boys Hostel',
  'Old Boys Hostel',
  'Technova',
];

const STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'reopened', label: 'Reopened' },
  { value: 'rejected', label: 'Rejected' },
];

const PRIORITIES = [
  { value: 'all', label: 'All Priority' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'medium', label: 'Medium' },
  { value: 'normal', label: 'Normal' },
];

const STAFF_ASSIGNMENTS: Record<string, string> = {
  Fan: 'Electrician',
  Light: 'Electrician',
  Electricity: 'Electrician',
  'Wi-Fi': 'Electrician',
  Water: 'Plumber',
  Plumbing: 'Plumber',
  Bathroom: 'Plumber',
  Furniture: 'Carpenter',
  'Door / Lock': 'Carpenter',
  Cleaning: 'Cleaning Staff',
};

export default function ComplaintManagement() {
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    status: searchParams.get('filter') === 'pending' ? 'pending' : 'all',
    category: 'all',
    hostel: 'all',
    priority: 'all',
  });
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  const fetchComplaints = () => {
    setLoading(true);
    complaintsApi.getAll({
      status: filters.status !== 'all' ? filters.status : undefined,
      category: filters.category !== 'all' ? filters.category : undefined,
      hostel: filters.hostel !== 'all' ? filters.hostel : undefined,
      priority: filters.priority !== 'all' ? filters.priority : undefined,
      search: search || undefined,
    })
      .then(res => setComplaints(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
    adminApi.getStaff().then(res => setStaff(res.data || [])).catch(() => {});
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const openDetail = (c: Complaint) => {
    setSelected(c);
    setNewStatus(c.status);
    const suggestedRole = STAFF_ASSIGNMENTS[c.category];
    const suggestedStaff = staff.find(s => s.role === suggestedRole);
    setSelectedStaff(c.assigned_staff || suggestedStaff?.id || '');
  };

  const handleUpdateStatus = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      const staffMember = staff.find(s => s.id === selectedStaff);
      if (newStatus === 'assigned' && selectedStaff) {
        await adminApi.assignStaff(selected.id, {
          assigned_staff_id: selectedStaff,
          assigned_staff_name: staffMember?.name || null,
        });
      } else {
        await complaintsApi.updateStatus(selected.id, {
          status: newStatus,
          assigned_staff_id: selectedStaff || null,
          assigned_staff_name: staffMember?.name || null,
        });
      }
      toast.success(`Complaint status updated to ${newStatus.replace('_', ' ').toUpperCase()}! ✅`);
      setSelected(null);
      fetchComplaints();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = complaints.filter(c =>
    !search ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.complaint_id.toLowerCase().includes(search.toLowerCase()) ||
    (c.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    c.room.toLowerCase().includes(search.toLowerCase())
  );

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.category !== 'all' ||
    filters.hostel !== 'all' ||
    filters.priority !== 'all' ||
    Boolean(search);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-heading)] tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <ClipboardList className="w-6 h-6" />
            </span>
            Complaint Management
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Search, filter, assign maintenance staff, and update resolution lifecycle
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)]">
            Total Logged: <strong className="text-[var(--text-heading)] font-bold">{complaints.length}</strong>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────────── */}
      <div
        className="p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] shadow-2xl space-y-4"
        style={{ background: 'var(--bg-card)' }}
      >
        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="admin-search-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ticket ID, title, student name, or room number..."
            className="w-full pl-10 pr-24 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-indigo-500/20"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-xs font-semibold text-[var(--input-text)] focus:outline-none focus:border-indigo-500/60 cursor-pointer"
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                {s.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
            className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-xs font-semibold text-[var(--input-text)] focus:outline-none focus:border-indigo-500/60 cursor-pointer"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c === 'All' ? 'all' : c} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Hostel Filter */}
          <select
            value={filters.hostel}
            onChange={e => setFilters(f => ({ ...f, hostel: e.target.value }))}
            className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-xs font-semibold text-[var(--input-text)] focus:outline-none focus:border-indigo-500/60 cursor-pointer"
          >
            {HOSTELS.map(h => (
              <option key={h} value={h === 'All' ? 'all' : h} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                {h === 'All' ? 'All Hostels' : h}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
            className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-xs font-semibold text-[var(--input-text)] focus:outline-none focus:border-indigo-500/60 cursor-pointer"
          >
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                {p.label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('');
                setFilters({ status: 'all', category: 'all', hostel: 'all', priority: 'all' });
              }}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Complaints Data Presentation ─────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="h-20 rounded-3xl border border-[var(--border-subtle)] animate-pulse"
              style={{ background: 'var(--bg-card)' }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-3xl border border-[var(--border-color)] p-16 text-center space-y-3"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-heading)]">No Complaints Found</h3>
          <p className="text-[var(--text-muted)] text-sm max-w-sm mx-auto">
            {hasActiveFilters
              ? 'No tickets match the selected filters. Try clearing some criteria.'
              : 'There are no complaints currently registered in the database.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop SaaS Table */}
          <div
            className="hidden md:block rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--text-primary)]">
                <thead className="text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                  <tr>
                    <th className="py-4 px-5">Ticket &amp; Title</th>
                    <th className="py-4 px-4">Student</th>
                    <th className="py-4 px-4">Location</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4 whitespace-nowrap">Priority</th>
                    <th className="py-4 px-4 whitespace-nowrap">Status</th>
                    <th className="py-4 px-4">Staff</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filtered.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => openDetail(c)}
                      className="hover:bg-[var(--bg-primary)] cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-5">
                        <span className="font-mono text-xs text-indigo-500 dark:text-indigo-400 font-bold block">
                          {c.complaint_id}
                        </span>
                        <span className="font-bold text-[var(--text-heading)] text-sm leading-snug group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">
                          {c.title}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                          {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                            {(c.student_name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[var(--text-primary)] font-medium">{c.student_name || 'Student'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <span className="font-bold text-[var(--text-heading)] block">{c.room}</span>
                        <span className="text-[var(--text-muted)] text-[11px]">{c.hostel}</span>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-semibold text-[11px]">
                          {c.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-4 px-4 text-xs">
                        {c.assigned_staff_name ? (
                          <span className="text-indigo-500 dark:text-indigo-300 font-medium flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5" />
                            {c.assigned_staff_name}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(c);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition-all border border-indigo-500/30 active:scale-95"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Stacked Cards View */}
          <div className="md:hidden space-y-3">
            {filtered.map(c => (
              <div
                key={c.id}
                onClick={() => openDetail(c)}
                className="p-4 rounded-3xl border border-[var(--border-color)] active:scale-98 transition-all space-y-3 cursor-pointer"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs text-indigo-500 dark:text-indigo-400 font-bold">
                      {c.complaint_id}
                    </span>
                    <h3 className="font-bold text-[var(--text-heading)] text-base leading-tight mt-0.5">
                      {c.title}
                    </h3>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-primary)]">
                  <PriorityBadge priority={c.priority} />
                  <span className="px-2 py-0.5 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)]">
                    {c.category}
                  </span>
                  <span className="text-[var(--text-muted)]">•</span>
                  <span>{c.room} · {c.hostel}</span>
                </div>

                <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <span>Staff:</span>
                    <strong className="text-[var(--text-heading)]">
                      {c.assigned_staff_name || 'Unassigned'}
                    </strong>
                  </div>

                  <span className="text-indigo-500 dark:text-indigo-400 font-bold flex items-center gap-1">
                    Manage <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Detail & Staff Assignment Modal ─────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--border-color)] shadow-2xl p-6 space-y-5 animate-slide-up text-left"
            style={{
              background: 'var(--bg-elevated)',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <span className="font-mono text-xs text-indigo-500 dark:text-indigo-400 font-bold block mb-1">
                  {selected.complaint_id}
                </span>
                <h2 className="text-xl font-black text-[var(--text-heading)] leading-tight">
                  {selected.title}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-heading)] border border-[var(--border-subtle)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student & Location Info Card */}
            <div
              className="p-4 rounded-2xl border border-[var(--border-subtle)] space-y-3"
              style={{ background: 'var(--bg-primary)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center">
                    {(selected.student_name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-heading)] text-sm">{selected.student_name || 'Student'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{selected.room} · {selected.hostel}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[var(--text-muted)] block">Logged</span>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    {format(new Date(selected.created_at), 'dd MMM, hh:mm a')}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <StatusBadge status={selected.status} />
                <PriorityBadge priority={selected.priority} />
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {selected.category}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Detailed Description
              </label>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] leading-relaxed">
                {selected.description}
              </div>
            </div>

            {/* Attached Photo */}
            {selected.photo_url && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  Student Attached Photo
                </label>
                <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] max-h-48">
                  <img
                    src={selected.photo_url}
                    alt="Complaint Proof"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            )}

            {/* ── Assign Maintenance Staff ─────────────────────────────────── */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
                <span>Assign Staff Member</span>
                {STAFF_ASSIGNMENTS[selected.category] && (
                  <span className="text-indigo-500 dark:text-indigo-400 text-[10px] font-semibold">
                    Suggested: {STAFF_ASSIGNMENTS[selected.category]}
                  </span>
                )}
              </label>
              <select
                id="assign-staff-dropdown"
                value={selectedStaff}
                onChange={e => setSelectedStaff(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] text-sm focus:outline-none focus:border-indigo-500/60 cursor-pointer"
              >
                <option value="" className="bg-[var(--bg-card)] text-[var(--text-primary)]">No staff assigned</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                    {s.name} — {s.role} {s.specialization ? `(${s.specialization})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Status Lifecycle Selector ───────────────────────────────── */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Update Lifecycle Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { value: 'pending', label: 'Pending', icon: AlertCircle },
                  { value: 'assigned', label: 'Assigned', icon: UserCheck },
                  { value: 'in_progress', label: 'In Progress', icon: Clock },
                  { value: 'resolved', label: 'Resolved', icon: CheckCircle2 },
                  { value: 'reopened', label: 'Reopened', icon: RotateCcw },
                  { value: 'rejected', label: 'Rejected', icon: Ban },
                ].map(s => {
                  const isCurrent = newStatus === s.value;
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setNewStatus(s.value)}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400/50 shadow-md shadow-indigo-500/30'
                          : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                id="update-status-submit-btn"
                onClick={handleUpdateStatus}
                disabled={updating || (newStatus === selected.status && selectedStaff === (selected.assigned_staff || ''))}
                className="w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm transition-all duration-200 shadow-xl shadow-indigo-500/25 border border-indigo-400/30 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
              >
                {updating ? 'Saving Changes...' : 'Save & Dispatch Updates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
