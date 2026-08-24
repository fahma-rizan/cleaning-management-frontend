import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, DollarSign, Home, Users, Minus, Plus, ShieldCheck, CheckCircle2, Sofa, Shirt } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from './Header';
import BackButton from './BackButton';
import AIEstimator from './AIEstimator';
import DryCleaningPriceList from './DryCleaningPriceList';
import WashingPressingPriceList from './WashingPressingPriceList';
import PressingPriceList from './PressingPriceList';
import AddressInput, { emptyAddress, isAddressComplete, parseFlatAddress, type StructuredAddress } from './AddressInput';
import type { User } from '../types';
import type { FormEvent } from 'react';
import { fetchWithAuth } from '../utils/api';

interface BookingProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function Booking({ user, onLogout, theme, onToggleTheme, onProfileClick }: BookingProps) {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Service mapping
  const serviceMapping: { [key: string]: string } = {
    '1': 'house deep cleaning',
    '2': 'laundry',
    '3': 'sofa cleaning',
    '4': 'curtain cleaning',
    '5': 'commercial cleaning',
    '6': 'general cleaning',
    '7': 'floor cleaning',
    '8': 'floor cut and polish',
    '9': 'dry cleaning',
    '10': 'washing pressing',
    '11': 'pressing only',
    '13': 'mattress cleaning',
    '14': 'carpet cleaning',
  };
  
  // Main service type mapping (for display)
  const mainServiceTypeMapping: { [key: string]: string } = {
    '1': 'Home/Office Cleaning',
    '2': 'Laundry',
    '3': 'Shampoo and Vacuum Cleaning',
    '4': 'Curtain Cleaning',
    '5': 'Home/Office Cleaning',
    '6': 'Home/Office Cleaning',
    '7': 'Home/Office Cleaning',
    '8': 'Home/Office Cleaning',
    '9': 'Laundry',
    '10': 'Laundry',
    '11': 'Laundry',
    '13': 'Shampoo and Vacuum Cleaning',
    '14': 'Shampoo and Vacuum Cleaning',
  };
  
  // Service category mapping (specific sub-service)
  const serviceCategoryMapping: { [key: string]: string } = {
    '1': 'House Deep Cleaning',
    '2': 'General Laundry',
    '3': 'Sofa Cleaning',
    '4': 'Curtain Cleaning',
    '5': 'Commercial Cleaning',
    '6': 'General Cleaning',
    '7': 'Floor Cleaning',
    '8': 'Floor Cut and Polish',
    '9': 'Dry Cleaning',
    '10': 'Washing & Pressing',
    '11': 'Pressing Only',
    '13': 'Mattress Cleaning with Steam',
    '14': 'Carpet Cleaning',
  };
  
