import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  List,
  Calendar,
  User as UserIcon,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Building2,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import InventoryReviewModal from './InventoryReviewModal';

const PENDING_SUBMISSIONS = [
  {
    id: '#SUB-94285',
    staffName: 'Sarah Connor',
    avatar: 'SC',
    client: 'ABC Corporation',
    serviceType: 'House Deep Cleaning',
    date: 'Feb 12, 2026',
    time: '2:30 PM',
    materialsCount: 8,
    hasLowStock: true,
    notes: 'Used extra degreaser for kitchen area which had heavy grease buildup',
    materials: [
      { name: 'All-Purpose Cleaner', requested: '1 liter', stock: '15 liters', status: 'ok' },
      { name: 'Heavy Degreaser', requested: '500ml', stock: '8 liters', status: 'ok' },
      { name: 'Microfiber Cloths', requested: '5 pieces', stock: '50 pieces', status: 'ok' },
      { name: 'Gloves', requested: '2 pairs', stock: '3 pairs', status: 'warning' },
      { name: 'Scrub Brushes', requested: '2 pieces', stock: '20 pieces', status: 'ok' },
      { name: 'Steam Cleaner', requested: '1 piece', stock: '5 pieces', status: 'ok' }
    ]
  },
  {
    id: '#SUB-94286',
    staffName: 'James Bond',
    avatar: 'JB',
    client: 'Skyfall Estates',
    serviceType: 'General Cleaning',
    date: 'Feb 12, 2026',
    time: '4:15 PM',
    materialsCount: 5,
    hasLowStock: false,
    notes: 'Standard cleaning completed as requested.',
    materials: [
      { name: 'Glass Cleaner', requested: '500ml', stock: '12 liters', status: 'ok' },
      { name: 'Floor Cleaner', requested: '1 liter', stock: '20 liters', status: 'ok' },
      { name: 'Garbage Bags', requested: '10 pieces', stock: '200 pieces', status: 'ok' }
    ]
  },
  {
    id: '#SUB-94287',
    staffName: 'Ellen Ripley',
    avatar: 'ER',
    client: 'Nostromo Logistics',
    serviceType: 'Commercial Cleaning',
    date: 'Feb 11, 2026',
    time: '9:00 AM',
    materialsCount: 12,
    hasLowStock: false,
    notes: 'Warehouse floor area was larger than estimated.',
    materials: [
      { name: 'Disinfectant', requested: '5 liters', stock: '40 liters', status: 'ok' },
      { name: 'Floor Scrubber Pad', requested: '2 units', stock: '15 units', status: 'ok' }
    ]
  },
  {
    id: '#SUB-94288',
    staffName: 'Luke Skywalker',
    avatar: 'LS',
    client: 'Tatooine Villas',
    serviceType: 'Sofa Cleaning',
    date: 'Feb 11, 2026',
    time: '11:30 AM',
    materialsCount: 4,
    hasLowStock: true,
    notes: 'Deep stains removed successfully.',
    materials: [
      { name: 'Stain Remover', requested: '300ml', stock: '500ml', status: 'warning' },
      { name: 'Fabric Shampoo', requested: '1 liter', stock: '10 liters', status: 'ok' }
    ]
  },
  {
    id: '#SUB-94289',
    staffName: 'Bruce Wayne',
    avatar: 'BW',
    client: 'Wayne Manor',
    serviceType: 'Carpet Cleaning',
    date: 'Feb 10, 2026',
    time: '3:45 PM',
    materialsCount: 6,
    hasLowStock: false,
    notes: 'Main hallway carpets treated.',
    materials: [
      { name: 'Carpet Shampoo', requested: '2 liters', stock: '25 liters', status: 'ok' }
    ]
  },
  {
    id: '#SUB-94290',
    staffName: 'Diana Prince',
    avatar: 'DP',
    client: 'Themyscira Museum',
    serviceType: 'Window Cleaning',
    date: 'Feb 10, 2026',
    time: '10:00 AM',
    materialsCount: 3,
    hasLowStock: false,
    notes: 'High reach equipment used.',
    materials: [
      { name: 'Squeegee Blades', requested: '2 units', stock: '5 units', status: 'ok' }
    ]
  }
];

export default function PendingApprovalsList() {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleReview = (submission: any) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Pending Approvals</h2>
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 rounded-full px-4 py-1.5 font-bold border-none text-sm">
              12 pending
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <Input 
                placeholder="Search by ID, staff or client..." 
                className="pl-12 h-12 bg-white border-slate-200 rounded-2xl focus:ring-purple-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px] h-12 border-slate-200 rounded-2xl bg-white font-bold">
                  <SelectValue placeholder="Staff" />
                </SelectTrigger>
                <SelectContent rounded-2xl>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="sarah">Sarah Connor</SelectItem>
                  <SelectItem value="james">James Bond</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px] h-12 border-slate-200 rounded-2xl bg-white font-bold">
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent rounded-2xl>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="deep">Deep Cleaning</SelectItem>
                  <SelectItem value="general">General Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {PENDING_SUBMISSIONS.map((submission, idx) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all bg-white rounded-[24px] overflow-hidden group border-l-4 border-l-transparent hover:border-l-purple-600">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Left Side: Avatar & Core Info */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:w-28 shrink-0">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-slate-50 shadow-sm ring-1 ring-slate-100">
                      <AvatarFallback className="bg-purple-600 text-white font-extrabold text-xl">{submission.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="sm:text-center sm:w-full">
                      <p className="font-extrabold text-slate-800 leading-tight">{submission.staffName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Field Staff</p>
                    </div>
                  </div>

                  {/* Center: Service Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                          {submission.id}
                        </span>
                        <Badge variant="outline" className="border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                          {submission.serviceType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        {submission.date}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold">{submission.client}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold">{submission.materialsCount} Materials Used</span>
                      </div>
                    </div>

                    {submission.hasLowStock && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100 w-fit">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700">Low stock materials detected</span>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Action */}
                  <div className="flex items-center sm:items-end justify-center">
                    <Button 
                      onClick={() => handleReview(submission)}
                      className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2 group"
                    >
                      Review
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <p className="text-sm font-bold text-slate-400">Showing 1-6 of 12 submissions</p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl border-slate-200 text-slate-400 hover:text-slate-600" disabled>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 bg-white shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <InventoryReviewModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          submission={selectedSubmission}
        />
      )}
    </div>
  );
}
