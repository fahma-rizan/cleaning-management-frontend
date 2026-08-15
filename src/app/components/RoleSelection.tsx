import { Link } from 'react-router-dom';
import { Users, Shield, UserCheck, Sparkles, ArrowLeft } from 'lucide-react';

export default function RoleSelection() {
  const roles = [
    {
      type: 'customer',
      title: 'Customer',
      description: 'Book cleaning services for your home or office',
      icon: Users,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      link: '/register/customer',
    },
    {
      type: 'staff',
      title: 'Staff',
      description: 'Join our team and provide professional cleaning services',
      icon: UserCheck,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      link: '/register/staff',
    },
    {
      type: 'admin',
      title: 'Admin',
      description: 'Full system access and management',
      icon: Shield,
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      link: '/register/admin',
      restricted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-600 dark:bg-purple-700 p-4 rounded-full">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 dark:text-white">Join CLOUD LAUNDRY.LK</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Select your account type to get started</p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.type}
                to={role.link}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className={`${role.color} p-6 text-center`}>
                  <Icon className="w-12 h-12 text-white mx-auto" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 dark:text-white flex items-center justify-between">
                    {role.title}
                    {role.restricted && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full">
                        Restricted
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {role.description}
                  </p>
                  <div className={`mt-4 ${role.color} ${role.hoverColor} text-white text-center py-2 rounded-lg transition-colors`}>
                    Register
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
          <h3 className="font-semibold mb-3 dark:text-white">Registration Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">●</span>
              <span><strong>Customers</strong> can book and manage cleaning services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">●</span>
              <span><strong>Staff</strong> need to provide profile photo and require admin approval</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">●</span>
              <span><strong>Admin</strong> registration requires a special access code from management</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}