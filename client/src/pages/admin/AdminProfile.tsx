import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  LogOut,
  Shield,
  Phone,
  Mail,
  Building2,
  Lock,
  Edit2,
  Check,
  X,
  Loader2,
} from 'lucide-react';

export default function AdminProfile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [savingPhone, setSavingPhone] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully 👋');
    navigate('/login');
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.trim();
    if (cleanPhone && !/^[0-9+\s\-()]{7,15}$/.test(cleanPhone)) {
      toast.error('Please enter a valid mobile number');
      return;
    }
    setSavingPhone(true);
    try {
      await updateProfile({ phone: cleanPhone || null });
      toast.success('Mobile number updated successfully! ✅');
      setIsEditingPhone(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update mobile number');
    } finally {
      setSavingPhone(false);
    }
  };

  const detailsList = [
    {
      icon: Mail,
      label: 'Registered Email',
      value: user?.email || 'admin@hostel.hub',
      color: 'text-indigo-400',
      isPhone: false,
    },
    {
      icon: Phone,
      label: 'Contact Phone',
      value: user?.phone || 'Not provided',
      color: 'text-emerald-400',
      isPhone: true,
    },
    {
      icon: Building2,
      label: 'Assigned Role',
      value: 'Hostel Operations Administrator',
      color: 'text-purple-400',
      isPhone: false,
    },
    {
      icon: Lock,
      label: 'Authentication Method',
      value: 'Passwordless Email OTP via SMTP',
      color: 'text-amber-400',
      isPhone: false,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3"
          style={{ color: 'var(--text-heading)' }}
        >
          <span className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <Shield className="w-6 h-6" />
          </span>
          Administrator Account
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          System credentials, authorization level and security controls
        </p>
      </div>

      {/* Hero Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 border relative overflow-hidden shadow-2xl text-center space-y-4"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 20, 68, 0.85) 0%, rgba(13, 10, 36, 0.95) 100%)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="absolute top-0 right-1/4 -mt-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-indigo-400/40 flex items-center justify-center text-white text-3xl font-black mx-auto shadow-xl shadow-indigo-500/30">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {user?.name === 'HostelHub Administrator' || !user?.name ? 'Hostel Management' : user.name}
            </h2>
            <p className="text-indigo-300 text-xs sm:text-sm mt-0.5">{user?.email}</p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" /> Full Root Administrator Access
          </div>
        </div>
      </div>


      {/* Profile Details List */}
      <div className="space-y-3">
        {detailsList.map(item => (
          <div
            key={item.label}
            className="p-4 rounded-2xl border flex items-center gap-4 transition-all"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>

            {item.isPhone && isEditingPhone ? (
              <form onSubmit={handleSavePhone} className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex-1">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    placeholder="Enter mobile number (e.g. +91 99000 00000)"
                    className="w-full px-3 py-1.5 rounded-xl border text-sm focus:outline-none focus:border-indigo-400"
                    style={{
                      background: 'var(--input-bg)',
                      color: 'var(--input-text)',
                      borderColor: 'var(--border-input)',
                    }}
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="submit"
                    disabled={savingPhone}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {savingPhone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPhone(false);
                      setPhoneInput(user?.phone || '');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-sm font-semibold mt-0.5 truncate"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    {item.value}
                  </p>
                </div>

                {item.isPhone && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneInput(user?.phone || '');
                      setIsEditingPhone(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-all active:scale-95 shrink-0"
                    aria-label="Edit Contact Phone"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Logout Action */}
      <button
        id="admin-logout-btn"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 hover:text-red-400 font-bold text-sm transition-all active:scale-98"
      >
        <LogOut className="w-4 h-4" />
        Sign Out of Administrator Session
      </button>
    </div>
  );
}
