// This file acts as a temporary, frontend-only database.
// It translates the data from your backend's seed file into a format
// that our TypeScript components can safely use.

// By exporting these interfaces, we ensure type safety across the application.
export interface PricingType {
  id: string;
  label: string;
  pricePerSqft: number;
}

export interface PricingGroup {
  id: string;
  label: string;
  price: number;
}

export interface SeatPricing {
  seats: number;
  price: number;
}

export interface FixedPriceSize {
  size: string; // e.g., 'Single', 'Queen', 'King'
  price: number;
}

export interface PriceListEntry {
  serviceId: number;
  serviceName: string;
  category: 'home' | 'laundry' | 'shampoo' | 'curtain';
  pricingType: 'per-sqft' | 'per-item' | 'per-seat' | 'per-unit' | 'fixed';
  pricing: {
    types?: PricingType[];
    groups?: PricingGroup[];
    seats?: SeatPricing[];
    sizes?: FixedPriceSize[];
    hasFoldHang?: boolean; // For laundry
    price?: number; // For simple per-unit items
  };
}

// By exporting this constant, we make the data available for import in other files.
export const priceLists: PriceListEntry[] = [
  // ─── 1. House Deep Cleaning ───────────────────────────────────────────────
  {
    serviceId: 1,
    serviceName: 'House Deep Cleaning',
    category: 'home',
    pricingType: 'per-sqft',
    pricing: {
      types: [
        { id: 'normal', label: 'Normal Deep Cleaning', pricePerSqft: 25 },
        { id: 'move-in-out', label: 'Move In / Move Out', pricePerSqft: 30 },
        { id: 'after-construction', label: 'After Construction', pricePerSqft: 35 },
      ],
    },
  },
  // ─── 2. Kitchen Deep Cleaning ─────────────────────────────────────────────
  {
    serviceId: 2,
    serviceName: 'Kitchen Deep Cleaning',
    category: 'home',
    pricingType: 'fixed',
    pricing: {
      sizes: [
        { size: 'Small', price: 3000 },
        { size: 'Medium', price: 4000 },
        { size: 'Large', price: 5000 },
      ],
    },
  },
  // ─── 3. Bathroom Deep Cleaning ────────────────────────────────────────────
  {
    serviceId: 3,
    serviceName: 'Bathroom Deep Cleaning',
    category: 'home',
    pricingType: 'per-unit',
    pricing: {
      price: 2500,
    },
  },
  // ─── 4. Laundry Service ───────────────────────────────────────────────────
  {
    serviceId: 4,
    serviceName: 'Laundry Service',
    category: 'laundry',
    pricingType: 'per-item',
    pricing: {
      hasFoldHang: true,
      groups: [
        { id: 'wash-fold', label: 'Wash & Fold (per kg)', price: 450 },
        { id: 'wash-iron', label: 'Wash & Iron (per kg)', price: 650 },
        { id: 'iron-hang', label: 'Iron & Hang (per piece)', price: 150 },
      ],
    },
  },
  // ─── 5. Sofa Shampooing ───────────────────────────────────────────────────
  {
    serviceId: 5,
    serviceName: 'Sofa Shampooing',
    category: 'shampoo',
    pricingType: 'per-seat',
    pricing: {
      seats: [
        { seats: 1, price: 800 },
        { seats: 2, price: 1600 },
        { seats: 3, price: 2400 },
        { seats: 4, price: 3200 },
        { seats: 5, price: 4000 },
        { seats: 6, price: 4800 },
        { seats: 7, price: 5600 },
      ],
    },
  },
  // ─── 6. Carpet Shampooing ─────────────────────────────────────────────────
  {
    serviceId: 6,
    serviceName: 'Carpet Shampooing',
    category: 'shampoo',
    pricingType: 'per-sqft',
    pricing: {
      types: [
        { id: 'normal', label: 'Normal Carpet', pricePerSqft: 35 },
        { id: 'persian', label: 'Persian Carpet', pricePerSqft: 50 },
      ],
    },
  },
  // ─── 7. Mattress Shampooing ───────────────────────────────────────────────
  {
    serviceId: 7,
    serviceName: 'Mattress Shampooing',
    category: 'shampoo',
    pricingType: 'fixed',
    pricing: {
      sizes: [
        { size: 'Single', price: 2500 },
        { size: 'Double', price: 3000 },
        { size: 'Queen', price: 3500 },
        { size: 'King', price: 4000 },
      ],
    },
  },
  // ─── 8. Chair Shampooing ──────────────────────────────────────────────────
  {
    serviceId: 8,
    serviceName: 'Chair Shampooing',
    category: 'shampoo',
    pricingType: 'per-unit',
    pricing: {
      price: 500,
    },
  },
  // ─── 9. Curtain Cleaning ──────────────────────────────────────────────────
  {
    serviceId: 9,
    serviceName: 'Curtain Cleaning',
    category: 'curtain',
    pricingType: 'per-item',
    pricing: {
      groups: [
        { id: 'steam', label: 'On-site Steam Cleaning (per piece)', price: 1000 },
        { id: 'dry', label: 'Dry Cleaning (per kg)', price: 800 },
      ],
    },
  },
];