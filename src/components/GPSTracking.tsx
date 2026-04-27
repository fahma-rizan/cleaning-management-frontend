import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, CheckCircle, Clock } from 'lucide-react';
import type { User } from '../types';

interface GPSTrackingProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function GPSTracking({ user }: GPSTrackingProps) {
  // Mock active tasks with locations
  const activeTasks = [
    {
      id: 'T001',
      customer: 'John Doe',
      service: 'Home Cleaning',
      address: '123 Main St, Colombo 7',
      location: { lat: 6.9271, lng: 79.8612 },
      status: 'in-progress',
      startTime: '10:00 AM',
      estimatedCompletion: '12:00 PM',
    },
    {
      id: 'T002',
      customer: 'Jane Smith',
      service: 'Laundry Service',
      address: '456 Galle Road, Colombo 3',
      location: { lat: 6.9147, lng: 79.8501 },
      status: 'pending',
      startTime: '02:00 PM',
      estimatedCompletion: '04:00 PM',
    },
  ];

  const completedToday = [
    {
      id: 'T003',
      customer: 'Mike Wilson',
      service: 'Office Cleaning',
      address: '789 Union Place, Colombo 2',
      completedAt: '09:30 AM',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/staff"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GPS Tracking</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Track your service locations in real-time</p>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                {[...Array(64)].map((_, i) => (
                  <div key={i} className="border border-gray-300 dark:border-gray-600"></div>
                ))}
              </div>
            </div>
            <div className="relative z-10 text-center">
              <Navigation className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                GPS Map View
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Interactive map showing service locations
              </p>
              <div className="mt-4 flex gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Current Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Task Location</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Tasks</h2>
            </div>
            <div className="space-y-4">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{task.customer}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{task.service}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{task.address}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Start: {task.startTime}</span>
                    <span>ETA: {task.estimatedCompletion}</span>
                  </div>
                  <button className="mt-3 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                    Navigate to Location
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Today */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Completed Today</h2>
            </div>
            <div className="space-y-4">
              {completedToday.map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{task.customer}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{task.service}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{task.address}</p>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Completed at {task.completedAt}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats Summary */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Today's Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{completedToday.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{activeTasks.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}