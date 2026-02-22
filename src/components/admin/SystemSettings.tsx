import { useState } from 'react';
import { 
  Settings, 
  Clock, 
  Calendar, 
  Trash2, 
  Plus, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Upload,
  Info
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

type SubTab = 'general' | 'business' | 'pricing';

export function SystemSettings() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('general');

  // General Settings State
  const [businessHours, setBusinessHours] = useState({ start: '09:00', end: '18:00' });
  const [operatingDays, setOperatingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [cancellationPolicy, setCancellationPolicy] = useState('2');
  const [durations, setDurations] = useState({ home: 120, laundry: 60, sofa: 90 });
  const [holidays, setHolidays] = useState([
    { date: '2026-02-14', name: "Valentine's Day" },
    { date: '2026-04-13', name: 'Sinhala New Year' }
  ]);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });

  // Business Settings State
  const [business, setBusiness] = useState({
    name: 'Cloud Laundry.lk',
    address: '123 Main Street, Moratuwa, Sri Lanka',
    email: 'contact@cloudlaundry.lk',
    phone: '+94 11 234 5678'
  });

  // Pricing Settings State
  const [pricing, setPricing] = useState({
    homeBase: 2500,
    laundryBase: 1500,
    sofaBase: 3500,
    perRoom: 500,
    weekendSurcharge: 10,
    holidaySurcharge: 20
  });

  const handleDayToggle = (day: string) => {
    setOperatingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const addHoliday = () => {
    if (newHoliday.date && newHoliday.name) {
      setHolidays([...holidays, newHoliday]);
      setNewHoliday({ date: '', name: '' });
    }
  };

  const removeHoliday = (index: number) => {
    setHolidays(holidays.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Settings className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">System Settings</h1>
          <p className="text-gray-500 font-medium mt-1">Configure global application parameters and business rules</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100/80 rounded-2xl w-fit">
        {[
          { id: 'general', name: 'General', icon: Clock },
          { id: 'business', name: 'Business', icon: Building2 },
          { id: 'pricing', name: 'Pricing', icon: DollarSign },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as SubTab)}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all
              ${activeSubTab === tab.id 
                ? 'bg-white text-purple-600 shadow-sm ring-1 ring-gray-200' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8">
          {activeSubTab === 'general' && (
            <div className="space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Start Time</Label>
                    <select 
                      value={businessHours.start}
                      onChange={(e) => setBusinessHours({...businessHours, start: e.target.value})}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
                    >
                      {Array.from({length: 24}).map((_, i) => (
                        <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">End Time</Label>
                    <select 
                      value={businessHours.end}
                      onChange={(e) => setBusinessHours({...businessHours, end: e.target.value})}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
                    >
                      {Array.from({length: 24}).map((_, i) => (
                        <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Operating Days</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="flex items-center space-x-3 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                      <Checkbox 
                        id={day} 
                        checked={operatingDays.includes(day)}
                        onCheckedChange={() => handleDayToggle(day)}
                      />
                      <Label htmlFor={day} className="font-semibold cursor-pointer">{day}</Label>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Info className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Policies & Defaults</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-gray-700">Cancellation Policy (Hours before)</Label>
                    <select 
                      value={cancellationPolicy}
                      onChange={(e) => setCancellationPolicy(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium"
                    >
                      <option value="2">2 hours</option>
                      <option value="4">4 hours</option>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-gray-700">Default Service Durations (Minutes)</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-gray-600">Home Cleaning</span>
                        <Input 
                          type="number" 
                          value={durations.home} 
                          onChange={(e) => setDurations({...durations, home: parseInt(e.target.value)})}
                          className="w-24 rounded-xl"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-gray-600">Laundry</span>
                        <Input 
                          type="number" 
                          value={durations.laundry} 
                          onChange={(e) => setDurations({...durations, laundry: parseInt(e.target.value)})}
                          className="w-24 rounded-xl"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-gray-600">Sofa Cleaning</span>
                        <Input 
                          type="number" 
                          value={durations.sofa} 
                          onChange={(e) => setDurations({...durations, sofa: parseInt(e.target.value)})}
                          className="w-24 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Holiday Dates</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input 
                      type="date" 
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                      className="max-w-[200px] rounded-xl"
                    />
                    <Input 
                      placeholder="Holiday Name (e.g. New Year)" 
                      value={newHoliday.name}
                      onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                      className="flex-1 rounded-xl"
                    />
                    <Button onClick={addHoliday} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-6 font-bold">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Date
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {holidays.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                          <p className="font-bold text-gray-900">{h.name}</p>
                          <p className="text-sm text-gray-500 font-medium">{h.date}</p>
                        </div>
                        <button onClick={() => removeHoliday(i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeSubTab === 'business' && (
            <div className="space-y-8 max-w-2xl">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-32 h-32 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                  <Upload className="w-8 h-8" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Upload Logo</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Company Branding</h3>
                  <p className="text-gray-500 text-sm font-medium">This logo will appear on receipts and the user app.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">Company Name</Label>
                  <div className="relative">
                    <div className="absolute left-4 top-3 text-gray-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <Input 
                      value={business.name}
                      onChange={(e) => setBusiness({...business, name: e.target.value})}
                      className="pl-12 h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">Business Address</Label>
                  <div className="relative">
                    <div className="absolute left-4 top-3 text-gray-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <Input 
                      value={business.address}
                      onChange={(e) => setBusiness({...business, address: e.target.value})}
                      className="pl-12 h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Contact Email</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-3 text-gray-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <Input 
                        value={business.email}
                        onChange={(e) => setBusiness({...business, email: e.target.value})}
                        className="pl-12 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Contact Phone</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-3 text-gray-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <Input 
                        value={business.phone}
                        onChange={(e) => setBusiness({...business, phone: e.target.value})}
                        className="pl-12 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'pricing' && (
            <div className="space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Service Base Rates (Rs.)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-purple-50/30 p-6 rounded-2xl border border-purple-100">
                    <Label className="text-xs font-black uppercase text-purple-600 tracking-widest mb-2 block">Home Cleaning</Label>
                    <Input 
                      type="number" 
                      value={pricing.homeBase}
                      onChange={(e) => setPricing({...pricing, homeBase: parseInt(e.target.value)})}
                      className="h-12 text-lg font-bold bg-white rounded-xl border-purple-100"
                    />
                  </div>
                  <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                    <Label className="text-xs font-black uppercase text-blue-600 tracking-widest mb-2 block">Laundry</Label>
                    <Input 
                      type="number" 
                      value={pricing.laundryBase}
                      onChange={(e) => setPricing({...pricing, laundryBase: parseInt(e.target.value)})}
                      className="h-12 text-lg font-bold bg-white rounded-xl border-blue-100"
                    />
                  </div>
                  <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-100">
                    <Label className="text-xs font-black uppercase text-orange-600 tracking-widest mb-2 block">Sofa Cleaning</Label>
                    <Input 
                      type="number" 
                      value={pricing.sofaBase}
                      onChange={(e) => setPricing({...pricing, sofaBase: parseInt(e.target.value)})}
                      className="h-12 text-lg font-bold bg-white rounded-xl border-orange-100"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Plus className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Surcharges & Extras</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-gray-700">Per Room Charge (Rs.)</Label>
                    <Input 
                      type="number" 
                      value={pricing.perRoom}
                      onChange={(e) => setPricing({...pricing, perRoom: parseInt(e.target.value)})}
                      className="h-12 rounded-xl"
                    />
                    <p className="text-xs text-gray-500 font-medium">Additional charge applied for each room beyond the base count.</p>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-gray-700">Surcharge Percentages (%)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase">Weekend</span>
                        <div className="relative">
                          <Input 
                            type="number" 
                            value={pricing.weekendSurcharge}
                            onChange={(e) => setPricing({...pricing, weekendSurcharge: parseInt(e.target.value)})}
                            className="h-11 pr-8 rounded-xl"
                          />
                          <span className="absolute right-4 top-2.5 text-gray-400 font-bold">%</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase">Holiday</span>
                        <div className="relative">
                          <Input 
                            type="number" 
                            value={pricing.holidaySurcharge}
                            onChange={(e) => setPricing({...pricing, holidaySurcharge: parseInt(e.target.value)})}
                            className="h-11 pr-8 rounded-xl"
                          />
                          <span className="absolute right-4 top-2.5 text-gray-400 font-bold">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-6 flex items-center justify-end gap-3 border-t border-gray-100">
          <Button variant="outline" className="h-12 px-8 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-white">
            Cancel
          </Button>
          <Button onClick={handleSave} className="h-12 px-10 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all active:scale-95">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}