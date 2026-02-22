import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit2, 
  History as HistoryIcon,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  ShieldCheck,
  Droplets,
  MoreVertical,
  ArrowUpDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';

const OVERVIEW_STATS = [
  { label: 'Total Items', value: '156', icon: Package, color: 'bg-blue-500', textColor: 'text-blue-600' },
  { label: 'Normal Stock', value: '138', icon: CheckCircle2, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
  { label: 'Low Stock', value: '15', icon: AlertCircle, color: 'bg-amber-500', textColor: 'text-amber-600' },
  { label: 'Out of Stock', value: '3', icon: AlertCircle, color: 'bg-red-500', textColor: 'text-red-600' },
];

const STOCK_DATA = [
  { id: 1, name: 'All-Purpose Cleaner', category: 'Cleaning Agents', qty: 15, unit: 'Liters', threshold: 10, status: 'Normal', lastUpdated: 'Feb 10, 2026' },
  { id: 2, name: 'Heavy Degreaser', category: 'Cleaning Agents', qty: 4, unit: 'Liters', threshold: 12, status: 'Low', lastUpdated: 'Feb 11, 2026' },
  { id: 3, name: 'Microfiber Cloths (Blue)', category: 'Cleaning Agents', qty: 45, unit: 'Pieces', threshold: 20, status: 'Normal', lastUpdated: 'Feb 12, 2026' },
  { id: 4, name: 'Nitrile Gloves (M)', category: 'Protective Gear', qty: 2, unit: 'Boxes', threshold: 5, status: 'Critical', lastUpdated: 'Feb 11, 2026' },
  { id: 5, name: 'Steam Cleaner Pro', category: 'Equipment', qty: 8, unit: 'Units', threshold: 2, status: 'Normal', lastUpdated: 'Feb 08, 2026' },
  { id: 6, name: 'Floor Scrubbing Pads', category: 'Equipment', qty: 12, unit: 'Units', threshold: 15, status: 'Low', lastUpdated: 'Feb 12, 2026' },
  { id: 7, name: 'Glass Cleaner Spray', category: 'Cleaning Agents', qty: 25, unit: 'Liters', threshold: 15, status: 'Normal', lastUpdated: 'Feb 10, 2026' },
  { id: 8, name: 'Disposable Face Masks', category: 'Protective Gear', qty: 0, unit: 'Boxes', threshold: 10, status: 'Critical', lastUpdated: 'Feb 11, 2026' },
  { id: 9, name: 'Mop Heads (Cotton)', category: 'Equipment', qty: 18, unit: 'Pieces', threshold: 10, status: 'Normal', lastUpdated: 'Feb 09, 2026' },
  { id: 10, name: 'Toilet Bowl Cleaner', category: 'Cleaning Agents', qty: 3, unit: 'Liters', threshold: 10, status: 'Low', lastUpdated: 'Feb 12, 2026' },
  { id: 11, name: 'Floor Polish Wax', category: 'Cleaning Agents', qty: 5, unit: 'Liters', threshold: 5, status: 'Normal', lastUpdated: 'Feb 07, 2026' },
  { id: 12, name: 'Industrial Vacuum Bag', category: 'Equipment', qty: 2, unit: 'Packs', threshold: 8, status: 'Critical', lastUpdated: 'Feb 11, 2026' },
  { id: 13, name: 'Yellow Warning Signs', category: 'Equipment', qty: 6, unit: 'Pieces', threshold: 4, status: 'Normal', lastUpdated: 'Jan 28, 2026' },
  { id: 14, name: 'Hand Sanitizer Gel', category: 'Cleaning Agents', qty: 15, unit: 'Liters', threshold: 20, status: 'Low', lastUpdated: 'Feb 12, 2026' },
  { id: 15, name: 'Rubber Boots (Size 9)', category: 'Protective Gear', qty: 10, unit: 'Pairs', threshold: 5, status: 'Normal', lastUpdated: 'Feb 05, 2026' },
];

export default function InventoryStockLevels() {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50';
      case 'Low':
        return 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-50';
      case 'Critical':
        return 'bg-red-50 text-red-600 border-red-100 hover:bg-red-50';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getRowStyles = (status: string) => {
    switch (status) {
      case 'Low':
        return 'bg-amber-50/20';
      case 'Critical':
        return 'bg-red-50/20';
      default:
        return 'hover:bg-slate-50/50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cleaning Agents': return <Droplets className="w-4 h-4" />;
      case 'Equipment': return <Layers className="w-4 h-4" />;
      case 'Protective Gear': return <ShieldCheck className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {OVERVIEW_STATS.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-gray-800 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className={`text-2xl font-black ${stat.textColor} dark:text-white`}>{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <Input 
                placeholder="Search materials, equipment..." 
                className="pl-12 h-12 bg-white border-slate-200 rounded-2xl focus:ring-purple-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px] h-12 border-slate-200 rounded-2xl bg-white font-bold">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent rounded-2xl>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="agents">Cleaning Agents</SelectItem>
                  <SelectItem value="equip">Equipment</SelectItem>
                  <SelectItem value="gear">Protective Gear</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px] h-12 border-slate-200 rounded-2xl bg-white font-bold">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent rounded-2xl>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5">
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                    Material Name <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-5">
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                    Category <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-5">
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                    Stock Level <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Min. Threshold</p>
                </th>
                <th className="px-6 py-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                </th>
                <th className="px-6 py-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated</p>
                </th>
                <th className="px-6 py-5 text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</p>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {STOCK_DATA.map((item) => (
                <tr key={item.id} className={`${getRowStyles(item.status)} transition-colors`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        {getCategoryIcon(item.category)}
                      </div>
                      <span className="font-bold text-slate-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-slate-500">{item.category}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-black ${
                        item.status === 'Normal' ? 'text-emerald-600' : 
                        item.status === 'Low' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {item.qty}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{item.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-600">{item.threshold} {item.unit}</span>
                  </td>
                  <td className="px-6 py-5">
                    <Badge className={`${getStatusStyles(item.status)} font-bold border rounded-lg px-3 py-1 shadow-sm`}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-slate-500">{item.lastUpdated}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50">
                        <HistoryIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-400">Showing 1-15 of 156 items</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl border-slate-200 text-slate-400 hover:text-slate-600" disabled>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-1">
              {[1, 2, 3, '...', 11].map((page, idx) => (
                <button 
                  key={idx}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    page === 1 ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 bg-white shadow-sm">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
