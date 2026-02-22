import React from 'react';
import { Phone, MessageCircle, MapPin, CheckCircle } from 'lucide-react';

interface OngoingBookingCardProps {
  booking: {
    bookingId: string;
    serviceName: string;
    serviceType: string;
    staff: {
      name: string;
      avatar: string;
      role: string;
    };
    status: 'staff-en-route' | 'service-started' | 'in-progress' | 'completed';
    address: string;
    startTime: string;
    eta: string;
    progress: number;
  };
}

export default function OngoingBookingCard({ booking }: OngoingBookingCardProps) {
  const stages = [
    { id: 'staff-en-route', label: 'Staff En Route', time: '8:02 AM' },
    { id: 'service-started', label: 'Service Started', time: '9:18 AM' },
    { id: 'in-progress', label: 'In Progress', time: '9:18 AM' },
    { id: 'completed', label: 'Completed', time: '12:30 PM' },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === booking.status);

  return (
    <div className="bg-[#1a1d29] rounded-2xl p-6 shadow-2xl border border-gray-800">
      {/* Service Professional Info */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
            {booking.staff.avatar}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{booking.staff.name}</h3>
            <p className="text-sm text-gray-400">{booking.staff.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-teal-500 text-teal-500 rounded-lg hover:bg-teal-500/10 transition-all">
            <Phone className="w-4 h-4" />
            <span className="text-sm font-semibold">Call</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Chat</span>
          </button>
        </div>
      </div>

      {/* Live Tracking Header */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Live Tracking</h4>
        
        {/* Progress Timeline */}
        <div className="relative mb-8">
          {/* Connecting Line Background */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-700" />
          
          {/* Active Line */}
          <div 
            className="absolute top-5 left-0 h-0.5 bg-teal-500 transition-all duration-500"
            style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
          />

          <div className="relative flex items-center justify-between">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex flex-col items-center">
                {/* Stage Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                  index <= currentStageIndex
                    ? 'bg-teal-500 border-4 border-[#1a1d29]'
                    : 'bg-gray-700 border-4 border-[#1a1d29]'
                }`}>
                  {index <= currentStageIndex && (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Stage Label */}
                <div className="mt-3 text-center">
                  <p className={`text-xs font-semibold whitespace-nowrap ${
                    index <= currentStageIndex
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}>
                    {stage.label}
                  </p>
                  <p className={`text-xs mt-1 ${
                    index <= currentStageIndex
                      ? 'text-teal-500'
                      : 'text-gray-700'
                  }`}>
                    {index <= currentStageIndex ? stage.time : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-[#0f1117] rounded-xl p-6 mb-6 relative overflow-hidden border border-gray-800" style={{ height: '200px' }}>
        {/* Simulated route path */}
        <svg className="absolute inset-0 w-full h-full">
          <path
            d="M 50 150 Q 150 100, 300 80 T 550 60"
            stroke="#14b8a6"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,8"
            opacity="0.8"
          />
        </svg>

        {/* Destination marker */}
        <div className="absolute top-12 right-16">
          <div className="w-4 h-4 bg-teal-500 rounded-full animate-pulse" />
          <div className="w-4 h-4 bg-teal-500/30 rounded-full absolute top-0 left-0 animate-ping" />
        </div>
        
        {/* Current location marker */}
        <div className="absolute bottom-16 left-1/3">
          <div className="w-4 h-4 bg-teal-500 rounded-full" />
        </div>

        {/* ETA Badge */}
        <div className="absolute top-4 right-4 bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-bold">
          ETA {booking.eta}
        </div>

        {/* Address */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
          <MapPin className="w-4 h-4 text-pink-500" />
          <span className="text-sm text-white font-medium">{booking.address}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0f1117] rounded-xl p-5 text-center border border-gray-800">
          <p className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-widest">Started</p>
          <p className="text-2xl font-bold text-teal-500">{booking.startTime}</p>
        </div>
        <div className="bg-[#0f1117] rounded-xl p-5 text-center border border-gray-800">
          <p className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-widest">ETA</p>
          <p className="text-2xl font-bold text-teal-500">{booking.eta}</p>
        </div>
        <div className="bg-[#0f1117] rounded-xl p-5 text-center border border-gray-800">
          <p className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-widest">Progress</p>
          <p className="text-2xl font-bold text-teal-500">{booking.progress}%</p>
        </div>
      </div>
    </div>
  );
}
