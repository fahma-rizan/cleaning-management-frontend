import { MapPin, Navigation, Clock, CheckCircle2, User } from 'lucide-react';
import { Badge } from '../ui/badge';

interface ActiveCleaner {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  status: 'En Route' | 'On Site' | 'Completed';
  location: string;
  eta?: string;
  customer: string;
}

const activeCleaners: ActiveCleaner[] = [
  {
    id: '1',
    name: 'Maria Garcia',
    initials: 'MG',
    specialty: 'Deep Cleaning',
    status: 'En Route',
    location: 'Downtown Area',
    eta: '12 min',
    customer: 'Sarah J.'
  },
  {
    id: '2',
    name: 'John Smith',
    initials: 'JS',
    specialty: 'Laundry Pickup',
    status: 'On Site',
    location: 'West District',
    customer: 'Mike C.'
  },
  {
    id: '3',
    name: 'Lisa Wang',
    initials: 'LW',
    specialty: 'Regular Cleaning',
    status: 'En Route',
    location: 'North Hills',
    eta: '25 min',
    customer: 'Emily D.'
  },
  {
    id: '4',
    name: 'Sofia Petrov',
    initials: 'SP',
    specialty: 'Sofa Cleaning',
    status: 'Completed',
    location: 'East Village',
    customer: 'James W.'
  }
];

export function GPSTracking() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">GPS Tracking</h1>
        <p className="text-gray-500 mt-1 font-medium">Real-time cleaner location and route visualization</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Map View */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm aspect-[4/3] relative flex flex-col items-center justify-center p-8 overflow-hidden">
            {/* Background Map Grid Pattern (Mock) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#7C3AED 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
              <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Map View</h2>
              <p className="text-gray-500 leading-relaxed font-medium">
                Real-time map showing cleaner locations, routes, and customer addresses. Powered by WebSocket updates.
              </p>
            </div>

            {/* Bottom Stats inside the map container */}
            <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-4">
              <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50 shadow-sm">
                <div className="text-2xl font-black text-green-600">3</div>
                <div className="text-sm font-semibold text-gray-500">Active</div>
              </div>
              <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50 shadow-sm">
                <div className="text-2xl font-black text-blue-600">2</div>
                <div className="text-sm font-semibold text-gray-500">En Route</div>
              </div>
              <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50 shadow-sm">
                <div className="text-2xl font-black text-gray-400">1</div>
                <div className="text-sm font-semibold text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Active Cleaners</h3>
          <div className="space-y-4">
            {activeCleaners.map((cleaner) => (
              <div key={cleaner.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-lg border border-purple-100/50">
                      {cleaner.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight text-lg">{cleaner.name}</h4>
                      <p className="text-gray-500 text-sm font-medium">{cleaner.specialty}</p>
                    </div>
                  </div>
                  <Badge className={`
                    ${cleaner.status === 'En Route' ? 'bg-blue-50 text-blue-600 hover:bg-blue-50' : ''}
                    ${cleaner.status === 'On Site' ? 'bg-green-50 text-green-600 hover:bg-green-50' : ''}
                    ${cleaner.status === 'Completed' ? 'bg-gray-50 text-gray-500 hover:bg-gray-50' : ''}
                    border-none shadow-none font-bold px-3 py-1 flex items-center gap-1.5
                  `}>
                    {cleaner.status === 'En Route' && <Navigation className="w-3.5 h-3.5" />}
                    {cleaner.status === 'On Site' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {cleaner.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {cleaner.status}
                  </Badge>
                </div>

                <div className="space-y-3 pt-1 border-t border-gray-50 mt-4">
                  <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {cleaner.location}
                    </div>
                    {cleaner.eta && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        ETA: {cleaner.eta}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                    <User className="w-4 h-4 text-gray-400" />
                    Customer: {cleaner.customer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}