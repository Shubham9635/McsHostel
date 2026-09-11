import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { safetyApi, uploadApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  Camera,
  Video,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Lock,
  Copy,
  Check,
  Clock,
  Calendar,
  Building,
  Info,
} from 'lucide-react';

const INCIDENT_TYPES = [
  { id: 'Ragging', label: 'Ragging', icon: '🛑' },
  { id: 'Physical Harassment', label: 'Physical Harassment', icon: '⚠️' },
  { id: 'Verbal Harassment', label: 'Verbal Harassment', icon: '🗣️' },
  { id: 'Bullying', label: 'Bullying', icon: '🚫' },
  { id: 'Threat / Intimidation', label: 'Threat / Intimidation', icon: '⚡' },
  { id: 'Other Safety Concern', label: 'Other Safety Concern', icon: '🛡️' },
];

const HOSTELS = [
  'New Girls Hostel',
  'Old Girls Hostel',
  'New Boys Hostel',
  'Old Boys Hostel',
  'Technova',
  'Hostel Campus Grounds / Common Area',
];

export default function StudentSafetyReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [incidentType, setIncidentType] = useState('Ragging');
  const [severity] = useState<'Normal' | 'Serious' | 'Urgent'>('Normal');
  const [isImmediateDanger] = useState(false);
  const [hostel, setHostel] = useState(user?.hostel || HOSTELS[0]);
  const [block, setBlock] = useState('');
  const [floor, setFloor] = useState('');
  const [location, setLocation] = useState('');

  // Date and time
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toTimeString().slice(0, 5);
  const [incidentDate, setIncidentDate] = useState(todayStr);
  const [incidentTime, setIncidentTime] = useState(nowTimeStr);

  const [description, setDescription] = useState('');

  // Evidence files
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // States
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<{
    id: string;
    tracking_id: string;
    created_at: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle Photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Photo "${file.name}" exceeds 10MB limit.`);
        continue;
      }
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
        toast.error(`Photo "${file.name}" is not a supported format (JPG, PNG, WEBP).`);
        continue;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setPhotoFiles(prev => [...prev, ...newFiles]);
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Video selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video exceeds maximum 50MB limit.');
      return;
    }
    if (!file.type.match(/^video\/(mp4|webm|quicktime)$/i) && !file.name.match(/\.(mp4|webm|mov)$/i)) {
      toast.error('Video must be in MP4, WEBM, or MOV format.');
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentType) {
      toast.error('Please select an incident type.');
      return;
    }
    if (!description.trim()) {
      toast.error('Please describe what happened.');
      return;
    }
    if (!hostel) {
      toast.error('Please select a hostel.');
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    setConfirmModalOpen(false);
    setLoading(true);

    try {
      // 1. Submit report payload
      const payload = {
        incident_type: incidentType,
        severity,
        is_immediate_danger: isImmediateDanger,
        hostel,
        block,
        floor,
        location,
        incident_date: incidentDate,
        incident_time: incidentTime,
        description: description.trim(),
      };

      const res = await safetyApi.submitReport(payload);
      const created = res.data;

      // 2. Upload evidence files if any
      const uploadPromises: Promise<any>[] = [];

      // Upload photos
      for (const file of photoFiles) {
        const fd = new FormData();
        fd.append('evidence', file);
        uploadPromises.push(
          uploadApi.uploadSafetyEvidence(created.id, fd).catch(err => {
            console.error('Evidence upload partial error:', err);
          })
        );
      }

      // Upload video
      if (videoFile) {
        const fd = new FormData();
        fd.append('evidence', videoFile);
        uploadPromises.push(
          uploadApi.uploadSafetyEvidence(created.id, fd).catch(err => {
            console.error('Video upload partial error:', err);
          })
        );
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      setSubmittedReport({
        id: created.id,
        tracking_id: created.tracking_id,
        created_at: created.created_at,
      });

      toast.success('Safety report securely submitted! 🛡️');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to submit safety report. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingId = () => {
    if (!submittedReport) return;
    navigator.clipboard.writeText(submittedReport.tracking_id);
    setCopied(true);
    toast.success('Tracking ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Success State Screen ────────────────────────────────────────────────────
  if (submittedReport) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="max-w-md w-full text-center py-8">
          <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <h2 className="text-2xl font-black text-[var(--text-heading)] mb-1.5">Report Submitted Successfully</h2>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-6 leading-relaxed">
            Your safety report has been securely submitted to authorized management. Your identity remains protected.
          </p>

          <div
            className="rounded-2xl p-5 mb-6 border border-[var(--border-color)] text-left relative overflow-hidden"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Tracking Reference ID</span>
              <span className="text-[10px] text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-semibold border border-indigo-500/20">
                Keep for tracking
              </span>
            </div>

            <div className="flex items-center justify-between mt-1 bg-[var(--bg-primary)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <span className="text-xl sm:text-2xl font-mono font-black text-indigo-500 dark:text-indigo-400 tracking-wider">
                {submittedReport.tracking_id}
              </span>
              <button
                type="button"
                onClick={copyTrackingId}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-2 text-xs text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Incident Type:</span>
                <span className="font-semibold text-[var(--text-heading)]">{incidentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Hostel / Location:</span>
                <span className="font-semibold text-[var(--text-heading)]">{hostel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Reporter Identity:</span>
                <span className="font-semibold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Protected
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/student/safety/my-reports')}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            >
              <span>View My Safety Reports</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/student')}
              className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-primary)] active:scale-95"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-28">
        {/* Header bar */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-primary)]"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h1 className="text-lg sm:text-xl font-black text-[var(--text-heading)] tracking-tight">Report a Safety Concern</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-xs font-medium mt-0.5">
              Your safety matters. You can report ragging or other serious incidents securely.
            </p>
          </div>
        </div>

        {/* Privacy Notice Card */}
        <div className="p-3.5 mb-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-3 shadow-md">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-indigo-600 dark:text-indigo-300 flex items-center gap-1.5 mb-0.5">
              <span>🔒 Identity Protected</span>
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Your identity will not be displayed to Hostel Management through the normal reporting interface.
              Reports are reviewed discreetly by authorized safety officials.
            </p>
          </div>
        </div>

        {/* Reporting Form */}
        <form onSubmit={handleOpenConfirm} className="space-y-5">
          {/* 1. Incident Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Incident Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INCIDENT_TYPES.map(type => {
                const isSelected = incidentType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setIncidentType(type.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/20'
                        : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-indigo-500/40 shadow-sm'
                    }`}
                  >
                    <span className="text-base">{type.icon}</span>
                    <span className="text-xs font-bold leading-snug">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Location */}
          <div
            className="p-4 rounded-2xl border border-[var(--border-color)] space-y-3"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                Incident Location
              </label>
              <span className="text-[10px] text-[var(--text-muted)] italic">Your room is not automatically revealed</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Hostel *</label>
              <select
                value={hostel}
                onChange={e => setHostel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm text-[var(--input-text)] bg-[var(--input-bg)] border border-[var(--border-input)] focus:outline-none focus:border-indigo-500"
              >
                {HOSTELS.map(h => (
                  <option key={h} value={h} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Block (Optional)</label>
                <input
                  type="text"
                  value={block}
                  onChange={e => setBlock(e.target.value)}
                  placeholder="e.g., Block B"
                  className="w-full px-3 py-2 rounded-xl text-xs text-[var(--input-text)] bg-[var(--input-bg)] border border-[var(--border-input)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Floor (Optional)</label>
                <input
                  type="text"
                  value={floor}
                  onChange={e => setFloor(e.target.value)}
                  placeholder="e.g., 2nd Floor"
                  className="w-full px-3 py-2 rounded-xl text-xs text-[var(--input-text)] bg-[var(--input-bg)] border border-[var(--border-input)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Specific Room or Area (Optional)</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g., Room 204, Staircase, Washroom, Mess Hall"
                className="w-full px-3 py-2 rounded-xl text-xs text-[var(--input-text)] bg-[var(--input-bg)] border border-[var(--border-input)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 4. Date & Time */}
          <div
            className="p-4 rounded-2xl border border-[var(--border-color)]"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                Date & Time of Incident
              </label>
              <button
                type="button"
                onClick={() => {
                  setIncidentDate(todayStr);
                  setIncidentTime(nowTimeStr);
                  toast('Set to Today & current time');
                }}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-lg transition-colors border border-indigo-500/20"
              >
                Today Shortcut
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] text-[var(--text-muted)] mb-1">Date</label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={e => setIncidentDate(e.target.value)}
                  max={todayStr}
                  className="w-full px-3 py-2 rounded-xl text-xs text-[var(--input-text)] bg-[var(--input-bg)] border border-[var(--border-input)] focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--text-muted)] mb-1">Time</label>
                <input
                  type="time"
                  value={incidentTime}
                  onChange={e => setIncidentTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs text-[var(--input-text)] bg-[var(--input-bg)] border border-[var(--border-input)] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 5. Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Describe what happened *
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Please describe the incident, what happened, where it happened, and any useful details..."
              rows={4}
              maxLength={1500}
              className="w-full px-3.5 py-3 rounded-2xl text-xs sm:text-sm text-[var(--input-text)] placeholder-[var(--text-muted)] bg-[var(--input-bg)] border border-[var(--border-input)] focus:outline-none focus:border-indigo-500/80 transition-all resize-none"
            />
            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mt-1">
              <span>Please avoid unnecessary personal information if you prefer maximum privacy.</span>
              <span>{description.length}/1500</span>
            </div>
          </div>

          {/* 6. Evidence Upload (Photos & Video) */}
          <div
            className="p-4 rounded-2xl border border-[var(--border-color)] space-y-4"
            style={{ background: 'var(--bg-card)' }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-indigo-400" />
                  Photo Evidence (Optional)
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">JPG, PNG, WEBP (Max 10MB each)</span>
              </div>

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {photoPreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-primary)] group">
                      <img src={preview} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500 shadow-md"
                        aria-label="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-[var(--border-color)] rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Upload Photos (Multiple allowed)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Video Upload */}
            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  Video Evidence (Optional)
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">MP4, WEBM, MOV (Max 50MB)</span>
              </div>

              {videoPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-black mb-3">
                  <video src={videoPreview} controls className="w-full max-h-56 object-contain" />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500 shadow-lg"
                    aria-label="Remove video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-[var(--border-color)] rounded-xl cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">Upload Video Recording</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* 7. Identity Protection Notice */}
          <div
            className="p-3.5 rounded-2xl border border-[var(--border-color)] flex items-start gap-2.5"
            style={{ background: 'var(--bg-card)' }}
          >
            <input
              type="checkbox"
              id="protected-box"
              checked={true}
              readOnly
              className="w-4 h-4 rounded mt-0.5 accent-indigo-600 pointer-events-none"
            />
            <label htmlFor="protected-box" className="text-xs text-[var(--text-secondary)] leading-relaxed cursor-default">
              <span className="font-bold text-[var(--text-heading)] block mb-0.5">Identity Protected by Default</span>
              Your name, email and student profile information will not be shown to Hostel Management.
              Submitted information and evidence are handled securely for safety review.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.99] disabled:opacity-50 shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Submitting Safety Report...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Submit Safety Report →</span>
              </>
            )}
          </button>
        </form>

        {/* Confirmation Modal */}
        {confirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div
              className="max-w-md w-full rounded-2xl p-5 border border-[var(--border-color)] text-[var(--text-primary)] shadow-2xl"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-3">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-lg font-black text-[var(--text-heading)] mb-1">Submit this report?</h3>
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-4 leading-relaxed">
                Your report will be securely sent to authorized Hostel Management for safety review.
                Your identity is protected and will not be displayed to management.
              </p>

              <div className="p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)] mb-4 space-y-1.5 text-xs">
                <p><span className="text-[var(--text-muted)]">Incident:</span> <strong className="text-[var(--text-heading)]">{incidentType}</strong></p>
                <p><span className="text-[var(--text-muted)]">Hostel:</span> <strong className="text-[var(--text-heading)]">{hostel}</strong></p>
                {photoFiles.length > 0 && <p className="text-[var(--text-secondary)]">📷 {photoFiles.length} photo(s) attached</p>}
                {videoFile && <p className="text-[var(--text-secondary)]">🎥 1 video attached</p>}
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
