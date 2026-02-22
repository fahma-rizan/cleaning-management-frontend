import React from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare,
  FileText,
  BadgeInfo,
  Building2,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: {
    id: string;
    staffName: string;
    avatar: string;
    client: string;
    serviceType: string;
    date: string;
    time: string;
    notes: string;
    materials: Array<{
      name: string;
      requested: string;
      stock: string;
      status: 'ok' | 'warning';
    }>;
  };
}

export default function InventoryReviewModal({ isOpen, onClose, submission }: ReviewModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Review Inventory Usage</h2>
                <p className="text-sm text-slate-500 font-medium">Approval for Service {submission.id}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Service Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 grid grid-cols-2 gap-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service ID</p>
                  <p className="font-mono font-bold text-purple-600">{submission.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Type</p>
                  <Badge className="bg-white border-slate-200 text-slate-700 hover:bg-white font-bold">{submission.serviceType}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Staff Member</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-purple-600 text-[10px] text-white font-bold">{submission.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-bold text-slate-700">{submission.staffName}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client</p>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{submission.client}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-600 p-6 rounded-3xl text-white shadow-lg shadow-purple-200 flex flex-col justify-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Submitted Date</p>
                    <p className="font-bold">{submission.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Submitted Time</p>
                    <p className="font-bold">{submission.time}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Materials Table */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-800">Materials Used</h3>
              </div>
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Material Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Requested Qty</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Current Stock</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {submission.materials.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{item.requested}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{item.stock}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            {item.status === 'ok' ? (
                              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 font-bold flex items-center gap-1.5 rounded-lg px-3 py-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> OK
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-50 font-bold flex items-center gap-1.5 rounded-lg px-3 py-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Staff Notes</h4>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed italic">
                  "{submission.notes}"
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BadgeInfo className="w-4 h-4 text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Admin Review Notes</h4>
                </div>
                <Textarea 
                  placeholder="Add notes for staff if needed..." 
                  className="rounded-2xl border-slate-200 min-h-[100px] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-end gap-4 sticky bottom-0 z-10">
            <Button variant="ghost" className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 font-bold px-8">Reject</Button>
            <Button variant="outline" className="w-full sm:w-auto border-amber-200 text-amber-600 hover:bg-amber-50 font-bold px-8">Request Changes</Button>
            <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-12 shadow-lg shadow-emerald-100">Approve Submission</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
