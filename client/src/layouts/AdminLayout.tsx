import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Users,
  Wrench,
  Bell,
  User,
  Building2,
  LogOut,
  Menu,
  X,
  Search,
  ChevronRight,
  Shield,
  ExternalLink,
  Settings,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationDropdown from '../components/NotificationDropdown';
import { notificationsApi } from '../services/api';
import toast from 'react-hot-toast';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/complaints', label: 'Complaints', icon: ClipboardList },
  { path: '/admin/safety', label: 'Safety Reports', icon: Shield },
  { path: '/admin/mess', label: 'Mess', icon: UtensilsCrossed },
  { path: '/admin/students', label: 'Students', icon: Users },
  { path: '/admin/staff', label: 'Staff', icon: Wrench },
  { path: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Dashboard Overview', subtitle: 'HostelHub Management Panel' },
  '/admin/complaints': { title: 'Complaint Management', subtitle: 'Review, assign staff and resolve student issues' },
  '/admin/safety': { title: 'Safety Reports', subtitle: 'Emergency alerts and incident management' },
  '/admin/mess': { title: 'Mess Analytics & Reviews', subtitle: 'Real-time student ratings and meal feedback' },
  '/admin/students': { title: 'Student Directory', subtitle: 'Registered students, room allotments and records' },
  '/admin/staff': { title: 'Maintenance Staff', subtitle: 'Workload distribution and active complaint tracking' },
  '/admin/announcements': { title: 'Announcements & Notices', subtitle: 'Broadcast real-time hostel notices to all residents' },
  '/admin/notifications': { title: 'System Alerts & Audit', subtitle: 'Real-time operational alerts and student activity' },
  '/admin/profile': { title: 'Administrator Profile', subtitle: 'Manage your credentials and system permissions' },
  '/admin/settings': { title: 'System Settings', subtitle: 'Display theme, alert preferences and developer support' },
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/admin/complaints?search=${encodeURIComponent(headerSearch.trim())}`);
    } else {
      navigate('/admin/complaints');
    }
  };

  const currentMeta = pageTitles[location.pathname] || {
    title: 'Admin Panel',
    subtitle: 'HostelHub Management',
  };

  const isProfileActive = location.pathname.startsWith('/admin/profile');
  const isSettingsActive = location.pathname.startsWith('/admin/settings');

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* ═══════════════════════════════════════════════════════════════════
          1. DESKTOP SIDEBAR (Fixed / Sticky)
      ═══════════════════════════════════════════════════════════════════ */}
      <aside
        className="hidden lg:flex flex-col w-72 h-screen fixed top-0 left-0 bottom-0 z-30 border-r border-white/[0.08] overflow-hidden"
        style={{
          background: 'var(--bg-sidebar)',
        }}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="HostelHub Logo"
              className="w-11 h-11 object-contain drop-shadow-[0_4px_16px_rgba(99,102,241,0.4)] shrink-0"
            />
            <div>
              <h1 className="text-white font-black text-xl tracking-tight leading-tight">
                Hostel<span style={{ color: '#f97316' }}>Hub</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Navigation
          </p>

          {navItems.map(item => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 text-sm font-semibold relative ${
                  isActive
                    ? 'text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                    : 'transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.path === '/admin/notifications' && unreadCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive
                        ? 'bg-white text-indigo-700'
                        : 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/50 animate-pulse'
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Settings Section at bottom of sidebar */}
        <div className="px-3.5 py-3 border-t border-white/[0.08] shrink-0">
          <NavLink
            to="/admin/settings"
            id="sidebar-admin-settings-btn"
            className={`group flex items-center justify-between px-2.5 py-2 rounded-xl transition-all duration-200 ${
              isSettingsActive
                ? 'text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                : 'border border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.04] text-slate-300 hover:text-white'
            }`}
            style={{
              background: isSettingsActive
                ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                : 'rgba(15, 12, 38, 0.75)',
            }}
            aria-label="Admin Settings"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isSettingsActive
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                }`}
              >
                <Settings className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  Settings
                </p>
                <p
                  className={`text-[10px] truncate mt-0.5 ${
                    isSettingsActive ? 'text-indigo-100 font-medium' : 'text-slate-400'
                  }`}
                >
                  System &amp; Theme
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 shrink-0 ${
                isSettingsActive ? 'text-white' : 'text-slate-500 group-hover:text-white'
              }`}
            />
          </NavLink>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════
          2. MAIN CONTENT AREA
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-clip lg:pl-72">
        {/* Top Header */}
        <header
          className="sticky top-0 z-30 border-b px-4 sm:px-6 lg:px-8 h-16 flex items-center backdrop-blur-xl shrink-0"
          style={{ background: 'var(--nav-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="w-full flex items-center justify-between gap-3">
            {/* Left: Mobile menu toggle + Page title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl border flex items-center justify-center active:scale-95 shrink-0 transition-colors"
                style={{
                  background: 'var(--input-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <h1
                  className="text-base sm:text-xl font-black truncate tracking-tight leading-tight"
                  style={{ color: 'var(--text-heading)' }}
                >
                  {currentMeta.title}
                </h1>
                <p
                  className="text-xs truncate hidden sm:block mt-0.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {currentMeta.subtitle}
                </p>
              </div>
            </div>

            {/* Right: Search, Notifications, Admin Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Quick Search */}
              <form onSubmit={handleSearchSubmit} className="hidden md:block relative w-48 lg:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={headerSearch}
                  onChange={e => setHeaderSearch(e.target.value)}
                  placeholder="Quick search complaints..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500/60 transition-all"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: 'var(--border-input)',
                    color: 'var(--input-text)',
                  }}
                />
              </form>

              {/* Notifications bell */}
              <div className="relative">
                <button
                  type="button"
                  id="admin-header-notif-bell"
                  onClick={() => {
                    if (window.innerWidth < 640) {
                      navigate('/admin/notifications');
                    } else {
                      setNotifDropdownOpen(prev => !prev);
                    }
                  }}
                  className="relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:border-indigo-500/40 active:scale-95"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: 'var(--border-input)',
                    color: 'var(--text-secondary)',
                  }}
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-indigo-900 shadow-sm shadow-indigo-500/50 animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <NotificationDropdown
                  isOpen={notifDropdownOpen}
                  onClose={() => setNotifDropdownOpen(false)}
                  viewAllPath="/admin/notifications"
                />
              </div>

              {/* Profile Pill - Clicking Hostel Management opens Profile */}
              <NavLink
                to="/admin/profile"
                id="admin-header-profile-btn"
                className={`flex items-center gap-2 h-10 px-1.5 sm:px-3 rounded-xl border transition-all cursor-pointer ${
                  isProfileActive
                    ? 'border-indigo-500/80 bg-indigo-500/10 shadow-sm shadow-indigo-500/20'
                    : 'hover:border-indigo-500/40'
                }`}
                style={{
                  background: isProfileActive ? undefined : 'var(--input-bg)',
                  borderColor: isProfileActive ? undefined : 'var(--border-input)',
                }}
                aria-label="Hostel Management Profile"
                title="View Hostel Management Profile"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-indigo-500/30 shrink-0">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p
                    className="text-xs font-bold leading-tight truncate max-w-[120px]"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    Hostel Management
                  </p>
                  <p className="text-[10px] text-emerald-500 font-semibold leading-tight flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    Online
                  </p>
                </div>
              </NavLink>
            </div>
          </div>
        </header>

        {/* Main Outlet */}
        <main className="flex-1 pb-12">
          <Outlet />
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          3. MOBILE SLIDE-OUT DRAWER (Off-canvas)
      ═══════════════════════════════════════════════════════════════════ */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div
            className="relative w-72 max-w-[85vw] h-full flex flex-col z-10 border-r border-white/10 shadow-2xl animate-slide-right"
            style={{
              background: 'linear-gradient(180deg, #090818 0%, #070B1F 100%)',
            }}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="HostelHub Logo"
                  className="w-10 h-10 object-contain drop-shadow-[0_4px_12px_rgba(99,102,241,0.4)] shrink-0"
                />
                <div>
                  <h2 className="text-white font-black text-lg">
                    Hostel<span style={{ color: '#f97316' }}>Hub</span>
                  </h2>
                  <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                    Admin Panel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Nav Items */}
            <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Navigation
              </p>
              {navItems.map(item => {
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all text-sm font-semibold ${
                      isActive
                        ? 'text-white shadow-lg shadow-indigo-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                        : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.path === '/admin/notifications' && unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500 text-white">
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Drawer Footer - Settings Section */}
            <div className="px-3.5 py-3 border-t border-white/[0.08]">
              <NavLink
                to="/admin/settings"
                onClick={() => setMobileDrawerOpen(false)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                  isSettingsActive
                    ? 'text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                    : 'border border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.04] text-slate-300 hover:text-white'
                }`}
                style={{
                  background: isSettingsActive
                    ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                    : 'rgba(15, 12, 38, 0.75)',
                }}
                aria-label="Admin Settings"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSettingsActive
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      Settings
                    </p>
                    <p
                      className={`text-[10px] truncate mt-0.5 ${
                        isSettingsActive ? 'text-indigo-100 font-medium' : 'text-slate-400'
                      }`}
                    >
                      System &amp; Theme
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSettingsActive ? 'text-white' : 'text-slate-500'
                  }`}
                />
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
