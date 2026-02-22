import React, { useState } from 'react';
import { MapPin, Home, Building2, Edit, Trash2, Plus } from 'lucide-react';

interface Address {
  id: string;
  type: 'Home' | 'Office';
  isDefault: boolean;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
}

export default function AddressesSection() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'Home',
      isDefault: true,
      name: 'John Doe',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Colombo',
      country: 'Sri Lanka',
      postalCode: '00100',
      phone: '+94 77 123 4567'
    },
    {
      id: '2',
      type: 'Office',
      isDefault: false,
      name: 'ABC Company',
      addressLine1: '456 Business Avenue',
      addressLine2: 'Floor 5',
      city: 'Colombo',
      country: 'Sri Lanka',
      postalCode: '00200',
      phone: '+94 11 234 5678'
    }
  ]);

  const handleEdit = (id: string) => {
    console.log('Edit address:', id);
    // Handle edit logic
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleAddNew = () => {
    console.log('Add new address');
    // Handle add new address logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Addresses</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your delivery addresses</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#7C3AED] text-white rounded-xl font-semibold hover:bg-[#6D28D9] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                  {address.type === 'Home' ? (
                    <Home className="w-5 h-5 text-[#7C3AED]" />
                  ) : (
                    <Building2 className="w-5 h-5 text-[#7C3AED]" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{address.type}</h3>
                </div>
              </div>
              {address.isDefault && (
                <span className="px-2.5 py-1 bg-purple-50 text-[#7C3AED] text-xs font-bold rounded-lg uppercase">
                  Default
                </span>
              )}
            </div>

            {/* Address Details */}
            <div className="space-y-2 mb-4">
              <p className="font-semibold text-gray-900">{address.name}</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {address.addressLine1}
                {address.addressLine2 && (
                  <>
                    <br />
                    {address.addressLine2}
                  </>
                )}
                <br />
                {address.city}
              </p>
              <p className="text-sm text-gray-500">
                {address.country} - {address.postalCode}
              </p>
              <p className="text-sm text-gray-600 font-medium">{address.phone}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleEdit(address.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(address.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
