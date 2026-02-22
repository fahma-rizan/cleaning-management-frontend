import { DollarSign, CheckCircle, XCircle, Clock, ClipboardList } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

// ─── Static data ──────────────────────────────────────────────────────────────
const revenueData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 5000 },
  { month: 'Mar', revenue: 5800 },
  { month: 'Apr', revenue: 6400 },
  { month: 'May', revenue: 7200 },
  { month: 'Jun', revenue: 7900 },
  { month: 'Jul', revenue: 8500 },
];

const serviceData = [
  { name: 'Deep Cleaning', value: 35, color: '#7C3AED' },
  { name: 'Regular',       value: 28, color: '#3B82F6' },
  { name: 'Laundry',       value: 18, color: '#F59E0B' },
  { name: 'Sofa Cleaning', value: 12, color: '#D946EF' },
  { name: 'Other',         value: 7,  color: '#64748B' },
];

const recentBookings = [
  { id: 'BK-1001', customer: 'Priya Silva',    service: 'Home Cleaning',   date: '2025-02-12', time: '10:00 AM', status: 'confirmed',   amount: 4500 },
  { id: 'BK-1002', customer: 'Rajesh Kumar',   service: 'Laundry Service', date: '2025-02-12', time: '02:00 PM', status: 'in-progress', amount: 1200 },
  { id: 'BK-1003', customer: 'Nimal Fernando', service: 'Sofa Cleaning',   date: '2025-02-13', time: '09:00 AM', status: 'pending',     amount: 3500 },
  { id: 'BK-1004', customer: 'Sarah Johnson',  service: 'Deep Cleaning',   date: '2025-02-13', time: '11:00 AM', status: 'confirmed',   amount: 8000 },
  { id: 'BK-1005', customer: 'Ahmed Hassan',   service: 'Office Cleaning', date: '2025-02-14', time: '08:00 AM', status: 'pending',     amount: 5000 },
];

const stats = {
  todayOrders: 42, todayCompleted: 28,
  todayCancelled: 4, todayPending: 10, todayRevenue: 125000,
};

// Status badge colours
const STATUS_STYLES: Record<string, string> = {
  confirmed:    'bg-green-100 text-green-700',
  'in-progress':'bg-blue-100  text-blue-700',
  pending:      'bg-amber-100 text-amber-700',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminOverview() {
  return (
    <div className="space-y-6">

      {/* ── Section heading ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Today's Orders</h2>
        <p className="text-gray-500 text-sm mt-1">Summary of daily cleaning activities and revenue</p>
      </div>

      {/* ── 5 Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-50 p-2 rounded-lg"><ClipboardList className="w-5 h-5 text-purple-600" /></div>
            <span className="text-xs text-purple-600 font-medium">Today</span>
          </div>
          <div className="text-2xl font-bold mb-1">{stats.todayOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-green-50 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <span className="text-xs text-green-600 font-medium">Success</span>
          </div>
          <div className="text-2xl font-bold mb-1">{stats.todayCompleted}</div>
          <div className="text-sm text-gray-600">Complete Orders</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-red-50 p-2 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>
            <span className="text-xs text-red-600 font-medium">Dropped</span>
          </div>
          <div className="text-2xl font-bold mb-1">{stats.todayCancelled}</div>
          <div className="text-sm text-gray-600">Cancelled Orders</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-amber-500">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-amber-50 p-2 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
            <span className="text-xs text-amber-600 font-medium">Waiting</span>
          </div>
          <div className="text-2xl font-bold mb-1">{stats.todayPending}</div>
          <div className="text-sm text-gray-600">Pending Orders</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-600">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-100 p-2 rounded-lg"><DollarSign className="w-5 h-5 text-purple-700" /></div>
            <span className="text-xs text-purple-700 font-medium">Revenue</span>
          </div>
          <div className="text-2xl font-bold mb-1 text-purple-900">LKR {stats.todayRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>

      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Trend — Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Revenue Trend</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} ticks={[0, 2500, 5000, 7500, 10000]} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Breakdown — Donut */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Service Breakdown</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={serviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {serviceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {serviceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Recent Bookings Table ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>
          <button className="text-purple-600 text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left   text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-4 py-3 text-left   text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left   text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-4 py-3 text-left   text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left   text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right  text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-purple-600">{b.id}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{b.customer}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{b.service}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div>{b.date}</div>
                    <div className="text-xs text-gray-400">{b.time}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right font-medium text-gray-900">
                    LKR {b.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}