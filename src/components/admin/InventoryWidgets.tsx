import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, AlertTriangle, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';

interface InventoryWidgetsProps {
  theme?: 'light' | 'dark';
}

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minThreshold: number;
  costPerUnit: number;
  unit: string;
}

export default function InventoryWidgets({ theme = 'light' }: InventoryWidgetsProps) {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [materialsUsedToday, setMaterialsUsedToday] = useState(0);
  const [monthlyCost, setMonthlyCost] = useState(0);
  const [recentUpdates, setRecentUpdates] = useState<string[]>([]);

  useEffect(() => {
    // Load inventory items
    const storedItems = localStorage.getItem('inventoryItems');
    if (storedItems) {
      const items: InventoryItem[] = JSON.parse(storedItems);
      
      // Calculate low stock count
      const lowStock = items.filter(item => item.currentStock <= item.minThreshold);
      setLowStockCount(lowStock.length);
    }

    // Load usage records
    const storedRecords = localStorage.getItem('materialUsageRecords');
    if (storedRecords) {
      const records = JSON.parse(storedRecords);
      
      // Materials used today
      const today = new Date().toDateString();
      const todayRecords = records.filter((r: any) => 
        new Date(r.date).toDateString() === today
      );
      const todayMaterials = todayRecords.reduce((sum: number, r: any) => 
        sum + r.items.length, 0
      );
      setMaterialsUsedToday(todayMaterials);

      // Monthly cost
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRecords = records.filter((r: any) => {
        const date = new Date(r.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      const monthCost = monthlyRecords.reduce((sum: number, r: any) => 
        sum + r.totalCost, 0
      );
      setMonthlyCost(monthCost);

      // Recent updates (last 3)
      const recent = records
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map((r: any) => `${r.jobType} - ${r.items.length} items used`);
      setRecentUpdates(recent);
    }
  }, []);

  const widgets = [
    {
      title: 'Low Stock Items',
      value: lowStockCount,
      icon: AlertTriangle,
      color: 'red',
      bgColor: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50',
      iconBg: 'bg-red-500',
      textColor: theme === 'dark' ? 'text-red-400' : 'text-red-600',
      link: '/admin/inventory/low-stock',
      description: 'Need restocking'
    },
    {
      title: 'Materials Used Today',
      value: materialsUsedToday,
      icon: Package,
      color: 'blue',
      bgColor: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50',
      iconBg: 'bg-blue-500',
      textColor: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      link: '/admin/inventory/reports',
      description: 'Items consumed'
    },
    {
      title: 'Monthly Material Cost',
      value: `LKR ${monthlyCost.toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
      bgColor: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50',
      iconBg: 'bg-green-500',
      textColor: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      link: '/admin/inventory/reports',
      description: 'This month'
    },
    {
      title: 'Recent Stock Updates',
      value: recentUpdates.length,
      icon: TrendingUp,
      color: 'purple',
      bgColor: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50',
      iconBg: 'bg-purple-500',
      textColor: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      link: '/admin/inventory',
      description: 'Last 24 hours',
      list: recentUpdates
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {widgets.map((widget, index) => (
        <Link
          key={index}
          to={widget.link}
          className={`p-5 rounded-xl shadow-sm border transition-all hover:shadow-md ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className={`text-sm mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {widget.title}
              </p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {widget.value}
              </p>
              <p className={`text-xs mt-1 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {widget.description}
              </p>
            </div>
            <div className={`${widget.iconBg} p-3 rounded-lg`}>
              <widget.icon className="w-5 h-5 text-white" />
            </div>
          </div>

          {widget.list && widget.list.length > 0 && (
            <div className={`mt-3 pt-3 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="space-y-1">
                {widget.list.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    • {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`flex items-center gap-1 mt-3 text-sm ${widget.textColor}`}>
            View Details
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      ))}
    </div>
  );
}