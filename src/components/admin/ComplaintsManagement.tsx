import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare,
  MoreVertical
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Complaint {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  customerName: string;
  assignedStaff: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  notes?: number;
}

const mockComplaints: Complaint[] = [
  {
    id: 'C-1042',
    title: 'Missed cleaning spots',
    priority: 'High',
    description: 'Several areas under furniture were not cleaned during the regular cleaning session.',
    customerName: 'Emily Davis',
    assignedStaff: 'Maria Garcia',
    date: 'Feb 10, 2026',
    status: 'Pending'
  },
  {
    id: 'C-1041',
    title: 'Late arrival of staff',
    priority: 'Medium',
    description: 'Cleaner arrived 45 minutes late without prior notice. Had to reschedule my afternoon.',
    customerName: 'Robert Brown',
    assignedStaff: 'Lisa Wang',
    date: 'Feb 9, 2026',
    status: 'In Progress',
    notes: 2
  },
  {
    id: 'C-1040',
    title: 'Damaged item during cleaning',
    priority: 'High',
    description: 'A decorative vase was knocked over and broken during the deep cleaning session.',
    customerName: 'Anna Lee',
    assignedStaff: 'John Smith',
    date: 'Feb 8, 2026',
    status: 'In Progress',
    notes: 3
  }
];

export function ComplaintsManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900">Complaint Management</h1>
        <p className="text-gray-500 font-medium">Track and resolve customer complaints efficiently</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center">
            <Clock className="w-7 h-7 text-orange-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">8</div>
            <div className="text-gray-500 font-medium">Pending</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
            <ArrowRight className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">5</div>
            <div className="text-gray-500 font-medium">In Progress</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-green-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">42</div>
            <div className="text-gray-500 font-medium">Resolved</div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Search complaints..." 
            className="pl-12 h-14 bg-white border-gray-200 rounded-xl focus-visible:ring-purple-600 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 px-8 border-gray-200 rounded-xl flex items-center gap-2 font-bold text-lg bg-white">
          <Filter className="w-5 h-5" />
          Filter
        </Button>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {mockComplaints.map((complaint) => (
          <div key={complaint.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-purple-100 transition-colors group relative">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-gray-400 font-medium">{complaint.id}</span>
                  <h3 className="text-xl font-bold text-gray-900">{complaint.title}</h3>
                  <Badge className={`
                    ${complaint.priority === 'High' ? 'bg-red-50 text-red-500 hover:bg-red-50' : ''}
                    ${complaint.priority === 'Medium' ? 'bg-orange-50 text-orange-500 hover:bg-orange-50' : ''}
                    ${complaint.priority === 'Low' ? 'bg-blue-50 text-blue-500 hover:bg-blue-50' : ''}
                    rounded-lg px-3 py-1 font-bold text-xs border-none shadow-none
                  `}>
                    {complaint.priority}
                  </Badge>
                </div>
                
                <p className="text-gray-600 leading-relaxed text-lg max-w-4xl">
                  {complaint.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500 font-medium text-sm pt-2">
                  <span>By {complaint.customerName}</span>
                  <span>Assigned: {complaint.assignedStaff}</span>
                  <span>{complaint.date}</span>
                  {complaint.notes && (
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>{complaint.notes} notes</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <Badge className={`
                  ${complaint.status === 'Pending' ? 'bg-orange-50 text-orange-500 hover:bg-orange-50' : ''}
                  ${complaint.status === 'In Progress' ? 'bg-blue-50 text-blue-600 hover:bg-blue-50' : ''}
                  ${complaint.status === 'Resolved' ? 'bg-green-50 text-green-600 hover:bg-green-50' : ''}
                  rounded-full px-5 py-2.5 font-bold text-base flex items-center gap-2 border-none shadow-none min-w-[140px] justify-center
                `}>
                  {complaint.status === 'Pending' && <Clock className="w-5 h-5" />}
                  {complaint.status === 'In Progress' && <ArrowRight className="w-5 h-5" />}
                  {complaint.status === 'Resolved' && <CheckCircle2 className="w-5 h-5" />}
                  {complaint.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}