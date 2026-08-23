import { MapPin } from 'lucide-react';

export interface StructuredAddress {
  line1: string;
  line2: string;
  city: string;
  notes: string;
}

export const emptyAddress: StructuredAddress = {
  line1: '',
  line2: '',
  city: '',
  notes: '',
};

// Turns the structured address into the single-line string that every
// existing consumer (PaymentPage, Invoice, GPSTracking, dashboard cards,
// the backend `address` field) still expects. Keeping this in one place
// means we only need to touch Booking.tsx — nothing downstream changes.
export function formatAddress(a: StructuredAddress): string {
  const parts = [a.line1.trim(), a.line2.trim(), a.city.trim()].filter(Boolean);
  let text = parts.join(', ');
  if (a.notes.trim()) text += ` (${a.notes.trim()})`;
  return text.trim();
}

// Mirrors the old ">= 5 characters" rule from validateForm(), applied to
// the fields that actually matter (line1 + city).
export function isAddressComplete(a: StructuredAddress): boolean {
  return a.line1.trim().length >= 5 && a.city.trim().length >= 2;
}

interface AddressInputProps {
  value: StructuredAddress;
  // Emits the structured value AND the pre-flattened string in one call,
  // so the parent can update both `addressDetails` and legacy `address`
  // fields without recomputing anything itself.
  onChange: (structured: StructuredAddress, flatAddress: string) => void;
  label?: string; // e.g. "Full Address" vs "Pickup & Delivery Address" vs "Pickup Address"
  error?: string;
}

const CITY_OPTIONS = [
  'Colombo', 'Dehiwala-Mount Lavinia', 'Moratuwa', 'Sri Jayawardenepura Kotte',
  'Negombo', 'Kandy', 'Galle', 'Jaffna', 'Kurunegala', 'Anuradhapura',
  'Ratnapura', 'Batticaloa', 'Trincomalee', 'Matara', 'Gampaha', 'Kalutara',
];

export default function AddressInput({ value, onChange, label = 'Address', error }: AddressInputProps) {
  const update = (field: keyof StructuredAddress, val: string) => {
    const next = { ...value, [field]: val };
    onChange(next, formatAddress(next));
  };

  const isOtherCity = value.city !== '' && !CITY_OPTIONS.includes(value.city);

  const inputClass =
    'w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white';

  return (
    <div>
      <label className="flex text-xs font-black uppercase text-gray-400 tracking-widest mb-2 items-center gap-2">
        <MapPin className="w-4 h-4 text-purple-600" />
        {label}
      </label>

      <div className="space-y-3">
        <input
          type="text"
          value={value.line1}
          onChange={(e) => update('line1', e.target.value)}
          placeholder="House / Building No. & Street *"
          className={inputClass}
        />

        <input
          type="text"
          value={value.line2}
          onChange={(e) => update('line2', e.target.value)}
          placeholder="Apartment, floor, area (optional)"
          className={inputClass}
        />

        <select
          value={isOtherCity ? '__other__' : value.city}
          onChange={(e) => update('city', e.target.value === '__other__' ? ' ' : e.target.value)}
          className={inputClass}
        >
          <option value="">Select city / town *</option>
          {CITY_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="__other__">Other</option>
        </select>

        {isOtherCity && (
          <input
            type="text"
            value={value.city.trim()}
            onChange={(e) => update('city', e.target.value)}
            placeholder="Enter city / town *"
            className={inputClass}
            autoFocus
          />
        )}

        <textarea
          value={value.notes}
          onChange={(e) => update('notes', e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder="Landmarks or directions for our driver (optional)"
        />
      </div>

      {error && <p className="mt-2 text-red-500 text-sm font-medium">{error}</p>}
    </div>
  );
}
