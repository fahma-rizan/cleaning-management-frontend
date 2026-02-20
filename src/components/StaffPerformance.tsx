import { Link } from 'react-router';
import { ArrowLeft, TrendingUp, CheckCircle, Clock, Star, Award, Calendar, DollarSign } from 'lucide-react';
import type { User } from '../types';

interface StaffPerformanceProps {
  user: User;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

export default function StaffPerformance({ user }: StaffPerformanceProps) {
  // Mock performance data
  const performanceStats = {
    totalTasks: 145,
    completedTasks: 138,
    pendingTasks: 7,
    avgRating: 4.8,
    totalEarnings: 45600,
    completionRate: 95,
    onTimeDelivery: 97,
  };

  const monthlyData = [
    { month: 'Jan', tasks: 18, earnings: 5400 },
    { month: 'Feb', tasks: 22, earnings: 6600 },
    { month: 'Mar', tasks: 20, earnings: 6000 },
    { month: 'Apr', tasks: 25, earnings: 7500 },
    { month: 'May', tasks: 23, earnings: 6900 },
    { month: 'Jun', tasks: 21, earnings: 6300 },
    { month: 'Jul', tasks: 16, earnings: 4800 },
  ];

  const recentReviews = [
    { customer: 'John Doe', rating: 5, comment: 'Excellent service! Very professional.', date: '2025-02-10' },
    { customer: 'Jane Smith', rating: 5, comment: 'Great job, will book again!', date: '2025-02-08' },
    { customer: 'Mike Wilson', rating: 4, comment: 'Good service, on time delivery.', date: '2025-02-05' },
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
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Track your performance and earnings</p>
        </div>

        {/* Performance Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {performanceStats.completedTasks}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Completed Tasks</p>
            <p className="text-sm text-green-600 mt-1">
              {performanceStats.completionRate}% completion rate
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {performanceStats.pendingTasks}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Pending Tasks</p>
            <p className="text-sm text-blue-600 mt-1">Active assignments</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {performanceStats.avgRating}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Average Rating</p>
            <p className="text-sm text-yellow-600 mt-1">Based on customer reviews</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Rs. {performanceStats.totalEarnings.toLocaleString()}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Total Earnings</p>
            <p className="text-sm text-purple-600 mt-1">This year</p>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Month</th>
                  <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Tasks Completed</th>
                  <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Earnings (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((data, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{data.month}</td>
                    <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">{data.tasks}</td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-semibold">
                      {data.earnings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Customer Reviews</h2>
          </div>
          <div className="space-y-4">
            {recentReviews.map((review, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900 dark:text-white">{review.customer}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
