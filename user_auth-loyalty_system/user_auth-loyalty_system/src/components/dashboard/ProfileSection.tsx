import { useState } from 'react';
import { User, Camera, Save, Award, X, Plus, Home, Building2, MapPinned, Edit, Trash2, Check } from 'lucide-react';
import type { User as UserType } from '../../types';

interface ProfileSectionProps {
  user: UserType;
}

interface Address {
  id: number;
  type: 'home' | 'office' | 'other';
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  postcode: string;
  phone: string;
  isDefault: boolean;
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  const [profileData, setProfileData] = useState({
    firstName: user.name.split(' ')[0] || '',
    lastName: user.name.split(' ').slice(1).join(' ') || '',
    email: user.email,
    personalPhone: '',
    homePhone: '',
    profilePicture: localStorage.getItem('userProfilePicture') || '',
    addresses: [] as Address[]
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    type: 'home' as 'home' | 'office' | 'other',
    country: 'Sri Lanka',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    postcode: '',
    phone: '+94',
    isDefault: false
  });

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileData({ ...profileData, profilePicture: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem('userProfilePicture', profileData.profilePicture);
    localStorage.setItem('userProfileData', JSON.stringify(profileData));
    alert('Profile updated successfully!');
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      type: 'home',
      country: 'Sri Lanka',
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      postcode: '',
      phone: '+94',
      isDefault: false
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = (id: number) => {
    const updatedAddresses = profileData.addresses.filter(addr => addr.id !== id);
    setProfileData({ ...profileData, addresses: updatedAddresses });
  };

  const handleSaveAddress = () => {
    if (editingAddress) {
      const updatedAddresses = profileData.addresses.map(addr =>
        addr.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : addr
      );
      setProfileData({ ...profileData, addresses: updatedAddresses });
    } else {
      const newAddress = {
        ...addressForm,
        id: Date.now()
      };
      setProfileData({ ...profileData, addresses: [...profileData.addresses, newAddress] });
    }
    setShowAddressModal(false);
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'office': return <Building2 className="w-4 h-4" />;
      default: return <MapPinned className="w-4 h-4" />;
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold dark:text-white">Account Profile</h2>
          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Profile Picture and Basic Info */}
        <div className="flex flex-col md:flex-row gap-12 mb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-40 h-40 rounded-full bg-purple-50 dark:bg-purple-900/20 overflow-hidden border-4 border-purple-100 dark:border-purple-800">
              {profileData.profilePicture ? (
                <img src={profileData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-24 h-24 text-purple-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold cursor-pointer hover:bg-gray-50 transition-all">
              <Camera className="w-4 h-4" />
              <span>Update Photo</span>
              <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
            </label>
          </div>

          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Membership Level</label>
                <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-800 flex items-center gap-3">
                  <Award className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-purple-400">Membership</p>
                    <p className="text-sm font-bold text-purple-900 dark:text-purple-100">{user.badge} Level</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Contact</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Mobile</label>
                  <input
                    type="tel"
                    value={profileData.personalPhone}
                    onChange={(e) => setProfileData({ ...profileData, personalPhone: e.target.value })}
                    placeholder="+94 XX XXX XXXX"
                    className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Home</label>
                  <input
                    type="tel"
                    value={profileData.homePhone}
                    onChange={(e) => setProfileData({ ...profileData, homePhone: e.target.value })}
                    placeholder="+94 XX XXX XXXX"
                    className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold dark:text-white">Addresses</h3>
            <button
              onClick={handleAddAddress}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          </div>

          {profileData.addresses.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <MapPinned className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No addresses added yet</p>
              <button
                onClick={handleAddAddress}
                className="mt-4 text-purple-600 dark:text-purple-400 font-semibold text-sm hover:underline"
              >
                Add your first address
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {profileData.addresses.map((address) => (
                <div
                  key={address.id}
                  className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-purple-200 dark:hover:border-purple-800 transition-all relative"
                >
                  {address.isDefault && (
                    <span className="absolute top-3 right-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                      {getAddressIcon(address.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white capitalize">{address.type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{address.firstName} {address.lastName}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>{address.address}</p>
                    {address.apartment && <p>{address.apartment}</p>}
                    <p>{address.city}, {address.postcode}</p>
                    <p>{address.country}</p>
                    <p className="font-medium">{address.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-xs font-bold"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-xs font-bold"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingAddress ? 'Edit Address' : 'Add Address'}
              </h2>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Address Type */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Address Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['home', 'office', 'other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, type })}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all capitalize ${
                        addressForm.type === type
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Country/Region</label>
                <select
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                >
                  <option>Sri Lanka</option>
                  <option>India</option>
                  <option>United Kingdom</option>
                  <option>United States</option>
                </select>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">First Name</label>
                  <input
                    type="text"
                    value={addressForm.firstName}
                    onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Last Name</label>
                  <input
                    type="text"
                    value={addressForm.lastName}
                    onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Address</label>
                <input
                  type="text"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                />
              </div>

              {/* Apartment */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Apartment, Suite, etc (Optional)</label>
                <input
                  type="text"
                  value={addressForm.apartment}
                  onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                />
              </div>

              {/* City & Postcode */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Postcode</label>
                  <input
                    type="text"
                    value={addressForm.postcode}
                    onChange={(e) => setAddressForm({ ...addressForm, postcode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Phone</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                />
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center gap-3 py-2">
                <button
                  type="button"
                  onClick={() => setAddressForm({ ...addressForm, isDefault: !addressForm.isDefault })}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    addressForm.isDefault
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {addressForm.isDefault && <Check className="w-4 h-4 text-white" />}
                </button>
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  This is my default address
                </label>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowAddressModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}