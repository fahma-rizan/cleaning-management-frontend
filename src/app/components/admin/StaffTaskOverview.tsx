import { useState, useEffect, useMemo } from 'react';
import {
  Search, ArrowLeft, UserCheck, UserX, ClipboardList, CheckCircle2,
  Clock, XCircle, RefreshCw,
} from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

interface StaffOverviewRow {
  staffId: string;
  name: string;
  email: string;
  isAvailable: boolean;
  totalAssigned: number;
  totalCompleted: number;
  totalPending: number;
  totalDeclined: number;
}

interface TaskRow {
  _id: string;
  bookingId: string;
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  assignedAt: string;
  completedAt?: string;
}

interface StaffDetail {
  staff: { staffId: string; name: string; email: string; isAvailable: boolean };
  assignedTasks: TaskRow[];
  completedTasks: TaskRow[];
  pendingTasks: TaskRow[];
}

const STATUS_STYLES: Record<string, string> = {
  pending:      'bg-amber-100 text-amber-800',
  confirmed:    'bg-blue-100 text-blue-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  completed:    'bg-green-100 text-green-800',
  cancelled:    'bg-gray-100 text-gray-600',
};

function TaskTable({ tasks, dateLabel }: { tasks: TaskRow[]; dateLabel: string }) {
  if (tasks.length === 0) {
    return <div className="text-center py-12 text-gray-500 text-sm">No tasks in this category.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <th className="py-2 pr-4">Booking</th>
            <th className="py-2 pr-4">Customer</th>
            <th className="py-2 pr-4">Service</th>
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Time Slot</th>
            <th className="py-2 pr-4">{dateLabel}</th>
            <th className="py-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t._id} className="border-b border-gray-50 last:border-0">
              <td className="py-3 pr-4 font-mono text-xs text-gray-500">{t.bookingId}</td>
              <td className="py-3 pr-4 font-medium text-gray-900">{t.customerName}</td>
              <td className="py-3 pr-4 text-gray-700">{t.serviceName}</td>
              <td className="py-3 pr-4 text-gray-700">{t.date}</td>
              <td className="py-3 pr-4 text-gray-700">{t.time}</td>
              <td className="py-3 pr-4 text-gray-500 text-xs">
                {new Date(t.completedAt || t.assignedAt).toLocaleDateString()}
              </td>
              <td className="py-3 pr-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[t.status] || 'bg-gray-100 text-gray-700'}`}>
                  {t.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StaffDetailView({ staffId, onBack }: { staffId: string; onBack: () => void }) {
  const [detail, setDetail] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'assigned' | 'completed' | 'pending'>('assigned');

  useEffect(() => {
    setLoading(true);
    fetchWithAuth(`/staff/${staffId}/tasks`)
      .then(data => { if (data.success) setDetail(data); })
      .finally(() => setLoading(false));
  }, [staffId]);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><RefreshCw className="w-8 h-8 text-purple-300 animate-spin" /></div>;
  }
  if (!detail) {
    return <div className="text-center py-16 text-gray-500">Could not load this staff member's details.</div>;
  }

  const { staff } = detail;
  const tabs = [
    { id: 'assigned' as const,  label: 'Assigned Tasks',  count: detail.assignedTasks.length,  icon: ClipboardList },
    { id: 'completed' as const, label: 'Completed Tasks', count: detail.completedTasks.length, icon: CheckCircle2 },
    { id: 'pending' as const,   label: 'Pending Tasks',   count: detail.pendingTasks.length,   icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-purple-600 hover:text-purple-800 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Staff Task Overview
      </button>

      {/* Staff basic info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
              {staff.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{staff.name}</h2>
              <p className="text-sm text-gray-500">{staff.email} · <span className="font-mono text-xs">#{staff.staffId.slice(-6)}</span></p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
            staff.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {staff.isAvailable ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
            {staff.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tabs.map(t => (
          <div key={t.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-50"><t.icon className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{t.count}</p>
              <p className="text-xs text-gray-500">{t.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === t.id ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
        {tab === 'assigned'  && <TaskTable tasks={detail.assignedTasks}  dateLabel="Assigned" />}
        {tab === 'completed' && <TaskTable tasks={detail.completedTasks} dateLabel="Completed" />}
        {tab === 'pending'   && <TaskTable tasks={detail.pendingTasks}   dateLabel="Assigned" />}
      </div>
    </div>
  );
}

export function StaffTaskOverview() {
  const [staffList, setStaffList] = useState<StaffOverviewRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [availFilter, setAvailFilter] = useState<'All' | 'Available' | 'Unavailable'>('All');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/staff/overview');
      if (data.success) setStaffList(data.staff || []);
    } catch (err) {
      console.error('Failed to load staff overview:', err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return staffList.filter(s => {
      const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
      const matchesAvail = availFilter === 'All' || (availFilter === 'Available' ? s.isAvailable : !s.isAvailable);
      return matchesSearch && matchesAvail;
    });
  }, [staffList, search, availFilter]);

  const totals = useMemo(() => ({
    assigned:  staffList.reduce((s, x) => s + x.totalAssigned, 0),
    completed: staffList.reduce((s, x) => s + x.totalCompleted, 0),
    pending:   staffList.reduce((s, x) => s + x.totalPending, 0),
    declined:  staffList.reduce((s, x) => s + x.totalDeclined, 0),
  }), [staffList]);

  if (selectedStaffId) {
    return <StaffDetailView staffId={selectedStaffId} onBack={() => setSelectedStaffId(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Assigned',  value: totals.assigned,  icon: ClipboardList, color: 'text-purple-600 bg-purple-50' },
          { label: 'Total Completed', value: totals.completed, icon: CheckCircle2,  color: 'text-green-600 bg-green-50' },
          { label: 'Total Pending',   value: totals.pending,   icon: Clock,         color: 'text-amber-600 bg-amber-50' },
          { label: 'Total Declined',  value: totals.declined,  icon: XCircle,       color: 'text-red-600 bg-red-50' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${c.color}`}><c.icon className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Staff Task Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Click a staff member's name for their full task history.</p>
          </div>
          <button onClick={load} className="text-purple-600 hover:text-purple-800">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search staff by name or email..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            {(['All', 'Available', 'Unavailable'] as const).map(f => (
              <button
                key={f}
                onClick={() => setAvailFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  availFilter === f ? 'bg-purple-100 text-purple-700 border-2 border-purple-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="py-2 pr-4">Staff Member</th>
                <th className="py-2 pr-4">Staff ID</th>
                <th className="py-2 pr-4">Availability</th>
                <th className="py-2 pr-4">Assigned</th>
                <th className="py-2 pr-4">Completed</th>
                <th className="py-2 pr-4">Pending</th>
                <th className="py-2 pr-4">Declined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.staffId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => setSelectedStaffId(s.staffId)}
                      className="font-semibold text-purple-700 hover:text-purple-900 hover:underline text-left"
                    >
                      {s.name}
                    </button>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-gray-500">#{s.staffId.slice(-6)}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${s.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {s.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{s.totalAssigned}</td>
                  <td className="py-3 pr-4 text-gray-700">{s.totalCompleted}</td>
                  <td className="py-3 pr-4 text-gray-700">{s.totalPending}</td>
                  <td className="py-3 pr-4 text-gray-700">{s.totalDeclined}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">No staff members match your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
