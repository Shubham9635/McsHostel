import React from 'react';
import type { Complaint } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, User, Clock, CheckCircle2, Loader, CircleDot, AlertCircle } from 'lucide-react';

interface Props {
  complaint: Complaint;
  onClick?: () => void;
  showStudent?: boolean;
}

const categoryEmoji: Record<string, string> = {
  'Fan': '🌀', 'Light': '💡', 'Electricity': '⚡', 'Water': '💧',
  'Plumbing': '🔧', 'Furniture': '🪑', 'Cleaning': '🧹',
  'Bathroom': '🚿', 'Door / Lock': '🔒', 'Wi-Fi': '📶', 'Other': '📋',
};

export function StatusBadge({ status }: { status: Complaint['status'] }) {
  const configs = {
    pending: {
      label: 'Pending',
      class: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
      icon: <CircleDot className="w-3 h-3 shrink-0" />,
    },
    assigned: {
      label: 'Assigned',
      class: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
      icon: <User className="w-3 h-3 shrink-0" />,
    },
    in_progress: {
      label: 'In Progress',
      class: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
      icon: <Loader className="w-3 h-3 animate-spin shrink-0" />,
    },
    resolved: {
      label: 'Resolved',
      class: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      icon: <CheckCircle2 className="w-3 h-3 shrink-0" />,
    },
  };
  const config = configs[status] || configs.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${config.class}`}>
      {config.icon} {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Complaint['priority'] }) {
  const configs = {
    urgent: {
      label: 'Urgent',
      class: 'bg-red-500/15 text-red-400 border border-red-500/30',
      dot: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]',
    },
    medium: {
      label: 'Medium',
      class: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
      dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]',
    },
    normal: {
      label: 'Normal',
      class: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',
      dot: 'bg-slate-400',
    },
  };
  const config = configs[priority] || configs.normal;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${config.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}

export default function ComplaintCard({ complaint, onClick, showStudent = false }: Props) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 mb-3 border transition-all duration-200 ${
        onClick
          ? 'cursor-pointer hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.99]'
          : ''
      }`}
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {categoryEmoji[complaint.category] || '📋'}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="font-bold text-sm leading-tight truncate"
              style={{ color: 'var(--text-heading)' }}
            >
              {complaint.title}
            </p>
            <p className="text-indigo-500 text-xs font-mono font-bold mt-0.5">{complaint.complaint_id}</p>
          </div>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <p
        className="text-xs line-clamp-2 mb-3 leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {complaint.description}
      </p>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <PriorityBadge priority={complaint.priority} />
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)',
          }}
        >
          {complaint.category}
        </span>
      </div>

      <div
        className="flex items-center justify-between text-[11px] pt-2 border-t"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{complaint.room} · {complaint.hostel}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {showStudent && complaint.student_name && (
        <div
          className="mt-2.5 pt-2 border-t flex items-center gap-1.5 text-xs"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          <div className="w-5 h-5 bg-indigo-500/20 text-indigo-500 rounded-full flex items-center justify-center font-bold text-[10px]">
            {complaint.student_name.charAt(0)}
          </div>
          <span className="font-medium" style={{ color: 'var(--text-heading)' }}>{complaint.student_name}</span>
        </div>
      )}
    </div>
  );
}
