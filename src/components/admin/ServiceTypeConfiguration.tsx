import React, { useState } from 'react';
import { 
  GripVertical, 
  Edit2, 
  Trash2, 
  Plus, 
  Search, 
  Info,
  Droplets,
  Layers,
  ShieldCheck,
  Package,
  X,
  Check
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Badge } from '../ui/badge';

const SERVICE_TYPES = [
  { id: 'home', label: 'Home Cleaning' },
  { id: 'deep', label: 'Deep Cleaning' },
  { id: 'office', label: 'Office Cleaning' },
  { id: 'carpet', label: 'Carpet Cleaning' },
  { id: 'window', label: 'Window Cleaning' },
];

const INITIAL_MATERIALS = [
  { id: '1', name: 'All-Purpose Cleaner', qty: 1, unit: 'liter', required: true, icon: <Droplets className="w-4 h-4" /> },
  { id: '2', name: 'Heavy-Duty Degreaser', qty: 500, unit: 'ml', required: true, icon: <Droplets className="w-4 h-4" /> },
  { id: '3', name: 'Scrub Brushes', qty: 2, unit: 'pieces', required: true, icon: <Layers className="w-4 h-4" /> },
  { id: '4', name: 'Microfiber Cloths', qty: 5, unit: 'pieces', required: true, icon: <Layers className="w-4 h-4" /> },
  { id: '5', name: 'Mop', qty: 1, unit: 'piece', required: true, icon: <Layers className="w-4 h-4" /> },
  { id: '6', name: 'Bucket', qty: 1, unit: 'piece', required: true, icon: <Layers className="w-4 h-4" /> },
  { id: '7', name: 'Gloves', qty: 2, unit: 'pairs', required: true, icon: <ShieldCheck className="w-4 h-4" /> },
  { id: '8', name: 'Disinfectant Spray', qty: 500, unit: 'ml', required: false, icon: <Droplets className="w-4 h-4" /> },
  { id: '9', name: 'Steam Cleaner', qty: 1, unit: 'piece', required: true, icon: <Layers className="w-4 h-4" /> },
  { id: '10', name: 'Vacuum Cleaner', qty: 1, unit: 'piece', required: true, icon: <Layers className="w-4 h-4" /> },
];

const AVAILABLE_MATERIALS = [
  { id: 'm1', name: 'Glass Cleaner', icon: <Droplets className="w-4 h-4 text-blue-500" /> },
  { id: 'm2', name: 'Toilet Cleaner', icon: <Droplets className="w-4 h-4 text-blue-500" /> },
  { id: 'm3', name: 'Paper Towels', icon: <Layers className="w-4 h-4 text-blue-500" /> },
  { id: 'm4', name: 'Floor Wax', icon: <Droplets className="w-4 h-4 text-blue-500" /> },
  { id: 'm5', name: 'Bio-hazard Bags', icon: <Package className="w-4 h-4 text-blue-500" /> },
];

export default function ServiceTypeConfiguration() {
  const [activeTab, setActiveTab] = useState('deep');
  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  const activeServiceLabel = SERVICE_TYPES.find(s => s.id === activeTab)?.label || '';

  return (
    <div className="space-y-8 pb-10">
      {/* Tabs */}
      <div className="bg-white p-2 rounded-[24px] shadow-sm border border-slate-100 flex flex-wrap gap-2">
        {SERVICE_TYPES.map((service) => (
          <button
            key={service.id}
            onClick={() => setActiveTab(service.id)}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeTab === service.id 
                ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            {service.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">Materials for {activeServiceLabel}</h3>
            <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">Default configuration for technicians</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Material
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="w-12 px-6 py-5"></th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Material Name</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Default Qty</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Unit</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Required</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <Reorder.Group 
              axis="y" 
              values={materials} 
              onReorder={setMaterials} 
              as="tbody" 
              className="divide-y divide-slate-50"
            >
              <AnimatePresence>
                {materials.map((item) => (
                  <Reorder.Item 
                    key={item.id} 
                    value={item} 
                    as="tr"
                    className="hover:bg-slate-50/50 transition-colors group cursor-default"
                  >
                    <td className="px-6 py-5">
                      <GripVertical className="w-5 h-5 text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-[#2563EB]">
                          {item.icon}
                        </div>
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-slate-600">{item.qty}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-3 py-1 rounded-lg">
                        {item.unit}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          item.required 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'border-slate-200 bg-white'
                        }`}>
                          {item.required && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-all">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </table>
        </div>
      </div>

      {/* Add Material Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[500px] rounded-[32px] p-0 overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          <DialogHeader className="p-8 pb-0 flex flex-row items-center justify-between border-b-0">
            <DialogTitle className="text-2xl font-black text-slate-900 leading-tight">
              Add Material to {activeServiceLabel}
            </DialogTitle>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Material</label>
              <Select onValueChange={setSelectedMaterial}>
                <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-[#2563EB]/20 text-slate-700 font-bold">
                  <SelectValue placeholder="Choose a material..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  <div className="px-3 py-2 border-b border-slate-50">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input 
                        placeholder="Search materials..." 
                        className="pl-9 h-9 bg-white border-slate-200 rounded-xl text-xs" 
                      />
                    </div>
                  </div>
                  {AVAILABLE_MATERIALS.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="rounded-xl py-2 font-bold cursor-pointer">
                      <div className="flex items-center gap-3">
                        {m.icon}
                        {m.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Default Qty</label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="h-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-[#2563EB]/20 text-slate-700 font-black"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unit</label>
                <Select defaultValue="ml">
                  <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-[#2563EB]/20 text-slate-700 font-bold">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    <SelectItem value="ml" className="rounded-xl font-bold">ml</SelectItem>
                    <SelectItem value="liter" className="rounded-xl font-bold">Liters</SelectItem>
                    <SelectItem value="piece" className="rounded-xl font-bold">Pieces</SelectItem>
                    <SelectItem value="pair" className="rounded-xl font-bold">Pairs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/30">
              <div className="flex items-center space-x-2">
                <Checkbox id="required" className="w-5 h-5 rounded-md border-blue-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                <label htmlFor="required" className="text-sm font-bold text-slate-700 cursor-pointer">
                  Mark as required for this service
                </label>
              </div>
              <Info className="w-4 h-4 text-blue-400 ml-auto cursor-help" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notes (Optional)</label>
              <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#2563EB]/20 outline-none text-sm font-semibold text-slate-600 min-h-[100px] resize-none"
                placeholder="Specific instructions for this material..."
              />
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
              disabled={!selectedMaterial}
              className="flex-1 h-12 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
            >
              Add Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
