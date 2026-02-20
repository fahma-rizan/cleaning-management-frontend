import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  actionLink?: string;
  action?: ReactNode;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  actionLabel, 
  actionLink,
  action
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
        <Icon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
      </div>
      <h3 className="text-2xl mb-3 dark:text-white font-medium">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
        {message}
      </p>
      {action ? action : actionLink && actionLabel && (
        <Link
          to={actionLink}
          className="inline-block bg-purple-600 dark:bg-purple-700 text-white px-8 py-3 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors font-medium shadow-lg hover:shadow-xl"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}