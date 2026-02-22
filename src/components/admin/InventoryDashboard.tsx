import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  ArrowUpRight,
  MoreVertical,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

const METRICS = [
  { 
    label: 'Total Items', 
    value: '156', 
    trend: '+4.2%', 
    icon: Package, 
    color: 'bg-blue-500', 
    trendColor: 'text-emerald-500' 
  },
  { 
    label: 'Low Stock Alerts', 
    value: '8', 
    icon: AlertTriangle, 
    color: 'bg-red-500', 
    status: 'critical' 
  },
  { 
    label: 'Pending Approvals', 
    value: '12', 
    icon: Clock, 
    color: 'bg-amber-500' 
  },
];

const PENDING_APPROVALS = [
  { id: '#SUB-94285', staff: 'Sarah Connor', avatar: 'SC', service: 'House Deep Cleaning', date: 'Feb 12, 2026' },
  { id: '#SUB-94286', staff: 'James Bond', avatar: 'JB', service: 'General Cleaning', date: 'Feb 12, 2026' },
  { id: '#SUB-94287', staff: 'Ellen Ripley', avatar: 'ER', service: 'Commercial Cleaning', date: 'Feb 11, 2026' },
  { id: '#SUB-94288', staff: 'Luke Skywalker', avatar: 'LS', service: 'Sofa Cleaning', date: 'Feb 11, 2026' },
  { id: '#SUB-94289', staff: 'Bruce Wayne', avatar: 'BW', service: 'Carpet Cleaning', date: 'Feb 10, 2026' },
];

const LOW_STOCK_ITEMS = [
  { name: 'Disposable Gloves', qty: '5 pairs', threshold: '20 pairs', status: 'Critical', color: 'text-red-600 bg-red-50' },
  { name: 'All-Purpose Cleaner', qty: '2 liters', threshold: '5 liters', status: 'Low', color: 'text-amber-600 bg-amber-50' },
  { name: 'Face Masks', qty: '15 units', threshold: '50 units', status: 'Low', color: 'text-amber-600 bg-amber-50' },
  { name: 'Microfiber Cloths', qty: '8 units', threshold: '15 units', status: 'Low', color: 'text-amber-600 bg-amber-50' },
  { name: 'Degreaser', qty: '1.2 liters', threshold: '3 liters', status: 'Low', color: 'text-amber-600 bg-amber-50' },
];

export default function InventoryDashboard() {
  return (
    <div className="space-y-8 pb-10">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {METRICS.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-none bg-white dark:bg-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30_rgb(0,0,0,0.08)] transition-shadow overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 ${metric.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${metric.color.split('-')[1]}-200 group-hover:scale-110 transition-transform`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                  {metric.trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${metric.trendColor} bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full`}>
                      <ArrowUpRight className="w-3 h-3" />
                      {metric.trend}
                    </div>
                  )}
                  {metric.status === 'critical' && (
                    <Badge className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 font-bold uppercase tracking-widest text-[10px]">Critical</Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{metric.label}</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{metric.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Approvals */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Pending Approvals</CardTitle>
                <p className="text-sm text-slate-400">Review inventory usage reports</p>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 rounded-full px-3 font-bold">12 Reports</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {PENDING_APPROVALS.map((report) => (
                <div key={report.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">{report.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{report.staff}</span>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{report.id}</span>
                      </div>
                      <p className="text-sm text-slate-500">{report.service} • {report.date}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    Review
                  </Button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-50 text-center">
              <Button variant="link" className="text-purple-600 font-bold hover:no-underline flex items-center gap-1 mx-auto">
                View All Pending <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Low Stock Alerts</CardTitle>
                <p className="text-sm text-slate-400">Inventory items needing attention</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400"><MoreVertical className="w-5 h-5" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {LOW_STOCK_ITEMS.map((item) => (
                <div key={item.name} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">Current:</span>
                        <span className="text-xs font-bold text-red-500">{item.qty}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">Min. Threshold:</span>
                        <span className="text-xs font-bold text-slate-600">{item.threshold}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${item.color} border-none font-bold uppercase tracking-widest text-[10px] py-1 px-3 rounded-lg`}>
                    {item.status}
                  </Badge>
                </div>
              ))}\
            </div>
            <div className="p-4 border-t border-slate-50 text-center">
              <Button variant="link" className="text-red-600 font-bold hover:no-underline flex items-center gap-1 mx-auto">
                View All Alerts <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
