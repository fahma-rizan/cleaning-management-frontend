import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, ChevronDown, ChevronUp, Zap, CheckCircle } from 'lucide-react';

interface OngoingActivityPanelProps {
  booking?: {
    bookingId: string;
    serviceName: string;
    serviceType: string;
    staff: {
      name: string;
      initials: string;
      role: string;
    };
    status: 'staff-en-route' | 'service-started' | 'in-progress' | 'completed';
    address: string;
    startTime: string;
    eta: string;
  };
}

export default function OngoingActivityPanel({ booking }: OngoingActivityPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Default booking data if none provided
  const defaultBooking = {
    bookingId: 'BK-2024-1001',
    serviceName: 'Premium Home Deep Cleaning',
    serviceType: 'Deep Cleaning',
    staff: {
      name: 'Maria Chen',
      initials: 'MC',
      role: 'Service Professional'
    },
    status: 'in-progress' as const,
    address: '123 Oak Street, Unit 4B, Colombo 07',
    startTime: '9:00 AM',
    eta: '12:30 PM'
  };

  const activeBooking = booking || defaultBooking;

  const stages = [
    { 
      id: 'staff-en-route', 
      label: 'Staff En Route', 
      time: '8:02 AM',
      completed: true
    },
    { 
      id: 'service-started', 
      label: 'Service Started', 
      time: '9:18 AM',
      completed: true
    },
    { 
      id: 'in-progress', 
      label: 'In Progress', 
      time: '9:18 AM',
      completed: true
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      time: '',
      completed: false
    },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === activeBooking.status);

  return (
    <div className="w-full max-w-[820px] mx-auto" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* INFO BANNER */}
      <div className="bg-gradient-to-r from-purple-50 via-purple-100/50 to-purple-50 border border-purple-200 rounded-xl px-5 py-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <p className="text-sm text-purple-900 leading-relaxed">
            <span className="font-bold">Real-time tracking active.</span> Staff locations update every 3 seconds.
          </p>
        </div>
      </div>

      {/* EXPANDABLE BOOKING CARD */}
      <div className="bg-white border border-gray-200 rounded-[20px] shadow-lg overflow-hidden">
        {/* CARD HEADER */}
        <div
          className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4 flex-1">
            {/* LIVE Badge */}
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
              <div className="relative">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </div>
              <span className="text-red-600 text-xs font-bold uppercase tracking-wider">LIVE</span>
            </div>

            {/* Service Info */}
            <div className="flex-1">
              <h3 className="text-gray-900 font-bold text-[15px] mb-1">{activeBooking.serviceName}</h3>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md">
                  <span className="text-purple-600 text-xs font-semibold">{activeBooking.serviceType}</span>
                </div>
                <div className="inline-flex items-center bg-gray-100 px-2.5 py-1 rounded-md">
                  <span className="text-gray-600 text-xs font-mono">{activeBooking.bookingId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chevron Toggle */}
          <div className="ml-4">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </div>

        {/* EXPANDED CONTENT */}
        {isExpanded && (
          <div className="px-6 pb-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* STAFF ROW */}
            <div className="bg-purple-50 border border-purple-100 rounded-[14px] px-[18px] py-[14px] flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {activeBooking.staff.initials}
                </div>

                {/* Staff Info */}
                <div>
                  <h4 className="text-gray-900 font-bold text-[14px]">{activeBooking.staff.name}</h4>
                  <p className="text-gray-600 text-xs mt-0.5">{activeBooking.staff.role}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button className="flex items-center gap-2 px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-100 transition-all text-sm font-semibold">
                  <Phone className="w-4 h-4" />
                  Call
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all text-sm font-semibold">
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              </div>
            </div>

            {/* LIVE TRACKING TIMELINE */}
            <div>
              <h5 className="text-gray-600 text-[11px] font-bold uppercase tracking-wider mb-[14px]">LIVE TRACKING</h5>

              <div className="relative mb-8">
                {/* Background Line */}
                <div className="absolute top-3 left-0 right-0 h-[2px] bg-gray-200" />

                {/* Progress Line */}
                <div
                  className="absolute top-3 left-0 h-[2px] bg-gradient-to-r from-purple-600 to-purple-500 transition-all duration-500"
                  style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                />

                {/* Timeline Nodes */}
                <div className="relative flex items-start justify-between">
                  {stages.map((stage, index) => {
                    const isCompleted = index <= currentStageIndex;
                    const isActive = index === currentStageIndex;

                    return (
                      <div key={stage.id} className="flex flex-col items-center" style={{ flex: 1 }}>
                        {/* Node Circle */}
                        <div className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? 'bg-purple-600 shadow-lg shadow-purple-500/40'
                            : 'bg-white border-2 border-gray-300'
                        }`}>
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-white fill-white" />
                          )}

                          {/* Pulsing ring for active stage */}
                          {isActive && isCompleted && (
                            <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-75" />
                          )}
                        </div>

                        {/* Stage Label */}
                        <div className="mt-3 text-center max-w-[90px]">
                          <p className={`text-[10px] font-semibold leading-tight mb-1 ${
                            isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {stage.label}
                          </p>
                          {stage.time && (
                            <p className={`text-[9px] ${
                              isCompleted ? 'text-purple-600' : 'text-gray-400'
                            }`}>
                              {stage.time}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* MAP / TRACKING AREA - Enhanced */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-gray-600 text-[11px] font-bold uppercase tracking-wider">LIVE LOCATION</h5>
                <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse" />
                  <span className="text-purple-600 text-[10px] font-bold uppercase tracking-wider">Updating</span>
                </div>
              </div>

              <div className="relative h-[200px] bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-[14px] overflow-hidden shadow-inner">
                {/* Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.03]">
                  <div className="w-full h-full" style={{
                    backgroundImage: 'linear-gradient(to right, #7C3AED 1px, transparent 1px), linear-gradient(to bottom, #7C3AED 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                {/* Route Path */}
                <svg className="absolute inset-0 w-full h-full">
                  <path
                    d="M 60 100 Q 180 70, 300 95 T 650 100"
                    stroke="#8B5CF6"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="10,8"
                    opacity="0.5"
                  />
                </svg>

                {/* Start Point (Staff Origin) */}
                <div className="absolute left-[60px] top-[100px] -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-4 h-4 bg-purple-600 rounded-full shadow-lg shadow-purple-500/50" />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-purple-600 text-[9px] font-semibold">Start</span>
                    </div>
                  </div>
                </div>

                {/* Destination Point (Customer Location) */}
                <div className="absolute right-[80px] top-[100px] -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-5 h-5 bg-pink-500 rounded-full shadow-lg shadow-pink-500/50" />
                    <div className="absolute inset-0 w-5 h-5 bg-pink-500 rounded-full animate-ping opacity-50" />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-pink-600 text-[9px] font-semibold">Your Location</span>
                    </div>
                  </div>
                </div>

                {/* Moving Staff Indicator with Avatar */}
                <div className="absolute left-[45%] top-[85px] -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    {/* Pulsing Ring */}
                    <div className="absolute -inset-3 bg-purple-400/20 rounded-full animate-ping" />
                    {/* Avatar */}
                    <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xl border-2 border-white">
                      {activeBooking.staff.initials}
                    </div>
                    {/* Status Badge */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Address Label */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-start gap-2 bg-white/95 backdrop-blur-sm border border-gray-200 px-4 py-2.5 rounded-lg shadow-sm">
                    <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <span className="text-gray-900 text-xs font-medium leading-relaxed">{activeBooking.address}</span>
                  </div>
                </div>

                {/* ETA Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 rounded-lg shadow-lg shadow-purple-500/30">
                    <div className="text-purple-100 text-[9px] font-bold uppercase tracking-wider mb-0.5">Arriving In</div>
                    <div className="text-white text-sm font-bold">{activeBooking.eta}</div>
                  </div>
                </div>

                {/* Distance Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/95 backdrop-blur-sm border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="text-gray-600 text-[10px] font-semibold">~2.3 km away</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Started */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl px-[14px] py-3 text-center">
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wide mb-1.5">STARTED</p>
                <p className="text-purple-600 text-[15px] font-bold">{activeBooking.startTime}</p>
              </div>

              {/* ETA */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl px-[14px] py-3 text-center">
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wide mb-1.5">ETA</p>
                <p className="text-purple-600 text-[15px] font-bold">{activeBooking.eta}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
