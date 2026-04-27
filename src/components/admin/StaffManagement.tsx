import { useState, useRef } from 'react';
import { 
  Search, 
  MoreHorizontal, 
  Star, 
  Phone,
  Upload,
  X,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from "sonner@2.0.3"

interface StaffMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  services: string[];
  rating: number;
  jobs: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  phone: string;
}

const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Maria Garcia',
    role: 'Senior Cleaner',
    initials: 'MG',
    services: ['Deep Cleaning', 'Regular'],
    rating: 4.8,
    jobs: 156,
    status: 'Active',
    phone: '+1 555-0101'
  },
  {
    id: '2',
    name: 'John Smith',
    role: 'Cleaner',
    initials: 'JS',
    services: ['Laundry', 'Regular'],
    rating: 4.5,
    jobs: 89,
    status: 'Active',
    phone: '+1 555-0102'
  },
  {
    id: '3',
    name: 'Lisa Wang',
    role: 'Team Lead',
    initials: 'LW',
    services: ['Deep Cleaning', 'Sofa'],
    rating: 4.9,
    jobs: 234,
    status: 'Active',
    phone: '+1 555-0103'
  }
];

export function StaffManagement() {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nic: '',
    address: '',
    specifications: [] as string[],
    status: 'Active' as 'Active' | 'Inactive',
    photo: null as File | null
  });

  const specificationsList = [
    'Home Cleaning',
    'Laundry Service',
    'Sofa/Mattress Cleaning',
    'Curtain Cleaning'
  ];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
    }
  };

  const toggleSpecification = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.includes(spec)
        ? prev.specifications.filter(s => s !== spec)
        : [...prev.specifications, spec]
    }));
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.photo || !formData.fullName || !formData.email || !formData.phone || !formData.nic) {
      toast.error("Please fill all compulsory fields and upload a photo");
      return;
    }

    // Success logic
    toast.success("Save staff successfully", {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      className: "bg-white border-green-100",
    });

    // Reset form and "redirect" (stay on add interface as requested)
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      nic: '',
      address: '',
      specifications: [],
      status: 'Active',
      photo: null
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredStaff = mockStaff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === 'add') {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Add New Staff Member</h2>
          <button onClick={() => setView('list')} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSaveStaff} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-sm">
              {formData.photo ? (
                <img 
                  src={URL.createObjectURL(formData.photo)} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="w-8 h-8 text-purple-600" />
              )}
            </div>
            <Button 
              type="button" 
              onClick={handleUploadClick}
              className="bg-white hover:bg-gray-50 text-purple-600 border border-purple-200 font-semibold px-6"
            >
              Click to upload photo
            </Button>
            <p className="text-xs text-gray-400 mt-2">* Compulsory</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Full Name *</label>
              <Input 
                required
                placeholder="Enter full name"
                className="h-12 rounded-xl"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email Address *</label>
              <Input 
                required
                type="email"
                placeholder="Enter email address"
                className="h-12 rounded-xl"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
              <Input 
                required
                placeholder="Enter phone number"
                className="h-12 rounded-xl"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">NIC Number *</label>
              <Input 
                required
                placeholder="Enter NIC number"
                className="h-12 rounded-xl"
                value={formData.nic}
                onChange={(e) => setFormData({...formData, nic: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Address (Optional)</label>
            <Input 
              placeholder="Enter home address"
              className="h-12 rounded-xl"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 block">Specification (Select one or more)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specificationsList.map((spec) => (
                <label 
                  key={spec}
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer group"
                >
                  <input 
                    type="checkbox"
                    checked={formData.specifications.includes(spec)}
                    onChange={() => toggleSpecification(spec)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">{spec}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-sm font-semibold text-gray-700 block">Status</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio"
                  name="status"
                  value="Active"
                  checked={formData.status === 'Active'}
                  onChange={() => setFormData({...formData, status: 'Active'})}
                  className="w-5 h-5 border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={formData.status === 'Inactive'}
                  onChange={() => setFormData({...formData, status: 'Inactive'})}
                  className="w-5 h-5 border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium text-gray-700">Inactive</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setView('list')}
              className="flex-1 h-14 rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 h-14 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg shadow-lg shadow-purple-200"
            >
              Save Staff Member
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-1">Manage your cleaning staff and assignments</p>
        </div>
        <Button 
          onClick={() => setView('add')}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-12 h-16 flex items-center justify-center font-bold text-xl shadow-xl shadow-purple-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Add Staff
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input 
          placeholder="Search staff..." 
          className="pl-11 h-12 border-gray-200 rounded-xl bg-white shadow-sm focus-visible:ring-purple-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <div key={staff.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl overflow-hidden">
                  {staff.initials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{staff.name}</h3>
                  <p className="text-gray-500 text-sm">{staff.role}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {staff.services.map((service, idx) => (
                <span 
                  key={idx} 
                  className="px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-sm font-medium"
                >
                  {service}
                </span>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-5 mt-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-800 text-sm">{staff.rating}</span>
                  </div>
                  <span className="text-gray-500 text-sm">{staff.jobs} jobs</span>
                </div>
                <Badge className={`
                  ${staff.status === 'Active' ? 'bg-green-50 text-green-600 border-none px-3 py-1' : ''}
                  ${staff.status === 'On Leave' ? 'bg-orange-50 text-orange-600 border-none px-3 py-1' : ''}
                  ${staff.status === 'Inactive' ? 'bg-gray-50 text-gray-600 border-none px-3 py-1' : ''}
                  rounded-full font-semibold text-sm shadow-none
                `}>
                  {staff.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                <Phone className="w-4 h-4" />
                {staff.phone}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
