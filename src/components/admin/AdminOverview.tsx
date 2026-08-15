import { useState, useEffect } from "react";
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  ClipboardList,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { overviewAPI } from "../../lib/api";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  "in-progress": "bg-purple-100 text-purple-700",
};

export default function AdminOverview() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayCompleted: 0,
    todayCancelled: 0,
    todayPending: 0,
    todayRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState<
    { month: string; revenue: number }[]
  >([]);
  const [serviceData, setServiceData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);

  // Fetch stats with error handling
  const fetchStats = async () => {
    try {
      const [s, r, sv, rb] = await Promise.all([
        overviewAPI.getStats(),
        overviewAPI.getRevenueChart(),
        overviewAPI.getServiceBreakdown(),
        overviewAPI.getRecentBookings(),
      ]);
      setStats(s);
      setRevenueData(r);
      setServiceData(sv);
      setRecentBookings(rb);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch overview stats:', err);
    }
  };

  // Initial load and set up real-time polling
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let visibilityHandler: (() => void) | null = null;

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      // Poll every 30 seconds when tab is visible
      intervalId = setInterval(() => {
        fetchStats();
      }, 30000);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
        setIsAutoRefreshing(false);
      } else {
        setIsAutoRefreshing(true);
        fetchStats(); // Refresh immediately when tab becomes visible
        startPolling();
      }
    };

    // Initial fetch
    fetchStats().finally(() => setLoading(false));

    // Set up visibility listener
    visibilityHandler = handleVisibilityChange;
    document.addEventListener('visibilitychange', visibilityHandler);

    // Start polling only if tab is initially visible
    if (!document.hidden) {
      startPolling();
    }

    // Cleanup on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
      }
    };
  }, []);

  const handleViewAll = async () => {
    if (showAllBookings) {
      setShowAllBookings(false);
      return;
    }
    setLoadingAll(true);
    try {
      const data = await fetch(
        "http://localhost:5000/api/overview/recent-bookings?all=true",
        {
          headers: { "Content-Type": "application/json" },
        },
      ).then((r) => r.json());
      setAllBookings(data);
      setShowAllBookings(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAll(false);
    }
  };
  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Today's Orders</h2>
        <p className="text-gray-500 text-sm mt-1">
          Summary of daily cleaning activities and revenue
        </p>
        {lastUpdated && (
          <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isAutoRefreshing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            Last updated: {lastUpdated.toLocaleTimeString()} {!isAutoRefreshing && '(paused)'}
          </p>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-50 p-2 rounded-lg">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-purple-600 font-medium">Today</span>
          </div>
          <div className="text-2xl font-bold mb-1">{stats.todayOrders}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">Success</span>
          </div>
          <div className="text-2xl font-bold mb-1">{stats.todayCompleted}</div>
          <div className="text-sm text-gray-600">Complete Orders</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-medium">Dropped</span>
          </div>
          <div className="text-2xl font-bold mb-1">{stats.todayCancelled}</div>
          <div className="text-sm text-gray-600">Cancelled Orders</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-amber-500">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-amber-50 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-amber-600 font-medium">Waiting</span>
          </div>
          <div className="text-2xl font-bold mb-1">{stats.todayPending}</div>
          <div className="text-sm text-gray-600">Pending Orders</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">Revenue</span>
          </div>
          <div className="text-2xl font-bold mb-1">
            Rs {stats.todayRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Today's Revenue</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Revenue Overview
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7C3AED"
                  fill="url(#revGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Service Breakdown
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {serviceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {serviceData.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-gray-600 truncate text-xs">
                    {s.name}
                  </span>
                </div>
                <span className="font-bold text-gray-800 shrink-0">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            {showAllBookings
              ? `All Bookings (${allBookings.length})`
              : "Recent Bookings"}
          </h3>
          <button
            onClick={handleViewAll}
            className="text-sm font-semibold text-purple-600 hover:text-purple-800 hover:underline transition-colors"
          >
            {loadingAll
              ? "Loading..."
              : showAllBookings
                ? "Show Less"
                : "View All"}
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Booking ID",
                "Customer",
                "Service",
                "Date",
                "Time",
                "Status",
                "Amount",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(showAllBookings ? allBookings : recentBookings).map((b) => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-purple-600">
                  {b.bookingId}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {b.customerName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {b.serviceCategory || b.serviceName || b.serviceType || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{b.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{b.time}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[b.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold">
                  Rs {b.price?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
