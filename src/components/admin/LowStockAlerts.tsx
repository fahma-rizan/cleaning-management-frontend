import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShoppingCart, 
  CheckCircle2, 
  Download, 
  ArrowRight,
  Package,
  MoreVertical,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

const LOW_STOCK_DATA = [
  { id: 1, name: 'Disposable Gloves (M)', category: 'Protective Gear', current: 2, min: 10, unit: 'Boxes', severity: 'Critical' },
  { id: 2, name: 'Heavy Degreaser', category: 'Cleaning Agents', current: 4, min: 12, unit: 'Liters', severity: 'Low' },
  { id: 3, name: 'Disposable Face Masks', category: 'Protective Gear', current: 0, min: 10, unit: 'Boxes', severity: 'Critical' },
  { id: 4, name: 'Toilet Bowl Cleaner', category: 'Cleaning Agents', current: 3, min: 10, unit: 'Liters', severity: 'Low' },
  { id: 5, name: 'Industrial Vacuum Bag', category: 'Equipment', current: 2, min: 8, unit: 'Packs', severity: 'Critical' },
  { id: 6, name: 'Hand Sanitizer Gel', category: 'Cleaning Agents', current: 15, min: 20, unit: 'Liters', severity: 'Low' },
  { id: 7, name: 'Floor Scrubbing Pads', category: 'Equipment', current: 12, min: 15, unit: 'Units', severity: 'Low' },
  { id: 8, name: 'Microfiber Cloths (Yellow)', category: 'Cleaning Agents', current: 8, min: 15, unit: 'Units', severity: 'Low' },
];

export default function LowStockAlerts() {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Critical' | 'Low'>('All');

  const filteredAlerts = LOW_STOCK_DATA.filter(alert => 
    activeFilter === 'All' ? true : alert.severity === activeFilter
  );

  const criticalCount = LOW_STOCK_DATA.filter(a => a.severity === 'Critical').length;
  const lowCount = LOW_STOCK_DATA.filter(a => a.severity === 'Low').length;

  return (
    <div className="space-y-8 pb-10">
      {/* Alert Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-100 p-6 rounded-[24px] flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900">Immediate Action Required</h3>
            <p className="text-sm font-medium text-red-700 opacity-80">You have 8 items with low stock that need attention. {criticalCount} are critical.</p>
          </div>
        </div>
        <Badge className="bg-red-600 text-white border-none font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px]">High Severity</Badge>
      </motion.div>

      {/* Filter Tabs & Bulk Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveFilter('All')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeFilter === 'All' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All Alerts ({LOW_STOCK_DATA.length})
          </button>
          <button 
            onClick={() => setActiveFilter('Critical')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeFilter === 'Critical' ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'text-slate-500 hover:text-red-500'}`}
          >
            Critical ({criticalCount})
          </button>
          <button 
            onClick={() => setActiveFilter('Low')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeFilter === 'Low' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'text-slate-500 hover:text-amber-500'}`}
          >
            Low ({lowCount})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-200 text-slate-600 font-bold h-12 px-6 rounded-2xl flex items-center gap-2 bg-white">
            <CheckCircle2 className="w-4 h-4" />
            Mark All Reviewed
          </Button>
          <Button variant="outline" className="border-slate-200 text-slate-600 font-bold h-12 px-6 rounded-2xl flex items-center gap-2 bg-white">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((alert, idx) => {
            const isCritical = alert.severity === 'Critical';
            const deficit = alert.current - alert.min;
            
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgb(0,0,0,0.06)] transition-all bg-white rounded-[24px] overflow-hidden group border-l-4 ${isCritical ? 'border-l-red-500' : 'border-l-amber-500'}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                      {/* Left: Info */}
                      <div className="flex items-center gap-6 flex-1 w-full">
                        <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${isCritical ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                          <AlertCircle className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-slate-900 leading-tight">{alert.name}</h4>
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{alert.category}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-200 mx-1" />
                            <Badge className={`${isCritical ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'} border-none font-black text-[10px] rounded-md`}>
                              {alert.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Stock Stats */}
                      <div className="grid grid-cols-3 gap-8 px-8 border-x border-slate-50 flex-1 w-full">
                        <div className="text-center sm:text-left">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Stock</p>
                          <p className={`text-2xl font-black ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                            {alert.current} <span className="text-xs font-bold opacity-50">{alert.unit}</span>
                          </p>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Min. Threshold</p>
                          <p className="text-2xl font-black text-slate-400">
                            {alert.min} <span className="text-xs font-bold opacity-50">{alert.unit}</span>
                          </p>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deficit</p>
                          <p className="text-2xl font-black text-red-600">
                            {deficit} <span className="text-xs font-bold opacity-50">{alert.unit}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row lg:flex-col items-center justify-end gap-3 shrink-0 w-full lg:w-auto">
                        <Button className="flex-1 lg:flex-none bg-[#2563EB] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 group whitespace-nowrap">
                          <ShoppingCart className="w-4 h-4" />
                          Restock Now
                        </Button>
                        <div className="flex items-center gap-4 px-2">
                          <button className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap">Dismiss Alert</button>
                          <button className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 group whitespace-nowrap">
                            View Details 
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
