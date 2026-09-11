import React, { useEffect, useState } from 'react';
import { adminApi, complaintsApi } from '../../services/api';
import type { Staff, Complaint } from '../../types';
import toast from 'react-hot-toast';
import {
  Wrench,
  UserCheck,
  Phone,
  Briefcase,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  User,
  UserPlus,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Electrician: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  Plumber: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30' },
  Carpenter: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  'Cleaning Staff': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

const ROLE_SUGGESTIONS: Record<string, string> = {
  Electrician: 'Fan, Light, Electricity, Wi-Fi',
  Plumber: 'Water, Plumbing, Bathroom',
  Carpenter: 'Furniture, Door / Lock',
  'Cleaning Staff': 'Cleaning, Waste Management',
  Security: 'Campus Security, Gate Access',
  Other: 'General Maintenance',
};

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  // Add Staff Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingStaff, setAddingStaff] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    role: 'Electrician',
    phone: '',
    specialization: 'Fan, Light, Electricity, Wi-Fi',
    department: 'Maintenance',
  });

  // Delete Staff Modal State
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState(false);

  useEffect(() => {
    Promise.all([
      adminApi.getStaff(),
      complaintsApi.getAll(),
    ])
      .then(([staffRes, complaintsRes]) => {
        setStaff(staffRes.data || []);
        setComplaints(complaintsRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roles = ['All', ...Array.from(new Set(staff.map(s => s.role)))];

  const getStaffWorkload = (staffId: string) => {
    const active = complaints.filter(
      c => c.assigned_staff === staffId && (c.status === 'assigned' || c.status === 'in_progress')
    ).length;
    const resolved = complaints.filter(
      c => c.assigned_staff === staffId && c.status === 'resolved'
    ).length;
    return { active, resolved };
  };

  const handleRoleChange = (newRole: string) => {
    const specialization = ROLE_SUGGESTIONS[newRole] || '';
    const department = newRole === 'Cleaning Staff' ? 'Housekeeping' : 'Maintenance';
    setAddForm(prev => ({ ...prev, role: newRole, specialization, department }));
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      toast.error('Staff member name is required');
      return;
    }
    if (addForm.phone.trim() && !/^[0-9+\s\-()]{7,15}$/.test(addForm.phone.trim())) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setAddingStaff(true);
    try {
      const res = await adminApi.addStaff(addForm);
      const created = res.data;
      setStaff(prev => [created, ...prev]);
      toast.success(`${created.name} added to maintenance staff! ✅`);
      setShowAddModal(false);
      setAddForm({
        name: '',
        role: 'Electrician',
        phone: '',
        specialization: 'Fan, Light, Electricity, Wi-Fi',
        department: 'Maintenance',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add staff member');
    } finally {
      setAddingStaff(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    setDeletingStaff(true);
    try {
      await adminApi.deleteStaff(staffToDelete.id);
      setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));
      toast.success(`${staffToDelete.name} has been removed. 🗑️`);
      setStaffToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to remove staff member');
    } finally {
      setDeletingStaff(false);
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      (s.specialization && s.specialization.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = selectedRole === 'All' || s.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalActiveAssigned = complaints.filter(
    c => c.assigned_staff && (c.status === 'assigned' || c.status === 'in_progress')
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-heading)] tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <Wrench className="w-6 h-6" />
            </span>
            Maintenance Staff
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Staff directory, assignment workloads, and complaint resolution metrics
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30 transition-all duration-200 active:scale-95 shrink-0 self-start sm:self-auto hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] transition-all"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Staff</span>
            <UserCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[var(--text-heading)]">{staff.length}</p>
          <p className="text-[11px] text-indigo-400 font-semibold mt-1">Active personnel</p>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] transition-all"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tasks</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">{totalActiveAssigned}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Currently in progress</p>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] transition-all"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">
            {complaints.filter(c => c.status === 'resolved' && c.assigned_staff).length}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Completed by staff</p>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] transition-all"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Availability</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-400">
            {staff.filter(s => getStaffWorkload(s.id).active === 0).length} / {staff.length}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Available for work</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="p-4 rounded-2xl border border-[var(--border-color)] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search staff by name, trade or specialization..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedRole === role
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-44 rounded-3xl border border-[var(--border-subtle)] animate-pulse"
              style={{ background: 'var(--bg-card)' }}
            />
          ))}
        </div>
      ) : filteredStaff.length === 0 ? (
        <div
          className="rounded-3xl border border-[var(--border-color)] p-12 text-center"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-heading)] mb-1">No Staff Members Found</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm mx-auto mb-4">
            Try adjusting your search query or add a new maintenance staff member.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map(member => {
            const { active, resolved } = getStaffWorkload(member.id);
            const roleStyle = ROLE_COLORS[member.role] || {
              bg: 'bg-indigo-500/15',
              text: 'text-indigo-400',
              border: 'border-indigo-500/30',
            };

            return (
              <div
                key={member.id}
                className="p-5 rounded-3xl border border-[var(--border-color)] hover:border-indigo-500/40 transition-all duration-200 shadow-xl space-y-4 relative group"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-heading)] text-base leading-tight">
                        {member.name}
                      </h3>
                      <span
                        className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      active > 0
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${active > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                    {active > 0 ? `${active} Busy` : 'Available'}
                  </span>
                </div>

                {member.specialization && (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-0.5">Specialization</span>
                    {member.specialization}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs">
                  <div className="p-2 rounded-xl bg-[var(--bg-primary)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Active Tasks</span>
                    <span className="text-[var(--text-heading)] font-bold text-sm">{active}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-primary)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Resolved Tasks</span>
                    <span className="text-emerald-400 font-bold text-sm">{resolved}</span>
                  </div>
                </div>

                {/* Bottom action row with phone & delete */}
                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  {member.phone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono text-[var(--text-primary)]">{member.phone}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)] italic">No phone registered</span>
                  )}

                  <div className="flex items-center gap-2">
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold transition-colors"
                      >
                        Call
                      </a>
                    )}
                    <button
                      onClick={() => setStaffToDelete(member)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Staff Member"
                      aria-label={`Delete ${member.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          ADD STAFF MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-lg rounded-3xl border border-[var(--border-color)] p-6 sm:p-8 space-y-6 shadow-2xl relative"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-heading)]">Add Staff Member</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Register new personnel for maintenance dispatches</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={e => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Sunil Verma"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Role / Trade *
                  </label>
                  <select
                    value={addForm.role}
                    onChange={e => handleRoleChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
                  >
                    <option value="Electrician" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Electrician</option>
                    <option value="Plumber" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Plumber</option>
                    <option value="Carpenter" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Carpenter</option>
                    <option value="Cleaning Staff" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Cleaning Staff</option>
                    <option value="Security" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Security</option>
                    <option value="Other" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={e => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Specialization Skills
                </label>
                <input
                  type="text"
                  value={addForm.specialization}
                  onChange={e => setAddForm(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="e.g. Fan, Light, Electricity, Wi-Fi"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
                />
                <p className="text-[11px] text-[var(--text-muted)] mt-1">Comma-separated complaint categories this staff member handles.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  value={addForm.department}
                  onChange={e => setAddForm(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Maintenance"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-primary)] hover:bg-[var(--border-subtle)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingStaff}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
                >
                  {addingStaff ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Add Personnel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          DELETE STAFF CONFIRMATION MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-md rounded-3xl border border-[var(--border-color)] p-6 space-y-5 shadow-2xl relative"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-heading)] leading-tight">Remove Staff Member?</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">This action will remove them from active dispatches</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2">
              <p className="text-sm font-bold text-[var(--text-heading)]">{staffToDelete.name}</p>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 font-semibold">
                  {staffToDelete.role}
                </span>
                {staffToDelete.phone && <span>&bull; {staffToDelete.phone}</span>}
              </div>

              {getStaffWorkload(staffToDelete.id).active > 0 && (
                <div className="mt-2 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Warning: This staff member has {getStaffWorkload(staffToDelete.id).active} active complaint(s) currently assigned.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-primary)] hover:bg-[var(--border-subtle)] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingStaff}
                onClick={handleDeleteStaff}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {deletingStaff ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Remove Staff</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
