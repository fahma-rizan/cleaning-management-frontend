import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Download,
  Filter,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import type { User } from '../types';
import DemoTopBar from '../components/DemoTopBar';

interface AnalyticsDashboardProps {
  user: User;
}

interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
  refunds: number;
}

interface ServiceData {
  serviceType: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface PaymentMethodData {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

interface CustomerData {
  customerId: string;
  name: string;
  email: string;
  totalSpent: number;
  bookingCount: number;
  lastBooking: string;
  loyaltyPoints: number;
}

const API_BASE_URL = 'http://localhost:5000/api';

export default function AnalyticsDashboard({ user }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [serviceData, setServiceData] = useState<ServiceData[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodData[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    totalRefunds: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    conversionRate: 0,
  });

  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      toast.error('The request timed out. Please try again later.');
    }, 15000); // 15 seconds timeout

    try {
      const { signal } = controller;
      const [revenueRes, servicesRes, paymentsRes, customersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/revenue?range=${timeRange}`, { signal }),
        fetch(`${API_BASE_URL}/analytics/services?range=${timeRange}`, { signal }),
        fetch(`${API_BASE_URL}/analytics/payment-methods?range=${timeRange}`, { signal }),
        fetch(`${API_BASE_URL}/analytics/customers?range=${timeRange}`, { signal }),
      ]);

      clearTimeout(timeoutId);

      if (revenueRes.ok) {
        const revenue = await revenueRes.json();
        setRevenueData(revenue.data || []);
        setSummaryStats(prev => ({ ...prev, ...revenue.summary }));
      } else {
        throw new Error(`Failed to fetch revenue data: ${revenueRes.statusText}`);
      }

      if (servicesRes.ok) {
        setServiceData(await servicesRes.json());
      } else {
        throw new Error(`Failed to fetch service data: ${servicesRes.statusText}`);
      }

      if (paymentsRes.ok) {
        setPaymentMethodData(await paymentsRes.json());
      } else {
        throw new Error(`Failed to fetch payment method data: ${paymentsRes.statusText}`);
      }

      if (customersRes.ok) {
        setCustomerData(await customersRes.json());
      } else {
        throw new Error(`Failed to fetch customer data: ${customersRes.statusText}`);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('The request took too long to complete. Please check your connection and try again.');
      } else {
        setError('An error occurred while fetching analytics data. Please try again later.');
        console.error('Error fetching analytics data:', error);
        toast.error(error.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
      clearTimeout(timeoutId);
    }
  };

  // Calculate growth metrics
  const growthMetrics = useMemo(() => {
    if (revenueData.length < 2) return { revenue: 0, transactions: 0 };

    const current = revenueData[revenueData.length - 1];
    const previous = revenueData[revenueData.length - 2];

    return {
      revenue: previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0,
      transactions: previous.transactions > 0 ? ((current.transactions - previous.transactions) / previous.transactions) * 100 : 0,
    };
  }, [revenueData]);

  const formatCurrency = (amount: number): string => `Rs. ${amount.toLocaleString()}`;
  const formatPercentage = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: summaryStats,
      revenue: revenueData,
      services: serviceData,
      paymentMethods: paymentMethodData,
      topCustomers: customerData.slice(0, 10),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <DemoTopBar user={user} />
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <DemoTopBar user={user} />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoTopBar user={user} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive business insights and reporting</p>
          </div>
          <div className="flex gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryStats.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              {growthMetrics.revenue >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${growthMetrics.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(growthMetrics.revenue)} from last period
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalTransactions.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              {growthMetrics.transactions >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${growthMetrics.transactions >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(growthMetrics.transactions)} from last period
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryStats.avgOrderValue)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalCustomers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Revenue chart visualization</p>
                <p className="text-sm">({revenueData.length} data points)</p>
              </div>
            </div>
          </div>

          {/* Service Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Distribution</h3>
            <div className="space-y-4">
              {serviceData.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium">{service.serviceType}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(service.revenue)}</p>
                    <p className="text-xs text-gray-500">{service.percentage.toFixed(1)}% ({service.count} bookings)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-4">
              {paymentMethodData.map((method, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(method.amount)}</p>
                    <p className="text-xs text-gray-500">{method.percentage.toFixed(1)}% ({method.count} transactions)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
            <div className="space-y-3">
              {customerData.slice(0, 5).map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.bookingCount} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-xs text-gray-500">{customer.loyaltyPoints} points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 gap-8">
          {/* Revenue Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Transactions</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Refunds</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Net Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((data, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">{new Date(data.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium">{formatCurrency(data.revenue)}</td>
                      <td className="py-3 px-4 text-sm text-right">{data.transactions}</td>
                      <td className="py-3 px-4 text-sm text-right text-red-600">{formatCurrency(data.refunds)}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold">{formatCurrency(data.revenue - data.refunds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}