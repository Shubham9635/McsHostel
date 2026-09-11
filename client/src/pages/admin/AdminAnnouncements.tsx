import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Send,
  Calendar,
  Clock,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Flame,
  X,
  Sparkles,
  Users,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Archive,
} from 'lucide-react';
import { announcementsApi } from '../../services/api';
import type {
  Announcement,
  AnnouncementCategory,
  AnnouncementPriority,
  AnnouncementStatus,
} from '../../types';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

const CATEGORIES: AnnouncementCategory[] = [
  'General',
  'Maintenance',
  'Mess',
  'Event',
  'Emergency',
  'Important',
  'Other',
];

const PRIORITIES: { key: AnnouncementPriority; label: string; color: string; badge: string; icon: string }[] = [
  { key: 'normal', label: 'Normal Priority', color: 'text-blue-500', badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: '🔵' },
  { key: 'important', label: 'Important', color: 'text-amber-500', badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: '🟠' },
  { key: 'urgent', label: 'Urgent Alert', color: 'text-rose-500', badge: 'bg-rose-500/15 text-rose-500 border-rose-500/30', icon: '🔴' },
];

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    scheduled: 0,
    expired: 0,
    totalStudents: 14,
  });

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formCategory, setFormCategory] = useState<AnnouncementCategory>('General');
  const [formPriority, setFormPriority] = useState<AnnouncementPriority>('normal');
  const [formExpiry, setFormExpiry] = useState('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState<string | null>(null);
  const [formAttachmentName, setFormAttachmentName] = useState<string | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load announcements & analytics
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const [resList, resStats] = await Promise.all([
        announcementsApi.getAll(),
        announcementsApi.getStats().catch(() => ({ data: null })),
      ]);

      const list: Announcement[] = resList.data?.announcements || [];
      setAnnouncements(list);

      if (resStats.data) {
        setStats(resStats.data);
      } else {
        setStats({
          total: list.length,
          published: list.filter((a) => a.status === 'published').length,
          drafts: list.filter((a) => a.status === 'draft').length,
          scheduled: list.filter((a) => a.status === 'scheduled').length,
          expired: list.filter((a) => a.status === 'expired').length,
          totalStudents: list[0]?.total_students || 14,
        });
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
      toast.error('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Filtered announcements list
  const filteredList = useMemo(() => {
    return announcements.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [announcements, statusFilter, categoryFilter, searchQuery]);

  // Open modal to create a new announcement
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormMessage('');
    setFormCategory('General');
    setFormPriority('normal');
    setFormExpiry('');
    setFormAttachmentUrl(null);
    setFormAttachmentName(null);
    setShowEditor(true);
  };

  // Open modal to edit existing announcement
  const handleOpenEdit = (item: Announcement) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormMessage(item.message);
    setFormCategory(item.category);
    setFormPriority(item.priority);
    setFormExpiry(item.expires_at ? item.expires_at.slice(0, 16) : '');
    setFormAttachmentUrl(item.attachment_url || null);
    setFormAttachmentName(item.attachment_name || null);
    setShowEditor(true);
  };

  // Handle attachment file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File exceeds 10MB limit.');
      return;
    }

    setUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append('attachment', file);
      const res = await announcementsApi.uploadAttachment(formData);
      setFormAttachmentUrl(res.data.url);
      setFormAttachmentName(res.data.name || file.name);
      toast.success('Attachment uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload file.');
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!formTitle.trim()) {
      toast.error('Please enter an announcement title.');
      return;
    }
    if (!formMessage.trim()) {
      toast.error('Please enter the announcement message.');
      return;
    }

    setActionLoading(true);
    try {
      if (editingItem) {
        await announcementsApi.update(editingItem.id, {
          title: formTitle.trim(),
          message: formMessage.trim(),
          category: formCategory,
          priority: formPriority,
          status: 'draft',
          attachment_url: formAttachmentUrl,
          attachment_name: formAttachmentName,
          expires_at: formExpiry ? new Date(formExpiry).toISOString() : null,
        });
        toast.success('Announcement draft updated.');
      } else {
        await announcementsApi.create({
          title: formTitle.trim(),
          message: formMessage.trim(),
          category: formCategory,
          priority: formPriority,
          status: 'draft',
          attachment_url: formAttachmentUrl,
          attachment_name: formAttachmentName,
          expires_at: formExpiry ? new Date(formExpiry).toISOString() : null,
        });
        toast.success('Announcement draft saved.');
      }
      setShowEditor(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to save announcement.');
    } finally {
      setActionLoading(false);
    }
  };

  // Click "Publish" button -> Trigger Confirmation Modal
  const handleInitiatePublish = () => {
    if (!formTitle.trim()) {
      toast.error('Please enter an announcement title.');
      return;
    }
    if (!formMessage.trim()) {
      toast.error('Please enter the announcement message.');
      return;
    }
    setShowConfirmPublish(true);
  };

  // Final confirmation to publish and deliver to all students
  const handleExecutePublish = async () => {
    setActionLoading(true);
    try {
      if (editingItem) {
        // Update first then publish
        await announcementsApi.update(editingItem.id, {
          title: formTitle.trim(),
          message: formMessage.trim(),
          category: formCategory,
          priority: formPriority,
          attachment_url: formAttachmentUrl,
          attachment_name: formAttachmentName,
          expires_at: formExpiry ? new Date(formExpiry).toISOString() : null,
        });
        await announcementsApi.publish(editingItem.id);
      } else {
        await announcementsApi.create({
          title: formTitle.trim(),
          message: formMessage.trim(),
          category: formCategory,
          priority: formPriority,
          status: 'published',
          attachment_url: formAttachmentUrl,
          attachment_name: formAttachmentName,
          expires_at: formExpiry ? new Date(formExpiry).toISOString() : null,
        });
      }

      toast.success('📢 Announcement published & delivered to all students!');
      setShowConfirmPublish(false);
      setShowPreview(false);
      setShowEditor(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to publish announcement.');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick publish for existing draft in list
  const handleDirectPublish = async (item: Announcement) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormMessage(item.message);
    setFormCategory(item.category);
    setFormPriority(item.priority);
    setFormAttachmentUrl(item.attachment_url || null);
    setShowConfirmPublish(true);
  };

  // Delete announcement
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    setDeletingId(id);
    try {
      await announcementsApi.delete(id);
      toast.success('Announcement deleted.');
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error('Failed to delete announcement.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* ── Page Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
              Announcements
            </h1>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Broadcast real-time hostel notices and important updates to all residents
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-create-announcement"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/25 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Announcement</span>
        </button>
      </div>

      {/* ── Analytics Quick Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className="rounded-2xl p-4 border transition-colors"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-xs font-semibold text-[var(--text-secondary)]">Total Created</p>
          <p className="text-2xl font-black mt-1 text-[var(--text-heading)]">{stats.total}</p>
          <span className="text-[10px] text-indigo-400 mt-0.5 block font-bold">Hostel wide</span>
        </div>

        <div
          className="rounded-2xl p-4 border transition-colors"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-xs font-semibold text-[var(--text-secondary)]">Published Active</p>
          <p className="text-2xl font-black mt-1 text-emerald-500">{stats.published}</p>
          <span className="text-[10px] text-emerald-400 mt-0.5 block font-bold">Visible to students</span>
        </div>

        <div
          className="rounded-2xl p-4 border transition-colors"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-xs font-semibold text-[var(--text-secondary)]">Drafts</p>
          <p className="text-2xl font-black mt-1 text-amber-500">{stats.drafts}</p>
          <span className="text-[10px] text-amber-400 mt-0.5 block font-bold">Pending broadcast</span>
        </div>

        <div
          className="rounded-2xl p-4 border transition-colors"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-xs font-semibold text-[var(--text-secondary)]">Active Students</p>
          <p className="text-2xl font-black mt-1 text-indigo-500">{stats.totalStudents}</p>
          <span className="text-[10px] text-indigo-400 mt-0.5 block font-bold">Audience reach</span>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-3.5 sm:p-4 border space-y-3"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search announcements by title, keyword, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border outline-none transition-all"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-48 shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border outline-none"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t pt-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
          {[
            { key: 'all', label: 'All Notices' },
            { key: 'published', label: 'Published' },
            { key: 'draft', label: 'Drafts' },
            { key: 'expired', label: 'Expired' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                statusFilter === tab.key
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-sm'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Announcements Feed ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            />
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center border mt-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-500">
            <Megaphone className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-heading)' }}>
            No announcements found
          </h3>
          <p className="text-xs max-w-sm mx-auto mb-4" style={{ color: 'var(--text-secondary)' }}>
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search or category filters.'
              : 'Create your first hostel announcement to broadcast updates to all residents.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Notice</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredList.map((item) => {
            const isUrgent = item.priority === 'urgent';
            const isImportant = item.priority === 'important';
            const isDraft = item.status === 'draft';
            const isExpired = item.status === 'expired';
            const readPercentage =
              stats.totalStudents > 0
                ? Math.round(((item.read_count || 0) / stats.totalStudents) * 100)
                : 0;

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
                  isUrgent
                    ? 'border-rose-500/40 shadow-sm shadow-rose-500/10'
                    : isImportant
                    ? 'border-amber-500/30'
                    : 'hover:border-[var(--border-color)]'
                }`}
                style={{
                  background: 'var(--bg-card)',
                  borderColor: isUrgent ? undefined : isImportant ? undefined : 'var(--border-color)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isUrgent
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                          : isImportant
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                      }`}
                    >
                      <Megaphone className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Chips row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isUrgent
                              ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                              : isImportant
                              ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}
                        >
                          {isUrgent ? '🔴 Urgent Alert' : isImportant ? '🟠 Important' : '🔵 Normal'}
                        </span>

                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {item.category}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : item.status === 'draft'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)] leading-snug">
                        {item.title}
                      </h3>

                      {/* Message preview */}
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed whitespace-pre-line">
                        {item.message}
                      </p>

                      {/* Attachment indicator if exists */}
                      {item.attachment_url && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-500 dark:text-indigo-400 font-semibold">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span className="truncate max-w-xs">{item.attachment_name || 'Attachment included'}</span>
                        </div>
                      )}

                      {/* Read Analytics & Dates */}
                      <div className="mt-3 pt-2.5 border-t flex flex-wrap items-center justify-between gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                          <span>
                            {item.published_at
                              ? `Published ${formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}`
                              : `Created ${formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}`}
                          </span>

                          {item.expires_at && (
                            <span className="hidden sm:inline">
                              Expires: {format(new Date(item.expires_at), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </div>

                        {/* Read count */}
                        {item.status === 'published' && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-500">
                            <Users className="w-3.5 h-3.5" />
                            <span>
                              {item.read_count || 0} / {stats.totalStudents} viewed ({readPercentage}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-1.5 sm:self-start shrink-0 pt-2 sm:pt-0">
                    {isDraft && (
                      <button
                        type="button"
                        onClick={() => handleDirectPublish(item)}
                        className="p-2 rounded-xl text-xs font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                        title="Publish to students"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl text-xs font-bold text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
                      title="Edit announcement"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                      title="Delete announcement"
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

      {/* ═══════════════════════════════════════════════════════════════════════
          CREATE / EDIT MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div
            className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-6 transition-all"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
                    {editingItem ? 'Edit Announcement' : 'Create New Announcement'}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Hostel-wide broadcast to all registered students
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
              {/* Title Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[var(--text-secondary)]">
                  Announcement Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Water Maintenance Notice"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-indigo-500"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Category & Priority Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[var(--text-secondary)]">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AnnouncementCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[var(--text-secondary)]">
                    Priority Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as AnnouncementPriority)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.icon} {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message Multiline Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[var(--text-secondary)]">
                  Message Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Provide clear, concise details for all students. (e.g. Schedule, affected wings, emergency contact instructions)..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none resize-y leading-relaxed transition-all focus:border-indigo-500"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Expiry Date (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[var(--text-secondary)]">
                  Auto-Expiry Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formExpiry}
                  onChange={(e) => setFormExpiry(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm outline-none"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Once expired, the announcement will automatically be archived from student active notifications.
                </p>
              </div>

              {/* Attachment File Upload (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[var(--text-secondary)]">
                  Attachment / Document / Photo (Optional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                />

                {formAttachmentUrl ? (
                  <div
                    className="flex items-center justify-between p-3 rounded-xl border"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-xs font-bold truncate text-[var(--text-primary)]">
                        {formAttachmentName || 'Attached File'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormAttachmentUrl(null);
                        setFormAttachmentName(null);
                      }}
                      className="text-xs text-rose-500 hover:text-rose-400 font-semibold px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAttachment}
                    className="w-full py-3 px-4 rounded-xl border border-dashed text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500 flex items-center justify-center gap-2 transition-all"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
                  >
                    <Paperclip className="w-4 h-4 text-indigo-500" />
                    <span>{uploadingAttachment ? 'Uploading file...' : 'Attach Image or PDF / Document (Max 10MB)'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="flex flex-wrap items-center justify-between gap-2.5 p-4 sm:p-6 border-t"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview as Student</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={handleInitiatePublish}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Announcement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          STUDENT PREVIEW MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-[var(--text-heading)]">
                  Student Notification Feed Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                formPriority === 'urgent'
                  ? 'border-rose-500/50 shadow-lg shadow-rose-500/10'
                  : formPriority === 'important'
                  ? 'border-amber-500/40'
                  : 'border-indigo-500/30'
              }`}
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    formPriority === 'urgent'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                      : formPriority === 'important'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                  }`}
                >
                  <Megaphone className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                        formPriority === 'urgent'
                          ? 'bg-rose-500/15 text-rose-500'
                          : formPriority === 'important'
                          ? 'bg-amber-500/15 text-amber-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}
                    >
                      {formPriority.toUpperCase()} • {formCategory}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  </div>

                  <h4 className="text-sm font-bold text-[var(--text-heading)] leading-snug">
                    {formTitle || 'Sample Announcement Title'}
                  </h4>

                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-3 leading-relaxed whitespace-pre-line">
                    {formMessage || 'Your message preview will render here for students...'}
                  </p>

                  {formAttachmentUrl && (
                    <div className="mt-2 text-[11px] font-semibold text-indigo-500 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      <span>{formAttachmentName || 'Attachment available'}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t text-[10px] text-[var(--text-muted)]" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span>Hostel Management • Just now</span>
                    <span className="text-indigo-500 font-bold flex items-center gap-0.5">
                      Details &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border text-[var(--text-primary)]"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  handleInitiatePublish();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm"
              >
                Proceed to Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PUBLISH CONFIRMATION DIALOG (Mandatory prompt requirement)
      ═══════════════════════════════════════════════════════════════════════ */}
      {showConfirmPublish && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mx-auto text-indigo-500">
              <Megaphone className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
                Publish announcement to all students?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                This announcement will be delivered immediately to <strong>all active students</strong> ({stats.totalStudents} residents) through HostelHub real-time notifications.
              </p>
            </div>

            {formPriority === 'urgent' && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-500">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <p className="font-bold">Urgent Priority Notice</p>
                  <p className="text-[11px] text-rose-400 mt-0.5">
                    This alert will appear pinned near the top of the student feed with prominent urgent indicators.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmPublish(false)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
              >
                Cancel
              </button>

              <button
                type="button"
                id="btn-confirm-publish-students"
                onClick={handleExecutePublish}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
              >
                {actionLoading ? 'Publishing...' : 'Publish to All Students'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
