import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, AlertCircle, MapPin, Home, Upload, UserCheck, CreditCard, Users } from 'lucide-react';
import type { FormEvent, ChangeEvent } from 'react';
import BackButton from './BackButton';

export default function RegisterStaff() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    nicNo: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [nicPhoto, setNicPhoto] = useState<File | null>(null);
  const [nicPhotoPreview, setNicPhotoPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol (@$!%*?&)');
      return;
    }

    if (!profilePhoto) {
      setError('Please upload Profile Photo');
      return;
    }

    if (!nicPhoto) {
      setError('Please upload NIC Photo');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      localStorage.setItem('pendingUser', JSON.stringify({ 
        ...formData, 
        name: `${formData.firstName} ${formData.lastName}`,
        role: 'staff',
        pendingApproval: true,
        profilePhoto: profilePhotoPreview,
        nicPhoto: nicPhotoPreview,
      }));
      navigate('/otp-verify');
    }, 1000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleNicPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNicPhoto(file);
      setNicPhotoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-8 my-8">
        <BackButton to="/" />
        
        <div className="flex justify-center mb-6">
          <div className="bg-green-500 p-3 rounded-full shadow-lg shadow-green-100">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-center mb-2 dark:text-white tracking-tight">Staff Registration</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8 tracking-wide">Join Cloud Laundry professional cleaning team</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-gray-300 uppercase">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-gray-300 uppercase">Last Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-gray-300 uppercase">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-gray-300 uppercase">Contact Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Identification & Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-gray-300 uppercase">NIC Number *</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="nicNo"
                    value={formData.nicNo}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-gray-300 uppercase">Gender *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-600 outline-none appearance-none font-medium"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Residential Address</h3>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="address"
                placeholder="Street Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                  required
                />
              </div>
              <input
                type="text"
                name="postalCode"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Profile Verification</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 text-center">
                {profilePhotoPreview ? (
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <img src={profilePhotoPreview} alt="Preview" className="w-full h-full object-cover rounded-full border-4 border-green-500 shadow-md" />
                    <button type="button" onClick={() => { setProfilePhoto(null); setProfilePhotoPreview(''); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                      <AlertCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600">
                      <Upload size={32} />
                    </div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Profile Photo</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-tight">JPG, PNG up to 5MB</p>
                  </div>
                )}
                <label className="inline-flex px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-xs cursor-pointer hover:bg-green-700 transition-all shadow-md shadow-green-100 dark:shadow-none">
                  {profilePhotoPreview ? 'Change Photo' : 'Select Photo'}
                  <input type="file" accept="image/*" onChange={handleProfilePhotoChange} className="hidden" />
                </label>
              </div>

              <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 text-center">
                {nicPhotoPreview ? (
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <img src={nicPhotoPreview} alt="NIC Preview" className="w-full h-full object-cover rounded-xl border-4 border-green-500 shadow-md" />
                    <button type="button" onClick={() => { setNicPhoto(null); setNicPhotoPreview(''); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                      <AlertCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600">
                      <CreditCard size={32} />
                    </div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">NIC Photo</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-tight">Clear square photo</p>
                  </div>
                )}
                <label className="inline-flex px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-xs cursor-pointer hover:bg-green-700 transition-all shadow-md shadow-green-100 dark:shadow-none">
                  {nicPhotoPreview ? 'Change NIC' : 'Upload NIC'}
                  <input type="file" accept="image/*" onChange={handleNicPhotoChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Security Credentials</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-gray-300 uppercase">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-gray-300 uppercase">Confirm *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-2xl hover:bg-green-700 transition-all disabled:bg-green-400 mt-6 font-black uppercase tracking-widest shadow-lg shadow-green-100 dark:shadow-none"
          >
            {loading ? 'Submitting Application...' : 'Register as Staff'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-700 pt-6">
          <p className="text-gray-500 text-sm font-medium">
            Already have a staff account?{' '}
            <Link to="/login" className="text-green-600 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
