import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, DollarSign, Home, Users, Minus, Plus, ShieldCheck, CheckCircle2, Sofa, Shirt } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from './Header';
import BackButton from './BackButton';
import AIEstimator from './AIEstimator';
import DryCleaningPriceList from './DryCleaningPriceList';
import WashingPressingPriceList from './WashingPressingPriceList';
import PressingPriceList from './PressingPriceList';
import type { User } from '../types';
import type { FormEvent } from 'react';

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
  
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    address: '',
    houseSize: 'medium',
    rooms: 2,
    bathrooms: 1,
    frequency: 'once',
    specialInstructions: '',
    packageType: 'standard',
    // Laundry specific fields
    laundryWeight: 1,
    laundryServices: [] as string[],
    laundryItemType: 'normal',
    // Curtain cleaning specific fields
    curtainServiceType: 'dry-clean-press', // dry-clean-press, laundry-press, premium
    curtainOptions: [] as string[], // removal, installation, pickup-delivery
    curtainQuantity: 1,
    // Sofa & Mattress cleaning specific fields
    sofaUnits: 1,
    sofaSeatingCapacity: 1,
    mattressCount: 1,
    carpetCount: 1,
    mattressSquareFeet: 50,
  });

  const isLaundryService = serviceId === '2';
  const isCurtainService = serviceId === '4';
  const isSofaCleaning = serviceId === '3';
  const isMattressCleaning = serviceId === '13';
  const isCarpetCleaning = serviceId === '14';
  const isSofaMattressService = isSofaCleaning || isMattressCleaning || isCarpetCleaning;
  const isDryCleaningService = serviceId === '9';
  const isWashingPressingService = serviceId === '10';
  const isPressingOnlyService = serviceId === '11';
  const isHomeCleaningService = ['1', '5', '6', '7', '8'].includes(serviceId || '');
  
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM',
  ];

  // Curtain cleaning service types
  const curtainServiceTypes = [
    { id: 'dry-clean-press', name: 'Dry Cleaning and Pressing', price: 2500, description: 'Best for delicate fabrics and deep cleaning' },
    { id: 'laundry-press', name: 'Laundry and Pressing', price: 3500, description: 'Standard wash and professional pressing' },
    { id: 'premium', name: 'Curtain Premium Service', price: 4500, description: 'Highest level of care for luxury curtains' },
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
      setEstimatedPrice(4500);
    } else {
      setEstimatedPrice(0);
    }
  }, [serviceId, bookingData.sofaSeatingCapacity, bookingData.mattressCount, bookingData.carpetCount]);

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
  };

  const handleCurtainOptionToggle = (optionId: string) => {
    setBookingData(prev => {
      const options = prev.curtainOptions.includes(optionId)
        ? prev.curtainOptions.filter(o => o !== optionId)
        : [...prev.curtainOptions, optionId];
      return { ...prev, curtainOptions: options };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
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
      price: estimatedPrice,
      bookingId: 'BK-' + Date.now(),
      status: 'pending',
      timestamp: new Date().toISOString(),
    };
    
    // Save to user bookings
    const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    userBookings.unshift(booking);
    localStorage.setItem('userBookings', JSON.stringify(userBookings));
    
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
                    Property Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Property Size</label>
                      <select
                        value={bookingData.houseSize}
                        onChange={(e) => handleInputChange('houseSize', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                      >
                        <option value="small">Small (Apartment/Studio)</option>
                        <option value="medium">Medium (2-3 Bedroom House)</option>
                        <option value="large">Large (4+ Bedroom House/Villa)</option>
                        <option value="office">Office/Commercial Space</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Number of Rooms</label>
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-5 py-3 rounded-2xl">
                        <button type="button" onClick={() => handleInputChange('rooms', Math.max(1, bookingData.rooms - 1))} className="text-purple-600 font-bold text-xl">-</button>
                        <span className="font-bold dark:text-white">{bookingData.rooms} Rooms</span>
                        <button type="button" onClick={() => handleInputChange('rooms', bookingData.rooms + 1)} className="text-purple-600 font-bold text-xl">+</button>
                      </div>
                    </div>
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
                        selected={bookingData.date ? new Date(bookingData.date) : null}
                        onChange={(date) => handleInputChange('date', date ? date.toISOString().split('T')[0] : '')}
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
                        {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Full Address</label>
                    <textarea
                      value={bookingData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white resize-none"
                      placeholder="Enter full address..."
                    />
                  </div>
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
                        selected={bookingData.date ? new Date(bookingData.date) : null}
                        onChange={(date) => handleInputChange('date', date ? date.toISOString().split('T')[0] : '')}
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
                        {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Pickup & Delivery Address</label>
                    <textarea
                      value={bookingData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white resize-none"
                      placeholder="Enter full address for pickup..."
                    />
                  </div>
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
                        selected={bookingData.date ? new Date(bookingData.date) : null}
                        onChange={(date) => handleInputChange('date', date ? date.toISOString().split('T')[0] : '')}
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
                        {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Service Address</label>
                    <textarea
                      value={bookingData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white resize-none"
                      placeholder="Enter the address where cleaning is required..."
                    />
                  </div>
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
                        selected={bookingData.date ? new Date(bookingData.date) : null}
                        onChange={(date) => handleInputChange('date', date ? date.toISOString().split('T')[0] : '')}
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
                        {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Pickup Address</label>
                    <textarea
                      value={bookingData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white resize-none"
                      placeholder="Enter full address for pickup and delivery..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Price Summary & Submit */}
            <div className="bg-gray-900 dark:bg-purple-900 rounded-3xl p-8 text-white shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-purple-300 font-bold uppercase tracking-widest text-xs mb-1">Estimated Total</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">LKR {estimatedPrice.toLocaleString()}</span>
                    <span className="text-purple-400 text-sm">inc. taxes</span>
                  </div>
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