  const parseLocalDate = (str: string) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const toLocalDateStr = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  // Mirrors backend/utils/dateUtils.js's addWorkingDays exactly — used here
  // just to SHOW the customer the delivery date before they confirm; the
  // backend always recomputes this itself as the source of truth.
  const addWorkingDays = (dateStr: string, days: number): string => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    let added = 0;
    while (added < days) {
      date.setDate(date.getDate() + 1);
      const dow = date.getDay();
      if (dow !== 0 && dow !== 6) added++;
    }
    return toLocalDateStr(date);
  };

  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    address: '', // flattened string — still sent to backend, still what Payment/Invoice/GPS/dashboard read
    addressDetails: emptyAddress as StructuredAddress, // structured breakdown, captured by AddressInput
    houseSize: 'medium',
    rooms: 2,
    bathrooms: 1,
    // Home/Office cleaning — per-sqft pricing
    cleaningType: 'normal',
    squareFeet: 0,
    specialInstructions: '',
    packageType: 'standard',
    // Laundry specific fields
    laundryWeight: 1,
    laundryServices: [] as string[],
    laundryItemType: 'normal',
    laundrySelectedItems: [] as any[], // For storing selected garments from price lists
    laundryPickupDelivery: false, // Pickup and delivery option
    deliveryTime: '', // Laundry delivery time slot — delivery DATE is auto-calculated (2 working days after pickup), never typed
    // Curtain cleaning specific fields
    curtainServiceType: 'dry-clean-press', // dry-clean-press, laundry-press, premium
    curtainOptions: [] as string[], // removal, installation, pickup-delivery
    curtainQuantity: 1,
    // Sofa & Mattress cleaning specific fields
    sofaUnits: 1,
    sofaSeatingCapacity: 1,
    mattressCount: 1,
    carpetCount: 1,
    carpetSquareFeet: 50,
    mattressSquareFeet: 50,
    // Promo code
    promoCode: '',
    promoDiscount: 0,
    promoMessage: '',
    promoApplied: false,
  });
  const [applyingPromo, setApplyingPromo] = useState(false);

  // "Rebook" from a past booking (My Bookings > Past) — the dashboard links
  // here with the original booking in router state. Prefill everything it
  // saved except date/time, since the whole point is booking the same thing
  // again for a new slot. addressDetails itself was never persisted (only
  // the flattened `address` string is), so it's reconstructed on a best-effort
  // basis via parseFlatAddress. Fields the backend never stores either (e.g.
  // cleaningType — a pricing-tier choice that was only ever a UI-local field)
  // just keep their normal per-service default.
  useEffect(() => {
    const rebookFrom = (location.state as any)?.rebookFrom;
    if (!rebookFrom) return;
    setBookingData(prev => ({
      ...prev,
      date: '',
      time: '',
      address: rebookFrom.address || '',
      addressDetails: parseFlatAddress(rebookFrom.address || ''),
      houseSize: rebookFrom.houseSize ?? prev.houseSize,
      rooms: rebookFrom.rooms ?? prev.rooms,
      bathrooms: rebookFrom.bathrooms ?? prev.bathrooms,
      squareFeet: rebookFrom.squareFeet ?? prev.squareFeet,
      specialInstructions: rebookFrom.specialInstructions ?? prev.specialInstructions,
      packageType: rebookFrom.packageType ?? prev.packageType,
      laundryWeight: rebookFrom.laundryWeight ?? prev.laundryWeight,
      laundryServices: rebookFrom.laundryServices ?? prev.laundryServices,
      laundryItemType: rebookFrom.laundryItemType ?? prev.laundryItemType,
      laundrySelectedItems: rebookFrom.laundrySelectedItems ?? prev.laundrySelectedItems,
      laundryPickupDelivery: rebookFrom.laundryPickupDelivery ?? prev.laundryPickupDelivery,
      curtainServiceType: rebookFrom.curtainServiceType ?? prev.curtainServiceType,
      curtainOptions: rebookFrom.curtainOptions ?? prev.curtainOptions,
      curtainQuantity: rebookFrom.curtainQuantity ?? prev.curtainQuantity,
      sofaUnits: rebookFrom.sofaUnits ?? prev.sofaUnits,
      sofaSeatingCapacity: rebookFrom.sofaSeatingCapacity ?? prev.sofaSeatingCapacity,
      mattressCount: rebookFrom.mattressCount ?? prev.mattressCount,
      carpetCount: rebookFrom.carpetCount ?? prev.carpetCount,
      carpetSquareFeet: rebookFrom.carpetSquareFeet ?? prev.carpetSquareFeet,
      mattressSquareFeet: rebookFrom.mattressSquareFeet ?? prev.mattressSquareFeet,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLaundryService = serviceId === '2';
  // Auto-calculated, never typed — 2 working days after the chosen pickup date.
  const deliveryDate = bookingData.date ? addWorkingDays(bookingData.date, 2) : '';
  const isCurtainService = serviceId === '4';
  const isSofaCleaning = serviceId === '3';
  const isMattressCleaning = serviceId === '13';
  const isCarpetCleaning = serviceId === '14';
  const isSofaMattressService = isSofaCleaning || isMattressCleaning || isCarpetCleaning;
  const isDryCleaningService = serviceId === '9';
  const isWashingPressingService = serviceId === '10';
  const isPressingOnlyService = serviceId === '11';
  const isHomeCleaningService = ['1', '5', '6', '7', '8'].includes(serviceId || '');

  // ─── Home cleaning price map (LKR per square foot, by cleaning type) ──────────
  const homeCleaningPrices: Record<string, Record<string, number>> = {
    '1': { normal: 25, 'move-in-out': 30, 'after-construction': 35 }, // House Deep Cleaning
    '5': { normal: 25, 'move-in-out': 30, 'after-construction': 35 }, // Commercial Cleaning
    '6': { general: 20 },                                              // General Cleaning
    '7': { floor: 30 },                                                // Floor Cleaning
    '8': { 'cut-polish': 35 },                                         // Floor Cut & Polish
  };

  const homeCleaningTypes: Record<string, { id: string; label: string }[]> = {
    '1': [
      { id: 'normal', label: 'Normal Deep Cleaning — LKR 25/sqft' },
      { id: 'move-in-out', label: 'Move In / Move Out — LKR 30/sqft' },
      { id: 'after-construction', label: 'After Construction — LKR 35/sqft' },
    ],
    '5': [
      { id: 'normal', label: 'Normal Deep Cleaning — LKR 25/sqft' },
      { id: 'move-in-out', label: 'Move In / Move Out — LKR 30/sqft' },
      { id: 'after-construction', label: 'After Construction — LKR 35/sqft' },
    ],
    '6': [{ id: 'general', label: 'General Cleaning — LKR 20/sqft' }],
    '7': [{ id: 'floor', label: 'Floor Cleaning — LKR 30/sqft' }],
    '8': [{ id: 'cut-polish', label: 'Cut & Polish — LKR 35/sqft' }],
  };

  const [estimatedPrice, setEstimatedPrice] = useState(0);
  // true/false = known available/unavailable from the backend; absent = not
  // checked yet (treated as available so slots aren't blurred before the
  // first fetch resolves).
  const [slotAvailability, setSlotAvailability] = useState<Record<string, boolean>>({});
  // Laundry only — same shape, but for the auto-calculated delivery date,
  // checked completely independently of the pickup slot.
  const [deliverySlotAvailability, setDeliverySlotAvailability] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Staff-availability based slot check — not a fixed "max bookings per
  // slot" count. Passes the service info this page already knows (from
  // serviceId), PLUS the size/quantity fields that determine staff headcount
  // (getRequiredStaffCount on the backend), so a slot only shows as
  // available here if enough staff actually exist for THIS booking's size —
  // not just for the service in general. Without this, a large booking could
  // show every slot as open, get rejected at submit time, and (until that was
  // fixed too) silently fail to save while the UI still showed "confirmed".
  // `setter` lets this same logic drive either the pickup grid or (for
  // laundry) the independently-checked delivery grid.
  const fetchSlotCounts = async (date: string, setter: (v: Record<string, boolean>) => void = setSlotAvailability) => {
    if (!date) return;
    try {
      const serviceName     = serviceMapping[serviceId || '1'] || 'home cleaning';
      const serviceType     = mainServiceTypeMapping[serviceId || '1'] || 'Home/Office Cleaning';
      const serviceCategory = serviceCategoryMapping[serviceId || '1'] || 'General Cleaning';
      const params = new URLSearchParams({ date, serviceName, serviceType, serviceCategory });
      if (bookingData.squareFeet > 0)          params.set('squareFeet', String(bookingData.squareFeet));
      if (bookingData.sofaSeatingCapacity > 0) params.set('sofaSeatingCapacity', String(bookingData.sofaSeatingCapacity));
      if (bookingData.carpetSquareFeet > 0)    params.set('carpetSquareFeet', String(bookingData.carpetSquareFeet));
      const data = await fetchWithAuth(`/bookings/slot-check?${params.toString()}`);
      if (data.success) setter(data.slotAvailability);
    } catch {
      // silently ignore — slots won't show as disabled
    }
  };

  // Re-check slot availability whenever the date is set OR a quantity field
  // that changes the required staff headcount changes — e.g. someone
  // increasing square footage after already picking a date needs the slot
  // grid to reflect the bigger headcount immediately, not just at submit time.
  useEffect(() => {
    if (bookingData.date) fetchSlotCounts(bookingData.date);
  }, [bookingData.date, bookingData.squareFeet, bookingData.sofaSeatingCapacity, bookingData.carpetSquareFeet]);

  // Delivery date is fully derived from the pickup date (2 working days
  // later) — re-check its slot availability whenever the pickup date (and
  // therefore the delivery date) changes.
  useEffect(() => {
    if (isLaundryService && deliveryDate) fetchSlotCounts(deliveryDate, setDeliverySlotAvailability);
  }, [isLaundryService, deliveryDate]);

  // Keep in sync with TIME_SLOTS in backend/controllers/bookingController.js.
  const timeSlots = [
    '8:00AM - 10:00AM',
    '10:30AM - 12:30PM',
    '1:00PM - 3:00PM',
    '3:30PM - 5:30PM',
    '6:00PM - 8:00PM',
  ];

  // Curtain cleaning service types
  const curtainServiceTypes = [
    { id: 'dry-clean-press', name: 'Dry Cleaning and Pressing', price: 2500, description: 'Best for delicate fabrics and deep cleaning' },
    { id: 'laundry-press', name: 'Laundry and Pressing', price: 3500, description: 'Standard wash and professional pressing' },
    { id: 'premium', name: 'Curtain Premium Service', price: 4500, description: 'Highest level of care for luxury curtains. Includes Curtain Removal,Pickup & Delivery and Installation' },
  ];

  // Curtain cleaning options
  const curtainOptions = [
    { id: 'removal', name: 'Curtain Removal', price: 100, isPerCurtain: true },
    { id: 'installation', name: 'Curtain Installation', price: 100, isPerCurtain: true },
    { id: 'pickup-delivery', name: 'Pickup and Delivery', price: 500, isPerCurtain: false },
  ];

  useEffect(() => {
    if (isCurtainService) {
      calculateCurtainPrice();
    } else if (isLaundryService) {
      calculateLaundryPrice(bookingData.laundryWeight, bookingData.laundryServices);
    } else if (isSofaCleaning) {
      setEstimatedPrice(1000 * bookingData.sofaSeatingCapacity);
    } else if (isMattressCleaning) {
      setEstimatedPrice(750 * bookingData.mattressCount);
    } else if (isCarpetCleaning) {
      setEstimatedPrice(500 * bookingData.carpetCount);
    } else if (isHomeCleaningService) {
      const priceMap = homeCleaningPrices[serviceId || ''];
      const pricePerSqft = priceMap?.[bookingData.cleaningType] || 0;
      setEstimatedPrice(pricePerSqft * bookingData.squareFeet);
    } else {
      setEstimatedPrice(0);
    }
  }, [serviceId, bookingData.sofaSeatingCapacity, bookingData.mattressCount, bookingData.carpetCount, bookingData.cleaningType, bookingData.squareFeet]);

  // Default cleaning type per service (single-option services only have one anyway)
  useEffect(() => {
    if (serviceId === '6') handleInputChange('cleaningType', 'general');
    else if (serviceId === '7') handleInputChange('cleaningType', 'floor');
    else if (serviceId === '8') handleInputChange('cleaningType', 'cut-polish');
    else if (isHomeCleaningService) handleInputChange('cleaningType', 'normal');
  }, [serviceId]);

  // Curtain price calculation
  const calculateCurtainPrice = () => {
    const selectedType = curtainServiceTypes.find(t => t.id === bookingData.curtainServiceType);
    let total = (selectedType?.price || 0) * bookingData.curtainQuantity;

    bookingData.curtainOptions.forEach(optId => {
      const option = curtainOptions.find(o => o.id === optId);
      if (option) {
        if (option.isPerCurtain) {
          total += option.price * bookingData.curtainQuantity;
        } else {
          total += option.price;
        }
      }
    });

    setEstimatedPrice(total);
  };

  useEffect(() => {
    if (isCurtainService) {
      calculateCurtainPrice();
    }
  }, [bookingData.curtainServiceType, bookingData.curtainOptions, bookingData.curtainQuantity]);

  // Laundry price calculation
  const laundryServiceOptions = [
    { id: 'wash-dry-normal', name: 'Wash & Dry - Normal', pricePerKg: 250 },
    { id: 'wash-dry-bedsheet', name: 'Wash & Dry - Sheets', pricePerKg: 350 },
    { id: 'wash-dry-press-normal', name: 'Wash, Dry & Press', pricePerKg: 300 },
  ];

  const calculateLaundryPrice = (weight: number, services: string[]) => {
    let total = 0;
    services.forEach(serviceId => {
      const service = laundryServiceOptions.find(s => s.id === serviceId);
      if (service) total += service.pricePerKg * weight;
    });
    setEstimatedPrice(total);
  };

  const handleInputChange = (field: string, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
    // Slot re-check is handled by the useEffect above (date + quantity fields)
  };

  const handleCurtainOptionToggle = (optionId: string) => {
    setBookingData(prev => {
      const options = prev.curtainOptions.includes(optionId)
        ? prev.curtainOptions.filter(o => o !== optionId)
        : [...prev.curtainOptions, optionId];
      return { ...prev, curtainOptions: options };
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!bookingData.date) errors.date = 'Please select a service date.';
    if (!bookingData.time) errors.time = 'Please select a time slot.';
    if (!isAddressComplete(bookingData.addressDetails))
      errors.address = 'Please enter a complete address (house/street and city).';
    if (isLaundryService && bookingData.laundryServices.length === 0)
      errors.laundryServices = 'Please select at least one laundry service.';
    if (isLaundryService && !bookingData.deliveryTime)
      errors.deliveryTime = 'Please select a delivery time slot.';
    if ((isDryCleaningService || isWashingPressingService || isPressingOnlyService) && estimatedPrice === 0)
      errors.items = 'Please select at least one item from the price list.';
    if (isHomeCleaningService && bookingData.squareFeet <= 0)
      errors.squareFeet = 'Please enter the area size in square feet.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyPromo = async () => {
    if (!bookingData.promoCode.trim()) return;
    setApplyingPromo(true);
    try {
      const data = await fetchWithAuth('/offers/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: bookingData.promoCode,
          serviceId: Number(serviceId),
          orderAmount: estimatedPrice,
        }),
      });

      if (data?.offer) {
        handleInputChange('promoDiscount', data.offer.discountAmount || 0);
        handleInputChange('promoApplied', true);
        handleInputChange(
          'promoMessage',
          `✅ Code applied! You save LKR ${(data.offer.discountAmount || 0).toLocaleString()}`
        );
      } else {
        handleInputChange('promoDiscount', 0);
        handleInputChange('promoApplied', false);
        handleInputChange('promoMessage', `❌ ${data?.message || 'Invalid promo code'}`);
      }
    } catch (err) {
      handleInputChange('promoDiscount', 0);
      handleInputChange('promoApplied', false);
      handleInputChange('promoMessage', '❌ Failed to validate promo code. Please try again.');
    } finally {
      setApplyingPromo(false);
    }
  };

  const finalPrice = Math.max(0, estimatedPrice - bookingData.promoDiscount);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const serviceType = serviceMapping[serviceId || '1'] || 'home cleaning';
    const mainServiceType = mainServiceTypeMapping[serviceId || '1'] || 'Home/Office Cleaning';
    const serviceCategory = serviceCategoryMapping[serviceId || '1'] || 'General Cleaning';

    // For curtain cleaning, determine the specific sub-service based on selected type
    let finalServiceCategory = serviceCategory;
    if (isCurtainService) {
      const selectedType = curtainServiceTypes.find(t => t.id === bookingData.curtainServiceType);
      finalServiceCategory = selectedType?.name || 'Curtain Cleaning';
    }

    const booking = {
      ...bookingData,
      serviceId,
      serviceType: mainServiceType,
      serviceCategory: finalServiceCategory,
      serviceName: serviceType,
      userId: user.id,
      price: finalPrice,
      originalPrice: estimatedPrice,
      bookingId: 'BK-' + Date.now(),
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    // Only store current booking temporarily — saved to MongoDB after payment
    localStorage.setItem('currentBooking', JSON.stringify(booking));
    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <h1 className="text-4xl font-bold mb-2 dark:text-white">Book Your Service</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Schedule your professional cleaning service today.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Home/Office Cleaning UI */}
            {isHomeCleaningService && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <Home className="w-6 h-6 text-purple-600" />
                    Cleaning Details
                  </h2>

                  {/* Cleaning Type Selection — only for services with multiple types */}
                  {(homeCleaningTypes[serviceId || '']?.length || 0) > 1 && (
                    <div className="mb-6">
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-3">
                        Cleaning Type
                      </label>
                      <div className="space-y-2">
                        {homeCleaningTypes[serviceId || '']?.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => handleInputChange('cleaningType', type.id)}
                            className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all ${
                              bookingData.cleaningType === type.id
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10'
                                : 'border-gray-100 dark:border-gray-700 hover:border-purple-300'
                            }`}
                          >
                            <span className="font-semibold dark:text-white">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Area Size */}
                  <div className="mb-6">
                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">
                      Area Size (Square Feet)
                    </label>
                    <input
                      type="number"
                      value={bookingData.squareFeet || ''}
                      onChange={(e) => handleInputChange('squareFeet', Number(e.target.value))}
                      placeholder="Enter square feet e.g. 1500"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                      min={1}
                    />
                    {bookingData.squareFeet > 0 && (
                      <p className="mt-2 text-purple-600 font-semibold text-sm">
                        Estimated: LKR {(
                          (homeCleaningPrices[serviceId || '']?.[bookingData.cleaningType] || 0) *
                          bookingData.squareFeet
                        ).toLocaleString()}
                        {' '}(LKR {homeCleaningPrices[serviceId || '']?.[bookingData.cleaningType] || 0}/sqft × {bookingData.squareFeet} sqft)
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    Schedule & Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Service Date</label>
                      <DatePicker
                        selected={bookingData.date ? parseLocalDate(bookingData.date) : null}
                        onChange={(date: Date | null) => handleInputChange('date', date ? toLocalDateStr(date) : '')}
                        minDate={new Date()}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                        placeholderText="Select date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Preferred Time</label>
                      <select
                        value={bookingData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                      >
                        <option value="">Choose slot</option>
                        {timeSlots.map(slot => {
                          // Staff-availability based, not a fixed booking count —
                          // true (available) until the backend says otherwise.
                          const isFull = slotAvailability[slot] === false;
                          return (
                            <option key={slot} value={slot} disabled={isFull}>
                              {slot}{isFull ? ' — No staff available' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <AddressInput
                    value={bookingData.addressDetails}
                    onChange={(details, flat) => {
                      handleInputChange('addressDetails', details);
                      handleInputChange('address', flat);
                    }}
                    label="Full Address"
                    error={formErrors.address}
                  />
                </div>
              </div>
            )}

            {/* Laundry Service UI */}
            {isLaundryService && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <Shirt className="w-6 h-6 text-purple-600" />
                    Laundry Details
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Estimated Weight (kg)</label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            const newWeight = Math.max(1, bookingData.laundryWeight - 1);
                            handleInputChange('laundryWeight', newWeight);
                            calculateLaundryPrice(newWeight, bookingData.laundryServices);
                          }}
                          className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="text-3xl font-bold w-16 text-center dark:text-white">{bookingData.laundryWeight} kg</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newWeight = bookingData.laundryWeight + 1;
                            handleInputChange('laundryWeight', newWeight);
                            calculateLaundryPrice(newWeight, bookingData.laundryServices);
                          }}
                          className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Select Services</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {laundryServiceOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              const newServices = bookingData.laundryServices.includes(opt.id)
                                ? bookingData.laundryServices.filter(s => s !== opt.id)
                                : [...bookingData.laundryServices, opt.id];
                              handleInputChange('laundryServices', newServices);
                              calculateLaundryPrice(bookingData.laundryWeight, newServices);
                            }}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                              bookingData.laundryServices.includes(opt.id)
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10'
                                : 'border-gray-100 dark:border-gray-700 hover:border-purple-200'
                            }`}
                          >
                            <span className="font-bold text-sm dark:text-white">{opt.name}</span>
                            <span className="text-xs text-purple-600 font-bold">LKR {opt.pricePerKg}/kg</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    Pickup Schedule
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Pickup Date</label>
                      <DatePicker
                        selected={bookingData.date ? parseLocalDate(bookingData.date) : null}
                        onChange={(date: Date | null) => handleInputChange('date', date ? toLocalDateStr(date) : '')}
                        minDate={new Date()}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                        placeholderText="Select date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Pickup Time</label>
                      <select
                        value={bookingData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                      >
                        <option value="">Choose slot</option>
                        {timeSlots.map(slot => {
                          // Staff-availability based, not a fixed booking count —
                          // true (available) until the backend says otherwise.
                          const isFull = slotAvailability[slot] === false;
                          return (
                            <option key={slot} value={slot} disabled={isFull}>
                              {slot}{isFull ? ' — No staff available' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <AddressInput
                    value={bookingData.addressDetails}
                    onChange={(details, flat) => {
                      handleInputChange('addressDetails', details);
                      handleInputChange('address', flat);
                    }}
                    label="Pickup & Delivery Address"
                    error={formErrors.address}
                  />
                </div>

                {/* Delivery date is auto-calculated (2 working days after
                    pickup) — the customer only picks the delivery TIME slot,
                    checked and staffed completely independently of pickup. */}
                {bookingData.date && (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-2 dark:text-white flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-purple-600" />
                      Delivery Schedule
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Your laundry will be delivered back 2 working days after pickup.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Delivery Date</label>
                        <div className="w-full px-5 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 font-semibold">
                          {new Date(deliveryDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Delivery Time</label>
                        <select
                          value={bookingData.deliveryTime}
                          onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                          className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                        >
                          <option value="">Choose slot</option>
                          {timeSlots.map(slot => {
                            const isFull = deliverySlotAvailability[slot] === false;
                            return (
                              <option key={slot} value={slot} disabled={isFull}>
                                {slot}{isFull ? ' — No staff available' : ''}
                              </option>
                            );
                          })}
                        </select>
                        {formErrors.deliveryTime && (
                          <p className="mt-2 text-red-500 text-sm font-medium">{formErrors.deliveryTime}</p>
                        )}
                      </div>
                    </div>

                    {/* Summary — customer sees both legs before confirming */}
                    {bookingData.time && bookingData.deliveryTime && (
                      <div className="mt-6 p-5 bg-purple-50 dark:bg-purple-900/10 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
                        <div>
                          <p className="text-xs font-black uppercase text-purple-400 tracking-widest mb-1">Pickup</p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {bookingData.time}
                          </p>
                        </div>
                        <span className="text-purple-400 font-bold">→</span>
                        <div>
                          <p className="text-xs font-black uppercase text-purple-400 tracking-widest mb-1">Delivery</p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {new Date(deliveryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {bookingData.deliveryTime}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Dry Cleaning Service UI */}
            {isDryCleaningService && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <DryCleaningPriceList 
                    onTotalChange={(total, items) => {
                      setEstimatedPrice(total);
                      handleInputChange('laundrySelectedItems', items);
                    }}
                    theme={theme}
                  />
                </div>

                {/* Pickup/Delivery Option */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-purple-600" />
                    Pickup & Delivery
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleInputChange('laundryPickupDelivery', !bookingData.laundryPickupDelivery)}
                    className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
                      bookingData.laundryPickupDelivery
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10'
                        : 'border-gray-100 dark:border-gray-700 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        bookingData.laundryPickupDelivery ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                      }`}>
                        {bookingData.laundryPickupDelivery && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-lg dark:text-white">Free Pickup & Delivery</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">We'll collect and return your garments</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">FREE</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    Schedule Pickup
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Pickup Date</label>
                      <DatePicker
                        selected={bookingData.date ? parseLocalDate(bookingData.date) : null}
                        onChange={(date: Date | null) => handleInputChange('date', date ? toLocalDateStr(date) : '')}
                        minDate={new Date()}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                        placeholderText="Select date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Pickup Time</label>
                      <select
                        value={bookingData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                      >
                        <option value="">Choose slot</option>
                        {timeSlots.map(slot => {
                          // Staff-availability based, not a fixed booking count —
                          // true (available) until the backend says otherwise.
                          const isFull = slotAvailability[slot] === false;
                          return (
                            <option key={slot} value={slot} disabled={isFull}>
                              {slot}{isFull ? ' — No staff available' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <AddressInput
                    value={bookingData.addressDetails}
                    onChange={(details, flat) => {
                      handleInputChange('addressDetails', details);
                      handleInputChange('address', flat);
                    }}
                    label="Pickup & Delivery Address"
                    error={formErrors.address}
                  />
                </div>
              </div>
            )}

            {/* Washing & Pressing Service UI */}
            {isWashingPressingService && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <WashingPressingPriceList 
                    onTotalChange={(total, items) => {
                      setEstimatedPrice(total);
                      handleInputChange('laundrySelectedItems', items);
                    }}
                    theme={theme}
                  />
                </div>

                {/* Pickup/Delivery Option */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-purple-600" />
                    Pickup & Delivery
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleInputChange('laundryPickupDelivery', !bookingData.laundryPickupDelivery)}
                    className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
                      bookingData.laundryPickupDelivery
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10'
                        : 'border-gray-100 dark:border-gray-700 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        bookingData.laundryPickupDelivery ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                      }`}>
                        {bookingData.laundryPickupDelivery && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-lg dark:text-white">Free Pickup & Delivery</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">We'll collect and return your garments</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">FREE</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    Schedule Pickup
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Pickup Date</label>
                      <DatePicker
                        selected={bookingData.date ? parseLocalDate(bookingData.date) : null}
                        onChange={(date: Date | null) => handleInputChange('date', date ? toLocalDateStr(date) : '')}
                        minDate={new Date()}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                        placeholderText="Select date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Pickup Time</label>
                      <select
                        value={bookingData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                      >
                        <option value="">Choose slot</option>
                        {timeSlots.map(slot => {
                          // Staff-availability based, not a fixed booking count —
                          // true (available) until the backend says otherwise.
                          const isFull = slotAvailability[slot] === false;
                          return (
                            <option key={slot} value={slot} disabled={isFull}>
                              {slot}{isFull ? ' — No staff available' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <AddressInput
                    value={bookingData.addressDetails}
                    onChange={(details, flat) => {
                      handleInputChange('addressDetails', details);
                      handleInputChange('address', flat);
                    }}
                    label="Pickup & Delivery Address"
                    error={formErrors.address}
                  />
                </div>
              </div>
            )}

            {/* Pressing Only Service UI */}
            {isPressingOnlyService && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <PressingPriceList 
                    onTotalChange={(total, items) => {
                      setEstimatedPrice(total);
                      handleInputChange('laundrySelectedItems', items);
                    }}
                    theme={theme}
                  />
                </div>

                {/* Pickup/Delivery Option */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-purple-600" />
                    Pickup & Delivery
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleInputChange('laundryPickupDelivery', !bookingData.laundryPickupDelivery)}
                    className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
                      bookingData.laundryPickupDelivery
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10'
                        : 'border-gray-100 dark:border-gray-700 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        bookingData.laundryPickupDelivery ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                      }`}>
                        {bookingData.laundryPickupDelivery && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-lg dark:text-white">Free Pickup & Delivery</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">We'll collect and return your garments</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">FREE</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    Schedule Pickup
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Pickup Date</label>
                      <DatePicker
                        selected={bookingData.date ? parseLocalDate(bookingData.date) : null}
                        onChange={(date: Date | null) => handleInputChange('date', date ? toLocalDateStr(date) : '')}
                        minDate={new Date()}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                        placeholderText="Select date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Pickup Time</label>
                      <select
                        value={bookingData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                      >
                        <option value="">Choose slot</option>
                        {timeSlots.map(slot => {
                          // Staff-availability based, not a fixed booking count —
                          // true (available) until the backend says otherwise.
                          const isFull = slotAvailability[slot] === false;
                          return (
                            <option key={slot} value={slot} disabled={isFull}>
                              {slot}{isFull ? ' — No staff available' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <AddressInput
                    value={bookingData.addressDetails}
                    onChange={(details, flat) => {
                      handleInputChange('addressDetails', details);
                      handleInputChange('address', flat);
                    }}
                    label="Pickup & Delivery Address"
                    error={formErrors.address}
                  />
                </div>
              </div>
            )}

            {/* Shampoo and Vacuum Cleaning UI (Sofa, Mattress, Carpet) */}
            {isSofaMattressService && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <Sofa className="w-6 h-6 text-purple-600" />
                    Property Details
                  </h2>
                  
                  {isSofaCleaning && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Number of people that can be seated on the sofa
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleInputChange('sofaSeatingCapacity', Math.max(1, bookingData.sofaSeatingCapacity - 1))}
                          className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="text-3xl font-bold w-12 text-center dark:text-white">{bookingData.sofaSeatingCapacity}</span>
                        <button
                          type="button"
                          onClick={() => handleInputChange('sofaSeatingCapacity', bookingData.sofaSeatingCapacity + 1)}
                          className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <span className="text-gray-500 ml-2">(LKR 1,000 per person)</span>
                      </div>
                    </div>
                  )}

                  {isMattressCleaning && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Number of mattresses
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleInputChange('mattressCount', Math.max(1, bookingData.mattressCount - 1))}
                          className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="text-3xl font-bold w-12 text-center dark:text-white">{bookingData.mattressCount}</span>
                        <button
                          type="button"
                          onClick={() => handleInputChange('mattressCount', bookingData.mattressCount + 1)}
                          className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <span className="text-gray-500 ml-2">(LKR 750 per mattress)</span>
                      </div>
                    </div>
                  )}

                  {isCarpetCleaning && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Number of carpets
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleInputChange('carpetCount', Math.max(1, bookingData.carpetCount - 1))}
                          className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="text-3xl font-bold w-12 text-center dark:text-white">{bookingData.carpetCount}</span>
                        <button
                          type="button"
                          onClick={() => handleInputChange('carpetCount', bookingData.carpetCount + 1)}
                          className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <span className="text-gray-500 ml-2">(LKR 500 per carpet)</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    Schedule Service
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Service Date</label>
                      <DatePicker
                        selected={bookingData.date ? parseLocalDate(bookingData.date) : null}
                        onChange={(date: Date | null) => handleInputChange('date', date ? toLocalDateStr(date) : '')}
                        minDate={new Date()}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                        placeholderText="Select date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Preferred Time</label>
                      <select
                        value={bookingData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                      >
                        <option value="">Choose slot</option>
                        {timeSlots.map(slot => {
                          // Staff-availability based, not a fixed booking count —
                          // true (available) until the backend says otherwise.
                          const isFull = slotAvailability[slot] === false;
                          return (
                            <option key={slot} value={slot} disabled={isFull}>
                              {slot}{isFull ? ' — No staff available' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <AddressInput
                    value={bookingData.addressDetails}
                    onChange={(details, flat) => {
                      handleInputChange('addressDetails', details);
                      handleInputChange('address', flat);
                    }}
                    label="Service Address"
                    error={formErrors.address}
                  />
                </div>
              </div>
            )}

            {/* Curtain Cleaning UI */}
            {isCurtainService && (
              <div className="space-y-6">
                {/* 1. Service Type Selection */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-purple-600" />
                    Select Service Type
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {curtainServiceTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleInputChange('curtainServiceType', type.id)}
                        className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left ${
                          bookingData.curtainServiceType === type.id
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10'
                            : 'border-gray-100 dark:border-gray-700 hover:border-purple-200'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg dark:text-white">{type.name}</h3>
                            {bookingData.curtainServiceType === type.id && (
                              <CheckCircle2 className="w-5 h-5 text-purple-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-purple-600">LKR {type.price.toLocaleString()}</div>
                          <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Per Curtain</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Quantity and Property Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quantity */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-6 dark:text-white">Number of Curtains</h2>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => handleInputChange('curtainQuantity', Math.max(1, bookingData.curtainQuantity - 1))}
                        className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all text-purple-600 font-bold text-2xl"
                      >
                        -
                      </button>
                      <div className="text-center">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">{bookingData.curtainQuantity}</span>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Total Panels</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('curtainQuantity', bookingData.curtainQuantity + 1)}
                        className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all text-purple-600 font-bold text-2xl"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-6 dark:text-white">Property Details</h2>
                    <div className="space-y-3">
                      {curtainOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleCurtainOptionToggle(opt.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            bookingData.curtainOptions.includes(opt.id)
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10 text-purple-900 dark:text-purple-100'
                              : 'border-gray-50 dark:border-gray-700 hover:border-purple-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              bookingData.curtainOptions.includes(opt.id) ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                            }`}>
                              {bookingData.curtainOptions.includes(opt.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className="font-bold text-sm dark:text-white">{opt.name}</span>
                          </div>
                          <div className="text-xs font-bold text-purple-600">
                            LKR {opt.price} {opt.isPerCurtain ? '/pc' : ''}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Schedule & Address */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 dark:text-white">Pickup & Schedule</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Service Date</label>
                      <DatePicker
                        selected={bookingData.date ? parseLocalDate(bookingData.date) : null}
                        onChange={(date: Date | null) => handleInputChange('date', date ? toLocalDateStr(date) : '')}
                        minDate={new Date()}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                        placeholderText="Select date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Preferred Time</label>
                      <select
                        value={bookingData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                      >
                        <option value="">Choose slot</option>
                        {timeSlots.map(slot => {
                          // Staff-availability based, not a fixed booking count —
                          // true (available) until the backend says otherwise.
                          const isFull = slotAvailability[slot] === false;
                          return (
                            <option key={slot} value={slot} disabled={isFull}>
                              {slot}{isFull ? ' — No staff available' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <AddressInput
                    value={bookingData.addressDetails}
                    onChange={(details, flat) => {
                      handleInputChange('addressDetails', details);
                      handleInputChange('address', flat);
                    }}
                    label="Pickup Address"
                    error={formErrors.address}
                  />
                </div>
              </div>
            )}

            {/* Promo Code */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Have a Promo Code?</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={bookingData.promoCode}
                  onChange={(e) => handleInputChange('promoCode', e.target.value.toUpperCase())}
                  placeholder="Enter promo code e.g. WELCOME20"
                  className="flex-1 px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white uppercase tracking-wide"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={applyingPromo || !bookingData.promoCode.trim()}
                  className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applyingPromo ? 'Checking...' : 'Apply'}
                </button>
              </div>
              {bookingData.promoMessage && (
                <p className={`mt-3 text-sm font-medium ${bookingData.promoApplied ? 'text-green-600' : 'text-red-600'}`}>
                  {bookingData.promoMessage}
                </p>
              )}
            </div>

            {/* Price Summary & Submit */}
            <div className="bg-gray-900 dark:bg-purple-900 rounded-3xl p-8 text-white shadow-xl">
              {Object.keys(formErrors).length > 0 && (
                <div className="mb-6 p-4 bg-red-900/40 border border-red-500 rounded-2xl">
                  <p className="text-red-300 font-bold text-sm mb-2">Please fill in all required fields:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.values(formErrors).map((err, i) => (
                      <li key={i} className="text-red-300 text-sm">{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-purple-300 font-bold uppercase tracking-widest text-xs mb-1">
                    {bookingData.promoApplied ? 'Price Summary' : 'Estimated Total'}
                  </h3>
                  {bookingData.promoApplied ? (
                    <>
                      <div className="text-purple-300 text-sm">
                        Original: <span className="line-through">LKR {estimatedPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black">LKR {finalPrice.toLocaleString()}</span>
                        <span className="text-purple-400 text-sm">inc. taxes</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black">LKR {estimatedPrice.toLocaleString()}</span>
                      <span className="text-purple-400 text-sm">inc. taxes</span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-10 py-5 bg-white text-purple-900 rounded-2xl font-black text-lg hover:bg-purple-50 transition-all shadow-lg active:scale-95"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}