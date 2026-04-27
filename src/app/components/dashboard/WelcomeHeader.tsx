import { Award, UserCircle } from 'lucide-react';

interface WelcomeHeaderProps {
  name: string;
}

export default function WelcomeHeader({ name }: WelcomeHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl mb-2 dark:text-white font-bold">
        Welcome back, <span className="text-3xl">{name}</span>! 👋
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-lg">
        Manage your bookings and account settings
      </p>
    </div>
  );
}