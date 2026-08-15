import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, CheckCircle, Clock, X, RefreshCw } from 'lucide-react';
import type { User } from '../types';
import { fetchWithAuth } from '../utils/api';

interface GPSTrackingProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

interface Task {
  id: string;
  bookingId: string;
  customer: string;
  service: string;
  address: string;
  status: string;
  startTime: string;
  estimatedCompletion: string;
  completedAt?: string;
}

const parseTimeSlot = (slot: string) => {
  const parts = (slot || '').split(' - ');
  return { startTime: parts[0] || '—', endTime: parts[1] || '—' };
};

const todayStr = () => new Date().toISOString().split('T')[0];

const ACTIVE_STATUSES = ['pending', 'confirmed', 'in-progress'];

export default function GPSTracking(_props: GPSTrackingProps) {
  const [activeTasks, setActiveTasks]       = useState<Task[]>([]);
  const [completedToday, setCompletedToday] = useState<Task[]>([]);
  const [loading, setLoading]               = useState(true);
  const [selectedTask, setSelectedTask]     = useState<Task | null>(null);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/bookings/assigned');
      if (data.success) {
        const today = todayStr();
        const todayBookings = (data.bookings || []).filter((b: any) => b.date === today);

        const toTask = (b: any): Task => {
          const { startTime, endTime } = parseTimeSlot(b.time);
          return {
            id:                  b._id,
            bookingId:           b.bookingId || b._id,
            customer:            b.customer  || b.customerName || 'Customer',
            service:             b.service   || b.serviceName  || 'Service',
            address:             b.address   || '—',
            status:              b.status,
            startTime,
            estimatedCompletion: endTime,
            completedAt:         b.taskCompletedAt
              ? new Date(b.taskCompletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined,
          };
        };

        setActiveTasks(
          todayBookings.filter((b: any) => ACTIVE_STATUSES.includes(b.status)).map(toTask)
        );
        setCompletedToday(
          todayBookings.filter((b: any) => b.status === 'completed').map(toTask)
        );
      }
    } catch (err) {
      console.error('GPS load error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { loadTasks(); }, []);

  const openGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const statusBadge = (status: string) => {
    if (status === 'in-progress')
      return 'bg-blue-100 text-blue-800';
    if (status === 'completed')
      return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const statusLabel = (status: string) =>
    status === 'in-progress' ? 'In Progress' : status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <Link to="/staff" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">GPS Tracking</h1>
                <p className="text-gray-600">Track your service locations in real-time</p>
              </div>
            </div>
            <button onClick={loadTasks} className="p-2 text-purple-600 hover:text-purple-800" title="Refresh">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Navigation className="w-6 h-6 text-purple-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">GPS Navigation</h2>
                    <p className="text-sm text-gray-600">{selectedTask.customer} — {selectedTask.service}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                {/* Map placeholder grid */}
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg h-64 flex items-center justify-center relative overflow-hidden mb-6">
                  <div className="absolute inset-0 opacity-20 grid grid-cols-8 grid-rows-4">
                    {[...Array(32)].map((_, i) => (
                      <div key={i} className="border border-gray-300" />
                    ))}
                  </div>
                  <div className="relative z-10 text-center">
                    <Navigation className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-gray-800 mb-1">Route to Service Location</p>
                    <div className="bg-white rounded-lg px-4 py-2 inline-flex items-center gap-2 shadow-sm">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 font-medium">{selectedTask.address}</span>
                    </div>
                  </div>
                </div>

                {/* Booking info */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-sm text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 mb-1">Booking ID</p>
                    <p className="font-semibold text-gray-800">{selectedTask.bookingId}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 mb-1">Start Time</p>
                    <p className="font-semibold text-gray-800">{selectedTask.startTime}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 mb-1">ETA</p>
                    <p className="font-semibold text-gray-800">{selectedTask.estimatedCompletion}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => openGoogleMaps(selectedTask.address)}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Open in Google Maps
                  </button>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-6 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-purple-400" />
            <p>Loading today's tasks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Active Tasks */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Active Tasks</h2>
                <span className="ml-auto text-sm text-gray-500">{activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}</span>
              </div>

              {activeTasks.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Clock className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">No active tasks for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTasks.map(task => (
                    <div key={task.id} className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{task.customer}</p>
                          <p className="text-sm text-gray-600">{task.service}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(task.status)}`}>
                          {statusLabel(task.status)}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-700">{task.address}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>Start: {task.startTime}</span>
                        <span>ETA: {task.estimatedCompletion}</span>
                      </div>
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Navigate to Location
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Today + Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Completed Today</h2>
                  <span className="ml-auto text-sm text-gray-500">{completedToday.length} task{completedToday.length !== 1 ? 's' : ''}</span>
                </div>

                {completedToday.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm">No completed tasks yet today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedToday.map(task => (
                      <div key={task.id} className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{task.customer}</p>
                            <p className="text-sm text-gray-600">{task.service}</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                        </div>
                        <div className="flex items-start gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-700">{task.address}</p>
                        </div>
                        {task.completedAt && (
                          <p className="text-sm text-green-600 font-medium">Completed at {task.completedAt}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Today's Summary */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Today's Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{completedToday.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Completed</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{activeTasks.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Active</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
