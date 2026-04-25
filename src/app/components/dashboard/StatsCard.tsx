import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  bgColor?: string;
  iconColor?: string;
}

export default function StatsCard({ icon: Icon, value, label, bgColor = 'bg-blue-100 dark:bg-blue-900/30', iconColor = 'text-blue-600 dark:text-blue-400' }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <span className="text-3xl dark:text-white font-bold">{value}</span>
      </div>
      <h3 className="text-gray-600 dark:text-gray-300">{label}</h3>
    </div>
  );
}