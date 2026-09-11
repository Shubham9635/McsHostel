import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintsApi, uploadApi } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Camera, Upload, X, CheckCircle2, AlertTriangle, Building2, Loader2, ArrowRight } from 'lucide-react';

const CATEGORIES = ['Fan', 'Light', 'Electricity', 'Water', 'Plumbing', 'Furniture', 'Cleaning', 'Bathroom', 'Door / Lock', 'Wi-Fi', 'Other'];
const CATEGORY_ICONS: Record<string, string> = {
  'Fan': '🌀', 'Light': '💡', 'Electricity': '⚡', 'Water': '💧', 'Plumbing': '🔧',
  'Furniture': '🪑', 'Cleaning': '🧹', 'Bathroom': '🚿', 'Door / Lock': '🔒', 'Wi-Fi': '📶', 'Other': '📋',
};

const HOSTELS = [
  'New Girls Hostel',
  'Old Girls Hostel',
  'New Boys Hostel',
  'Old Boys Hostel',
  'Technova',
];

export default function ReportProblemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    room: user?.room || '',
    hostel: user?.hostel || '',
    location: '',
    priority: 'normal' as 'normal' | 'medium' | 'urgent',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{ complaint_id: string; created_at: string } | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image too large. Max 5MB.'); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { toast.error('Please select a category'); return; }
    if (!form.title.trim()) { toast.error('Please enter a problem title'); return; }
    if (!form.description.trim()) { toast.error('Please describe the problem'); return; }
    if (!form.room.trim()) { toast.error('Please enter your room number'); return; }

    setLoading(true);
    try {
      let photoUrl: string | null = null;

      // Upload photo if selected
      if (photoFile) {
        const fd = new FormData();
        fd.append('photo', photoFile);
        try {
          const uploadRes = await uploadApi.uploadPhoto(fd);
          photoUrl = uploadRes.data.url;
        } catch { /* continue without photo */ }
      }

      const res = await complaintsApi.create({ ...form, photo_url: photoUrl });
      setSubmitted({ complaint_id: res.data.complaint_id, created_at: res.data.created_at });
      toast.success('Complaint submitted successfully! ✅');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="max-w-md w-full text-center py-6">
          <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-heading)' }}>Submitted! ✅</h2>
          <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>Your complaint has been registered and sent to management.</p>

          <div
            className="rounded-2xl p-4 mb-5 border text-left"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Complaint ID</p>
            <p className="text-2xl font-black text-indigo-500 font-mono mb-3">{submitted.complaint_id}</p>
            <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2.5" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Category</p>
                <p className="font-semibold text-xs mt-0.5" style={{ color: 'var(--text-heading)' }}>{CATEGORY_ICONS[form.category]} {form.category}</p>
              </div>
              <div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Priority</p>
                <p className="font-semibold text-xs capitalize mt-0.5" style={{ color: 'var(--text-heading)' }}>{form.priority}</p>
              </div>
              <div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Room</p>
                <p className="font-semibold text-xs mt-0.5" style={{ color: 'var(--text-heading)' }}>{form.room} · {form.hostel}</p>
              </div>
              <div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Status</p>
                <p className="font-semibold text-xs text-orange-500 mt-0.5">🟠 Pending</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => navigate('/student/complaints')}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/25 active:scale-95"
            >
              View My Complaints
            </button>
            <button
              onClick={() => {
                setSubmitted(null);
                setForm({ category: '', title: '', description: '', room: user?.room || '', hostel: user?.hostel || '', location: '', priority: 'normal' });
                setPhotoFile(null);
                setPhotoPreview(null);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border transition-all active:scale-95"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
              }}
            >
              New Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-xl lg:max-w-4xl mx-auto px-3.5 sm:px-4 pt-3 sm:pt-4 pb-24">
        <div className="flex items-center gap-3 mb-4">
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
            <h1 className="text-lg sm:text-xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>Report a Problem</h1>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Submit a maintenance request</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Problem Category *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  id={`cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all duration-150 active:scale-95 ${
                    form.category === cat
                      ? 'text-white border-transparent shadow-md shadow-indigo-500/25'
                      : 'hover:border-indigo-400/40'
                  }`}
                  style={
                    form.category === cat
                      ? { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }
                      : { background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }
                  }
                >
                  <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                  <span className="truncate w-full text-center text-[11px]">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Problem Title *
            </label>
            <input
              id="complaint-title"
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Ceiling Fan Not Working"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none transition-all duration-200 border focus:border-indigo-500/60"
              style={{
                background: 'var(--input-bg)',
                borderColor: 'var(--border-input)',
                color: 'var(--input-text)',
              }}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Detailed Description *
            </label>
            <textarea
              id="complaint-description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the problem in detail. When did it start? What is the impact?"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none transition-all duration-200 resize-none border focus:border-indigo-500/60"
              style={{
                background: 'var(--input-bg)',
                borderColor: 'var(--border-input)',
                color: 'var(--input-text)',
              }}
              rows={3}
              maxLength={500}
            />
            <p className="text-[10px] text-slate-400 mt-1 text-right">{form.description.length}/500</p>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Photo <span className="font-normal lowercase" style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                <img src={photoPreview} alt="preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label
                id="photo-upload"
                className="flex flex-col items-center justify-center gap-1.5 p-4 border-2 border-dashed rounded-xl cursor-pointer hover:border-indigo-500/40 transition-all"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex gap-2">
                  <Camera className="w-5 h-5 text-slate-400" />
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Tap to take photo or upload</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>JPG, PNG up to 5MB</p>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Room & Hostel */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Room Number *
              </label>
              <input
                id="complaint-room"
                type="text"
                value={form.room}
                onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                placeholder="e.g., B-204"
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none transition-all duration-200 border focus:border-indigo-500/60"
                style={{
                  background: 'var(--input-bg)',
                  borderColor: 'var(--border-input)',
                  color: 'var(--input-text)',
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Hostel *
              </label>
              <select
                id="complaint-hostel"
                value={form.hostel}
                onChange={e => setForm(f => ({ ...f, hostel: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none transition-all duration-200 border focus:border-indigo-500/60 cursor-pointer"
                style={{
                  background: 'var(--input-bg)',
                  borderColor: 'var(--border-input)',
                  color: 'var(--input-text)',
                }}
              >
                <option value="" disabled>Select hostel</option>
                {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Specific Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g., Near window, Bathroom, Corridor"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none transition-all duration-200 border focus:border-indigo-500/60"
              style={{
                background: 'var(--input-bg)',
                borderColor: 'var(--border-input)',
                color: 'var(--input-text)',
              }}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'normal', label: 'Normal', icon: '⚪', active: 'bg-slate-700 text-white border-slate-500' },
                { value: 'medium', label: 'Medium', icon: '🟡', active: 'bg-amber-600/30 text-amber-300 border-amber-500/50' },
                { value: 'urgent', label: 'Urgent', icon: '🔴', active: 'bg-rose-600/30 text-rose-300 border-rose-500/50' },
              ].map(p => (
                <button
                  key={p.value}
                  type="button"
                  id={`priority-${p.value}`}
                  onClick={() => setForm(f => ({ ...f, priority: p.value as any }))}
                  className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border font-bold text-xs transition-all active:scale-95 ${
                    form.priority === p.value
                      ? p.active
                      : 'hover:border-indigo-400/40'
                  }`}
                  style={
                    form.priority !== p.value
                      ? { background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }
                      : {}
                  }
                >
                  <span className="text-base">{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Urgent warning */}
          {form.priority === 'urgent' && (
            <div className="flex items-start gap-2 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
              <span>Urgent complaints are escalated immediately to hostel management.</span>
            </div>
          )}

          <button
            id="submit-complaint-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Submitting Complaint...</span>
              </>
            ) : (
              <>
                <span>🚀 Submit Complaint</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
