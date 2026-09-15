import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Phone,
  Home,
  Building2,
  BookOpen,
  GraduationCap,
  IdCard,
  Shield,
  Edit2,
  Save,
  X,
  Loader2,
  User as UserIcon,
} from 'lucide-react';

const HOSTEL_OPTIONS = [
  'New Girls Hostel',
  'Old Girls Hostel',
  'New Boys Hostel',
  'Old Boys Hostel',
  'Technova',
];

const COURSE_OPTIONS = [
  'B.Tech',
  'BBA',
  'MBA',
  'BCA',
  'Polytechnic',
  'B-Pharma',
  'D-Pharma',
  'Pharm-D',
];

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: (user?.phone || '').replace(/\D/g, ''),
    course: user?.course || '',
    year: (user?.year || '').replace(/\D/g, ''),
    room: (user?.room || '').replace(/\D/g, ''),
    hostel: user?.hostel || '',
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await authApi.updateProfile(form);
      toast.success('Profile updated successfully! ✅');
      setEditing(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, rawValue: string) => {
    let value = rawValue;
    if (field === 'phone') {
      value = rawValue.replace(/\D/g, '').slice(0, 15);
    } else if (field === 'year') {
      value = rawValue.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'room') {
      value = rawValue.replace(/\D/g, '').slice(0, 8);
    }
    setForm(f => ({ ...f, [field]: value }));
  };

  const initials =
    user?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??';

  const infoItems: Array<{
    icon: any;
    label: string;
    value: string;
    field: string | null;
    editable: boolean;
    color: string;
    type?: string;
    inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
    pattern?: string;
  }> = [
    {
      icon: Home,
      label: 'Room Number',
      value: user?.room || 'Not assigned',
      field: 'room',
      editable: true,
      color: 'text-orange-400',
      type: 'tel',
      inputMode: 'numeric',
      pattern: '[0-9]*',
    },
    {
      icon: Building2,
      label: 'Hostel',
      value: user?.hostel || 'Not assigned',
      field: 'hostel',
      editable: true,
      color: 'text-indigo-400',
    },
    {
      icon: BookOpen,
      label: 'Course',
      value: user?.course || 'Not specified',
      field: 'course',
      editable: true,
      color: 'text-purple-400',
      type: 'text',
    },
    {
      icon: GraduationCap,
      label: 'Year',
      value: user?.year || 'Not specified',
      field: 'year',
      editable: true,
      color: 'text-emerald-400',
      type: 'text',
      inputMode: 'numeric',
      pattern: '[0-9]*',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: user?.phone || 'Not provided',
      field: 'phone',
      editable: true,
      color: 'text-blue-400',
      type: 'tel',
      inputMode: 'numeric',
      pattern: '[0-9]*',
    },
    {
      icon: IdCard,
      label: 'Student ID',
      value: user?.student_id || 'N/A',
      field: null,
      editable: false,
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-xl lg:max-w-4xl mx-auto px-3.5 sm:px-4 pt-3 sm:pt-4 pb-24">

        {/* ── Top Bar with Back Button ───────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <button
            onClick={() => navigate('/student')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Student Profile
          </span>
        </div>

        {/* ── Profile Hero Banner ────────────────────────────────────────── */}
        <div
          className="relative rounded-2xl p-5 mb-3.5 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #2d2475 50%, #1e1b4b 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            boxShadow: '0 4px 24px rgba(79, 70, 229, 0.2)',
          }}
        >
          {/* Background ambient light */}
          <div
            className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)' }}
          />

          <div className="relative z-10">
            {/* Avatar */}
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-black mx-auto mb-2.5 shadow-lg shadow-indigo-500/20"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: '3px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>

            {/* Name */}
            {editing ? (
              <input
                className="text-center text-white font-black text-lg sm:text-xl rounded-xl px-3 py-1 w-full max-w-xs mx-auto block border border-indigo-400/50 focus:outline-none focus:border-indigo-400"
                style={{ background: 'rgba(10, 8, 28, 0.65)' }}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your Full Name"
              />
            ) : (
              <h1 className="text-white text-lg sm:text-xl font-black">{user?.name}</h1>
            )}

            <p className="text-indigo-200/80 text-xs mt-0.5 font-medium">{user?.email}</p>

            {/* Badges */}
            <div className="flex justify-center flex-wrap items-center gap-1.5 mt-2.5">
              {user?.student_id && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
                  style={{ background: 'rgba(255, 255, 255, 0.12)' }}
                >
                  ID: {user.student_id}
                </span>
              )}
              {user?.room && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
                  style={{ background: 'rgba(255, 255, 255, 0.12)' }}
                >
                  Room {user.room}
                </span>
              )}
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
                style={{ background: 'rgba(255, 255, 255, 0.12)' }}
              >
                {user?.hostel || 'Hostel'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Edit Profile Button ────────────────────────────────────────── */}
        {user?.role === 'student' && (
          <div className="flex gap-2 mb-3.5">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/25"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="py-2 px-3.5 rounded-xl text-xs font-bold transition-all active:scale-95 border"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                  aria-label="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditing(true);
                  setForm(f => ({
                    ...f,
                    room: f.room ? f.room.replace(/\D/g, '') : '',
                  }));
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 border hover:border-indigo-500/40"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        )}

        {/* ── Info Items List ────────────────────────────────────────────── */}
        <div className="space-y-2 mb-3.5">
          {infoItems.map(item => (
            <div
              key={item.label}
              className="rounded-xl p-3 border flex items-center gap-3 transition-all"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-bold uppercase tracking-wider leading-tight"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.label}
                </p>
                {editing && item.editable && item.field ? (
                  item.field === 'hostel' ? (
                    <select
                      className="w-full text-xs font-semibold rounded-lg px-2 py-1 mt-0.5 cursor-pointer border focus:outline-none focus:border-indigo-400"
                      style={{
                        background: 'var(--input-bg)',
                        color: 'var(--input-text)',
                        borderColor: 'var(--border-input)',
                      }}
                      value={(form as any)[item.field] || ''}
                      onChange={e => setForm(f => ({ ...f, [item.field!]: e.target.value }))}
                    >
                      <option value="" disabled>Select hostel</option>
                      {HOSTEL_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : item.field === 'course' ? (
                    <select
                      className="w-full text-xs font-semibold rounded-lg px-2 py-1 mt-0.5 cursor-pointer border focus:outline-none focus:border-indigo-400"
                      style={{
                        background: 'var(--input-bg)',
                        color: 'var(--input-text)',
                        borderColor: 'var(--border-input)',
                      }}
                      value={(form as any)[item.field] || ''}
                      onChange={e => setForm(f => ({ ...f, [item.field!]: e.target.value }))}
                    >
                      <option value="" disabled>Select course</option>
                      {form.course && !COURSE_OPTIONS.includes(form.course) && (
                        <option value={form.course}>{form.course}</option>
                      )}
                      {COURSE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={item.type || 'text'}
                      inputMode={item.inputMode}
                      pattern={item.pattern}
                      className="w-full text-xs font-semibold rounded-lg px-2 py-1 mt-0.5 border focus:outline-none focus:border-indigo-400"
                      style={{
                        background: 'var(--input-bg)',
                        color: 'var(--input-text)',
                        borderColor: 'var(--border-input)',
                      }}
                      value={(form as any)[item.field] || ''}
                      onChange={e => handleFieldChange(item.field!, e.target.value)}
                      placeholder={`Enter ${item.label.toLowerCase()}`}
                    />
                  )
                ) : (
                  <p
                    className="font-semibold text-xs sm:text-sm mt-0.5 truncate"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    {item.value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Account Role Card ──────────────────────────────────────────── */}
        <div
          className="rounded-xl p-3 mb-4 border flex items-center gap-3"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)' }}
          >
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wider leading-tight"
              style={{ color: 'var(--text-muted)' }}
            >
              Account Role
            </p>
            <p className="font-semibold text-indigo-500 text-xs sm:text-sm mt-0.5 capitalize">
              {user?.role === 'admin' ? 'Administrator' : 'Student Residence'}
            </p>
          </div>
        </div>

        {/* ── HostelHub Platform Branding ─────────────────────────────────── */}
        <div
          className="flex items-center justify-center gap-2 mb-3 text-xs font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          <img src="/logo.png" alt="HostelHub" className="w-4 h-4 object-contain shrink-0" />
          <span>HostelHub &middot; Student Residence Portal</span>
        </div>

      </div>
    </div>
  );
}
