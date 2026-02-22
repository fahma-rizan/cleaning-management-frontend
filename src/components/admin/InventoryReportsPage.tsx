import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  BarChart3,
  FileText,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Header from '../Header';
import type { User } from '../../types';

interface InventoryReportsPageProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

interface UsageRecord {
  jobId: string;
  jobType: string;
  date: string;
  items: Array<{
    materialId: string;
    materialName: string;
    quantityUsed: number;
    unit: string;
    cost: number;
  }>;
  totalCost: number;
}

interface RestockRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantityAdded: number;
  unit: string;
  cost: number;
  date: string;
  supplier: string;
  totalCost: number;
}

export default function InventoryReportsPage({
  user,
  onLogout,
  theme,
  onToggleTheme,
  onProfileClick
}: InventoryReportsPageProps) {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<'usage' | 'cost' | 'stock' | 'trends'>('usage');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Get date range
  const getDateRange = () => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (dateRange) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'thisWeek':
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        start.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last3Months':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        }
        break;
    }

    return { start, end };
  };

  // Load and filter data
  const { start, end } = getDateRange();

  const usageRecords: UsageRecord[] = JSON.parse(localStorage.getItem('materialUsageRecords') || '[]')
    .filter((r: UsageRecord) => {
      const date = new Date(r.date);
      return date >= start && date <= end;
    });

  const restockRecords: RestockRecord[] = JSON.parse(localStorage.getItem('restockRecords') || '[]')
    .filter((r: RestockRecord) => {
      const date = new Date(r.date);
      return date >= start && date <= end;
    });

  const inventoryItems = JSON.parse(localStorage.getItem('inventoryItems') || '[]');

  // Calculate statistics
  const totalUsageCost = usageRecords.reduce((sum, r) => sum + r.totalCost, 0);
  const totalRestockCost = restockRecords.reduce((sum, r) => sum + r.totalCost, 0);
  const totalTransactions = usageRecords.length + restockRecords.length;
  const uniqueItemsUsed = new Set(usageRecords.flatMap(r => r.items.map(i => i.materialId))).size;

  // Usage by material
  const usageByMaterial = usageRecords.reduce((acc, record) => {
    record.items.forEach(item => {
      if (!acc[item.materialName]) {
        acc[item.materialName] = {
          name: item.materialName,
          quantity: 0,
          cost: 0,
          unit: item.unit,
          count: 0
        };
      }
      acc[item.materialName].quantity += item.quantityUsed;
      acc[item.materialName].cost += item.cost * item.quantityUsed;
      acc[item.materialName].count += 1;
    });
    return acc;
  }, {} as Record<string, any>);

  const topUsedMaterials = Object.values(usageByMaterial)
    .sort((a: any, b: any) => b.cost - a.cost)
    .slice(0, 10);

  // Daily usage trend
  const dailyUsage = usageRecords.reduce((acc, record) => {
    const date = new Date(record.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, cost: 0, count: 0 };
    }
    acc[date].cost += record.totalCost;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const dailyUsageData = Object.values(dailyUsage).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Category breakdown
  const categoryBreakdown = inventoryItems.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = { category: item.category, value: 0, count: 0 };
    }
    acc[item.category].value += item.currentStock * item.costPerUnit;
    acc[item.category].count += 1;
    return acc;
  }, {});

  const categoryData = Object.values(categoryBreakdown).map((item: any, index) => ({
    ...item,
    color: ['#7C3AED', '#3B82F6', '#F59E0B', '#10B981', '#EC4899'][index % 5]
  }));

  // Export to CSV
  const exportReport = (type: string) => {
    let csvContent = '';
    let filename = '';

    if (type === 'usage') {
      csvContent = [
        ['Material Usage Report', '', `Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`],
        [],
        ['Material Name', 'Quantity Used', 'Unit', 'Total Cost', 'Usage Count', 'Avg Cost per Use'],
        ...topUsedMaterials.map((m: any) => [
          m.name,
          m.quantity.toFixed(2),
          m.unit,
          `LKR ${m.cost.toFixed(2)}`,
          m.count,
          `LKR ${(m.cost / m.count).toFixed(2)}`
        ])
      ].map(row => row.join(',')).join('\n');
      filename = `material_usage_report_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'summary') {
      csvContent = [
        ['Monthly Inventory Summary Report'],
        [`Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`],
        [],
        ['Metric', 'Value'],
        ['Total Usage Cost', `LKR ${totalUsageCost.toLocaleString()}`],
        ['Total Restock Cost', `LKR ${totalRestockCost.toLocaleString()}`],
        ['Net Inventory Movement', `LKR ${(totalRestockCost - totalUsageCost).toLocaleString()}`],
        ['Total Transactions', totalTransactions],
        ['Unique Items Used', uniqueItemsUsed],
        ['Average Transaction Value', `LKR ${(totalUsageCost / (usageRecords.length || 1)).toFixed(2)}`],
        [],
        ['Top 5 Most Used Materials'],
        ['Material', 'Quantity', 'Cost'],
        ...topUsedMaterials.slice(0, 5).map((m: any) => [
          m.name,
          `${m.quantity.toFixed(2)} ${m.unit}`,
          `LKR ${m.cost.toFixed(2)}`
        ])
      ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');
      filename = `inventory_summary_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const renderUsageReport = () => (
    <div className="space-y-6">
      {/* Top Used Materials Chart */}
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Top 10 Most Used Materials
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topUsedMaterials} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
              />
              <YAxis tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }} />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="cost" fill="#7C3AED" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Usage Details Table */}
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Material Usage Details
          </h3>
          <button
            onClick={() => exportReport('usage')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Usage Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Material Name
                </th>
                <th className={`px-4 py-3 text-right text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Quantity Used
                </th>
                <th className={`px-4 py-3 text-right text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Total Cost
                </th>
                <th className={`px-4 py-3 text-right text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Usage Count
                </th>
                <th className={`px-4 py-3 text-right text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Avg Cost/Use
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {topUsedMaterials.map((material: any, index) => (
                <tr key={index} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className={`px-4 py-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {material.name}
                  </td>
                  <td className={`px-4 py-4 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {material.quantity.toFixed(2)} {material.unit}
                  </td>
                  <td className={`px-4 py-4 text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    LKR {material.cost.toLocaleString()}
                  </td>
                  <td className={`px-4 py-4 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {material.count}
                  </td>
                  <td className={`px-4 py-4 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    LKR {(material.cost / material.count).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCostAnalysis = () => (
    <div className="space-y-6">
      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-purple-500`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            LKR {totalUsageCost.toLocaleString()}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Usage Cost
          </div>
        </div>

        <div className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-green-500`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'}`}>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            LKR {totalRestockCost.toLocaleString()}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Restock Cost
          </div>
        </div>

        <div className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-blue-500`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            LKR {(totalRestockCost - totalUsageCost).toLocaleString()}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Net Movement
          </div>
        </div>

        <div className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-orange-500`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
              <Package className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {totalTransactions}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Transactions
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Inventory Value by Category
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={(entry) => `${entry.category}: LKR ${entry.value.toLocaleString()}`}
                >
                  {categoryData.map((entry: any, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Category Breakdown
          </h3>
          <div className="space-y-4">
            {categoryData.map((cat: any, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {cat.category}
                    </span>
                  </div>
                  <span className={`text-lg font-bold text-purple-600`}>
                    LKR {cat.value.toLocaleString()}
                  </span>
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {cat.count} items in stock
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrendsAnalysis = () => (
    <div className="space-y-6">
      {/* Daily Usage Trend */}
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Daily Usage Trend
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
              />
              <YAxis tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }} />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#7C3AED" 
                strokeWidth={3}
                dot={{ fill: '#7C3AED', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {usageRecords.slice(0, 10).map((record, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Job: {record.jobType} ({record.jobId})
                  </div>
                  <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {record.items.length} materials used • {new Date(record.date).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold text-purple-600`}>
                    LKR {record.totalCost.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-3xl ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Inventory Reports
              </h1>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Comprehensive inventory analytics and insights
              </p>
            </div>
          </div>
          <button
            onClick={() => exportReport('summary')}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Export Summary
          </button>
        </div>

        {/* Filters */}
        <div className={`rounded-xl p-4 mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="last3Months">Last 3 Months</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </>
            )}
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="flex gap-3 mb-6 border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'usage', name: 'Material Usage', icon: Package },
            { id: 'cost', name: 'Cost Analysis', icon: DollarSign },
            { id: 'trends', name: 'Trends', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap font-medium ${
                reportType === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Report Content */}
        <div className="transition-all duration-300">
          {reportType === 'usage' && renderUsageReport()}
          {reportType === 'cost' && renderCostAnalysis()}
          {reportType === 'trends' && renderTrendsAnalysis()}
        </div>
      </div>
    </div>
  );
}
