import { useState, useRef, useEffect } from 'react';
import {
  Search,
  MoreHorizontal,
  Star,
  Phone,
  Upload,
  X,
  CheckCircle2,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { fetchWithAuth } from '../../utils/api';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  specializations: string[];
  jobsCount: number;
  isAvailable: boolean;
}

const specificationsList = [
  'Home Cleaning',
  'Laundry Service',
  'Sofa/Mattress Cleaning',
  'Curtain Cleaning',
];

const initials = (name: string) =>
  name.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2);

export function StaffManagement() {
  const [view, setView]               = useState<'list' | 'add'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [staffList, setStaffList]     = useState<StaffMember[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName:       '',
    email:          '',
    phone:          '',
    nic:            '',
    address:        '',
    specifications: [] as string[],
    status:         'Active' as 'Active' | 'Inactive',
    photo:          null as File | null,
  });

  // ── Load staff from backend ────────────────────────────────────────────────
  const loadStaff = async () => {
    setLoadingList(true);
    try {
      const data = await fetchWithAuth('/staff/all');
      if (data.success) setStaffList(data.staffList || []);
    } catch (err) {
      console.error('Failed to load staff:', err);
    }
    setLoadingList(false);
  };

  useEffect(() => { loadStaff(); }, []);

  // ── Form helpers ───────────────────────────────────────────────────────────
  const toggleSpecification = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.includes(spec)
        ? prev.specifications.filter(s => s !== spec)
        : [...prev.specifications, spec],
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: '', email: '', phone: '', nic: '',
      address: '', specifications: [], status: 'Active', photo: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Save new staff → backend ───────────────────────────────────────────────
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.fullName || !formData.email || !formData.phone || !formData.nic) {
      setFormError('Please fill in all required fields (Name, Email, Phone, NIC).');
      toast.error('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const result = await fetchWithAuth('/staff/create', {
        method: 'POST',
        body: JSON.stringify({
          fullName:       formData.fullName,
          email:          formData.email,
          phone:          formData.phone,
          nic:            formData.nic,
          address:        formData.address,
          specifications: formData.specifications,
          status:         formData.status,
        }),
      });

      if (result.success) {
        toast.success('Staff account created! Temporary password: staff123', { duration: 6000 });
        resetForm();
        setView('list');
        loadStaff();
      } else {
        const msg = result.message || 'Failed to create staff account.';
        setFormError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = 'Cannot connect to server. Please try again.';
      setFormError(msg);
      toast.error(msg);
    }
    setSaving(false);
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = staffList.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ════════════════════════════════════════════════════════════════════════════
  // ADD STAFF FORM VIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (view === 'add') {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Add New Staff Member</h2>
          <button onClick={() => { setView('list'); setFormError(''); setFormSuccess(''); }} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info box */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <strong>Note:</strong> The new staff member will receive a temporary password of <strong>staff123</strong>.
          They will be required to change it on their first login.
        </div>

        {/* Inline error/success feedback */}
        {formError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            ❌ {formError}
          </div>
        )}
        {formSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
            ✅ {formSuccess}
          </div>
        )}

        <form onSubmit={handleSaveStaff} className="space-y-6">
          {/* Photo upload (UI only) */}
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
              className="hidden"
              accept="image/*"
            />
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-sm">
              {formData.photo ? (
                <img src={URL.createObjectURL(formData.photo)} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-8 h-8 text-purple-600" />
              )}
            </div>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white hover:bg-gray-50 text-purple-600 border border-purple-200 font-semibold px-6"
            >
              Click to upload photo
            </Button>
            <p className="text-xs text-gray-400 mt-2">(Optional)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Full Name *</label>
              <Input
                required
                placeholder="Enter full name"
                className="h-12 rounded-xl"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
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
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
              <Input
                required
                placeholder="Enter phone number"
                className="h-12 rounded-xl"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">NIC Number *</label>
              <Input
                required
                placeholder="Enter NIC number"
                className="h-12 rounded-xl"
                value={formData.nic}
                onChange={e => setFormData({ ...formData, nic: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Address (Optional)</label>
            <Input
              placeholder="Enter home address"
              className="h-12 rounded-xl"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 block">Specializations</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specificationsList.map(spec => (
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
              {(['Active', 'Inactive'] as const).map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={formData.status === s}
                    onChange={() => setFormData({ ...formData, status: s })}
                    className="w-5 h-5 border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-medium text-gray-700">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setView('list'); setFormError(''); setFormSuccess(''); }}
              className="flex-1 h-14 rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 h-14 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg shadow-lg shadow-purple-200"
            >
              {saving ? 'Creating...' : 'Save Staff Member'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STAFF LIST VIEW
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-1">Manage your cleaning staff and assignments</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadStaff}
            variant="outline"
            className="h-12 px-4 rounded-xl border-gray-200 text-gray-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setView('add')}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-8 h-12 flex items-center gap-2 font-bold shadow-xl shadow-purple-200"
          >
            <UserPlus className="w-5 h-5" />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search staff by name or email..."
          className="pl-11 h-12 border-gray-200 rounded-xl bg-white shadow-sm focus-visible:ring-purple-600"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {loadingList ? (
        <div className="text-center py-16 text-gray-400">Loading staff...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No staff members yet.</p>
          <p className="text-sm mt-1">Click <strong>Add Staff</strong> to create the first account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(staff => (
            <div
              key={staff._id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl">
                    {initials(staff.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{staff.name}</h3>
                    <p className="text-gray-500 text-xs">{staff.email}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              </div>

              {/* Specializations */}
              <div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
                {(staff.specializations || []).length > 0 ? (
                  staff.specializations.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-medium">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No specializations set</span>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-800 text-sm">4.5</span>
                    </div>
                    <span className="text-gray-500 text-sm">{staff.jobsCount ?? 0} jobs</span>
                  </div>
                  <Badge className={`rounded-full font-semibold text-xs px-3 py-1 border-none shadow-none ${
                    staff.isAvailable
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    {staff.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Phone className="w-4 h-4" />
                  {staff.phone || 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
