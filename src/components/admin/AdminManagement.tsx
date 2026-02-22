import { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  MoreVertical, 
  X, 
  Trash2, 
  Edit2,
  Lock,
  Mail,
  User,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Operations Manager' | 'Customer Support';
  status: 'Active' | 'Inactive';
  lastActive: string;
}

const INITIAL_ADMINS: AdminUser[] = [
  { id: '1', name: 'John Admin', email: 'admin@cloudlaundry.lk', role: 'Admin', status: 'Active', lastActive: '2026-02-12' },
  { id: '2', name: 'Sarah Manager', email: 'ops@cloudlaundry.lk', role: 'Operations Manager', status: 'Active', lastActive: '2026-02-11' },
  { id: '3', name: 'Mike Support', email: 'support@cloudlaundry.lk', role: 'Customer Support', status: 'Inactive', lastActive: '2026-02-10' },
];

export function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin' as 'Admin' | 'Operations Manager' | 'Customer Support',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (admin: AdminUser | null = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name,
        email: admin.email,
        password: '',
        role: admin.role,
        status: admin.status
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Admin',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingAdmin) {
      setAdmins(admins.map(a => a.id === editingAdmin.id ? {
        ...a,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      } : a));
    } else {
      const newAdmin: AdminUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        lastActive: new Date().toISOString().split('T')[0]
      };
      setAdmins([...admins, newAdmin]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this admin?')) {
      setAdmins(admins.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-8 max-w-5xl transition-opacity duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Users</h1>
            <p className="text-gray-500 font-medium">Manage system administrators and their permissions</p>
          </div>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-purple-100 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input 
          placeholder="Search Admin..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-purple-500 bg-white"
        />
      </div>

      {/* Admin Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">Admin Details</th>
              <th className="px-8 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">Role</th>
              <th className="px-8 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">Status</th>
              <th className="px-8 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">Last Active</th>
              <th className="px-8 py-5 text-xs font-black uppercase text-gray-500 tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block">{admin.name}</span>
                      <span className="text-sm text-gray-500">{admin.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    admin.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 
                    admin.role === 'Operations Manager' ? 'bg-blue-100 text-blue-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {admin.role}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${admin.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-sm font-bold ${admin.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                      {admin.status}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-medium text-gray-500">{admin.lastActive}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenModal(admin)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(admin.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAdmins.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-bold">No admins found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-purple-600">
              <h2 className="text-2xl font-bold text-white">
                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter full name"
                      className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      type="email"
                      placeholder="admin@cloudlaundry.lk"
                      className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      type="password"
                      placeholder="••••••••"
                      className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-bold text-gray-700">Role</Label>
                  <RadioGroup 
                    value={formData.role} 
                    onValueChange={(val: 'Admin' | 'Operations Manager' | 'Customer Support') => setFormData({...formData, role: val})}
                    className="grid grid-cols-1 gap-3"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-purple-50 transition-colors">
                      <RadioGroupItem value="Admin" id="admin-role" />
                      <div className="flex-1 cursor-pointer">
                        <Label htmlFor="admin-role" className="font-bold block cursor-pointer">Admin</Label>
                        <span className="text-xs text-gray-500">Full access to all system features and settings.</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-purple-50 transition-colors">
                      <RadioGroupItem value="Operations Manager" id="ops-role" />
                      <div className="flex-1 cursor-pointer">
                        <Label htmlFor="ops-role" className="font-bold block cursor-pointer">Operations Manager</Label>
                        <span className="text-xs text-gray-500">Access to Overview, Staff Management, and GPS Tracking.</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-purple-50 transition-colors">
                      <RadioGroupItem value="Customer Support" id="support-role" />
                      <div className="flex-1 cursor-pointer">
                        <Label htmlFor="support-role" className="font-bold block cursor-pointer">Customer Support</Label>
                        <span className="text-xs text-gray-500">Access to Overview, Reviews, and Complaints.</span>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <Label className="text-sm font-bold text-gray-700">Account Status</Label>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroup 
                        value={formData.status} 
                        onValueChange={(val: 'Active' | 'Inactive') => setFormData({...formData, status: val})}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Active" id="status-active" />
                          <Label htmlFor="status-active" className="font-bold cursor-pointer text-green-600">Active</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Inactive" id="status-inactive" />
                          <Label htmlFor="status-inactive" className="font-bold cursor-pointer text-gray-500">Inactive</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex items-center gap-3 border-t border-gray-100">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-12 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="flex-1 h-12 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white"
              >
                {editingAdmin ? 'Save Changes' : 'Save Admin'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}