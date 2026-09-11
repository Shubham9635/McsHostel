import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import {
  Users,
  Search,
  Building2,
  GraduationCap,
  Phone,
  Mail,
  AlertCircle,
  Filter,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react';

const HOSTELS = [
  'All',
  'New Girls Hostel',
  'Old Girls Hostel',
  'New Boys Hostel',
  'Old Boys Hostel',
  'Technova',
];

interface Student {
  id: string;
  name: string;
  email: string;
  student_id: string | null;
  role: string;
  room: string | null;
  hostel: string | null;
  phone: string | null;
  course: string | null;
  year: string | null;
  created_at: string;
  complaint_count: number;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('All');

  useEffect(() => {
    adminApi.getStudents()
      .then(res => setStudents(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.student_id && s.student_id.toLowerCase().includes(search.toLowerCase())) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.room && s.room.toLowerCase().includes(search.toLowerCase()));

    const matchesHostel =
      selectedHostel === 'All' || s.hostel === selectedHostel;

    return matchesSearch && matchesHostel;
  });

  const totalWithComplaints = students.filter(s => s.complaint_count > 0).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-heading)] tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <Users className="w-6 h-6" />
            </span>
            Student Directory
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Registered students, room allotments, and active complaint history
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] transition-all"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[var(--text-heading)]">{students.length}</p>
          <p className="text-[11px] text-indigo-500 dark:text-indigo-400 font-semibold mt-1">Active verified profiles</p>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] transition-all"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Room Allotted</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-500 dark:text-emerald-400">
            {students.filter(s => s.room && s.hostel).length}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Assigned to rooms</p>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] transition-all"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">With Complaints</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400">{totalWithComplaints}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Reported issues</p>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] transition-all"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Hostels Active</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-500 dark:text-purple-400">
            {new Set(students.map(s => s.hostel).filter(Boolean)).size}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Across campus</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="p-4 rounded-2xl border border-[var(--border-color)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name, roll ID, room, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-indigo-500/60 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-heading)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <select
            value={selectedHostel}
            onChange={e => setSelectedHostel(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] text-sm focus:outline-none focus:border-indigo-500/60 cursor-pointer"
          >
            {HOSTELS.map(h => (
              <option key={h} value={h} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                {h === 'All' ? 'All Hostels' : h}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-20 rounded-2xl border border-[var(--border-subtle)] animate-pulse"
              style={{ background: 'var(--bg-card)' }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-3xl border border-[var(--border-color)] p-12 text-center"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-heading)] mb-1">No Students Found</h3>
          <p className="text-[var(--text-muted)] text-sm max-w-sm mx-auto">
            {search || selectedHostel !== 'All'
              ? 'Try changing your search keywords or hostel filter criteria.'
              : 'No students have registered yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div
            className="hidden md:block rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--text-primary)]">
                <thead className="text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                  <tr>
                    <th className="py-3.5 px-5">Student</th>
                    <th className="py-3.5 px-4">Student ID</th>
                    <th className="py-3.5 px-4">Hostel / Room</th>
                    <th className="py-3.5 px-4">Course & Year</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-5 text-center">Complaints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filtered.map(student => (
                    <tr
                      key={student.id}
                      className="hover:bg-[var(--bg-primary)] transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/20 text-indigo-500 dark:text-indigo-300 font-bold text-sm flex items-center justify-center shrink-0">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--text-heading)] text-sm leading-snug">
                              {student.name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-500 dark:text-indigo-400 font-semibold">
                        {student.student_id || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {student.hostel ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                              <Building2 className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                              {student.hostel}
                            </span>
                            {student.room && (
                              <p className="text-xs text-[var(--text-muted)] mt-1 pl-1">
                                Room <span className="text-[var(--text-heading)] font-bold">{student.room}</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)] italic">Not assigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[var(--text-primary)]">
                        {student.course ? (
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{student.course} {student.year ? `(${student.year})` : ''}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)] italic">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[var(--text-primary)]">
                        {student.phone ? (
                          <div className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            {student.phone}
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)] italic">No phone</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            student.complaint_count > 0
                              ? 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {student.complaint_count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {filtered.map(student => (
              <div
                key={student.id}
                className="p-4 rounded-2xl border border-[var(--border-color)] space-y-3"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/20 text-indigo-500 dark:text-indigo-300 font-bold text-sm flex items-center justify-center">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-heading)] text-sm leading-snug">{student.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{student.email}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      student.complaint_count > 0
                        ? 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {student.complaint_count} complaints
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">Hostel</span>
                    <span className="text-[var(--text-primary)] font-medium">{student.hostel || 'Not assigned'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">Room</span>
                    <span className="text-[var(--text-primary)] font-medium">{student.room || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">ID</span>
                    <span className="font-mono text-indigo-500 dark:text-indigo-400">{student.student_id || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] block">Phone</span>
                    <span className="text-[var(--text-primary)]">{student.phone || '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
