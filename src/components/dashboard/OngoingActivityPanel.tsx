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
      <div className="bg-gradient-to-r from-purple-600/20 via-purple-500/15 to-purple-600/20 border border-purple-500/30 rounded-xl px-5 py-4 mb-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <p className="text-sm text-white leading-relaxed">
            <span className="font-bold">Real-time tracking active.</span> Staff locations update every 3 seconds.
          </p>
        </div>
      </div>

      {/* EXPANDABLE BOOKING CARD */}
      <div className="bg-[#1a1d29] border border-gray-800 rounded-[20px] shadow-2xl overflow-hidden">
        {/* CARD HEADER */}
        <div 
          className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-gray-800/30 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4 flex-1">
            {/* LIVE Badge */}
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 px-3 py-1.5 rounded-full">
              <div className="relative">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </div>
              <span className="text-red-400 text-xs font-bold uppercase tracking-wider">LIVE</span>
            </div>

            {/* Service Info */}
            <div className="flex-1">
              <h3 className="text-white font-bold text-[15px] mb-1">{activeBooking.serviceName}</h3>
              <div className="inline-flex items-center bg-gray-800/60 px-2.5 py-1 rounded-md">
                <span className="text-gray-400 text-xs font-mono">{activeBooking.bookingId}</span>
              </div>
            </div>
          </div>

          {/* Chevron Toggle */}
          <div className="ml-4">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* EXPANDED CONTENT */}
        {isExpanded && (
          <div className="px-6 pb-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* STAFF ROW */}
            <div className="bg-[#0f1117] border border-gray-800 rounded-[14px] px-[18px] py-[14px] flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {activeBooking.staff.initials}
                </div>
                
                {/* Staff Info */}
                <div>
                  <h4 className="text-white font-bold text-[14px]">{activeBooking.staff.name}</h4>
                  <p className="text-gray-500 text-xs mt-0.5">{activeBooking.staff.role}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button className="flex items-center gap-2 px-4 py-2 border border-teal-500/50 text-teal-400 rounded-lg hover:bg-teal-500/10 transition-all text-sm font-semibold">
                  <Phone className="w-4 h-4" />
                  Call
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 transition-all text-sm font-semibold">
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              </div>
            </div>

            {/* LIVE TRACKING TIMELINE */}
            <div>
              <h5 className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-[14px]">LIVE TRACKING</h5>
              
              <div className="relative mb-8">
                {/* Background Line */}
                <div className="absolute top-3 left-0 right-0 h-[2px] bg-gray-800" />
                
                {/* Progress Line */}
                <div 
                  className="absolute top-3 left-0 h-[2px] bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-500"
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
                            ? 'bg-teal-500 shadow-lg shadow-teal-500/40'
                            : 'bg-transparent border-2 border-gray-700'
                        }`}>
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-white fill-white" />
                          )}
                          
                          {/* Pulsing ring for active stage */}
                          {isActive && isCompleted && (
                            <div className="absolute inset-0 rounded-full border-2 border-teal-400 animate-ping opacity-75" />
                          )}
                        </div>

                        {/* Stage Label */}
                        <div className="mt-3 text-center max-w-[90px]">
                          <p className={`text-[10px] font-semibold leading-tight mb-1 ${
                            isCompleted ? 'text-white' : 'text-gray-600'
                          }`}>
                            {stage.label}
                          </p>
                          {stage.time && (
                            <p className={`text-[9px] ${
                              isCompleted ? 'text-teal-400' : 'text-gray-700'
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

            {/* MAP / TRACKING AREA */}
            <div className="relative h-[140px] bg-[#0f1117] border border-gray-800 rounded-[14px] overflow-hidden">
              {/* Grid Overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{
                  backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              </div>

              {/* Route Path */}
              <svg className="absolute inset-0 w-full h-full">
                <path
                  d="M 60 70 Q 180 50, 300 65 T 540 70"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="8,6"
                  opacity="0.7"
                />
              </svg>

              {/* Start Point */}
              <div className="absolute left-[60px] top-[70px] -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-teal-500 rounded-full" />
              </div>

              {/* Destination Point */}
              <div className="absolute right-[80px] top-[70px] -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-4 h-4 bg-pink-500 rounded-full" />
                  <div className="absolute inset-0 w-4 h-4 bg-pink-500 rounded-full animate-ping opacity-75" />
                </div>
              </div>

              {/* Moving Staff Indicator */}
              <div className="absolute left-[45%] top-[58px] -translate-x-1/2 -translate-y-1/2 animate-pulse">
                <div className="relative">
                  <div className="w-3.5 h-3.5 bg-teal-400 rounded-full shadow-lg shadow-teal-400/50" />
                  <div className="absolute inset-0 w-3.5 h-3.5 bg-teal-400 rounded-full blur-sm" />
                </div>
              </div>

              {/* Address Label */}
              <div className="absolute bottom-3 left-3">
                <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 px-3 py-1.5 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-pink-500" />
                  <span className="text-white text-xs font-medium">{activeBooking.address}</span>
                </div>
              </div>

              {/* ETA Badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-teal-500 px-3 py-1.5 rounded-lg shadow-lg">
                  <span className="text-white text-xs font-bold">ETA {activeBooking.eta}</span>
                </div>
              </div>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Started */}
              <div className="bg-[#0f1117] border border-gray-800 rounded-xl px-[14px] py-3 text-center">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wide mb-1.5">STARTED</p>
                <p className="text-teal-400 text-[15px] font-bold">{activeBooking.startTime}</p>
              </div>

              {/* ETA */}
              <div className="bg-[#0f1117] border border-gray-800 rounded-xl px-[14px] py-3 text-center">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wide mb-1.5">ETA</p>
                <p className="text-teal-400 text-[15px] font-bold">{activeBooking.eta}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
