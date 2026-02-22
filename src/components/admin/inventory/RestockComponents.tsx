import React from 'react';
import { Check, Clock, CreditCard, AlertCircle, TrendingUp, TrendingDown, Package, DollarSign } from 'lucide-react';

// ============ BUTTONS ============

interface PrimaryRestockButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const PrimaryRestockButton: React.FC<PrimaryRestockButtonProps> = ({ 
  onClick, 
  disabled, 
  children, 
  icon,
  className = '' 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] 
    active:bg-[#1e40af] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-semibold 
    text-sm shadow-sm hover:shadow-md ${className}`}
  >
    {icon && <span className="w-5 h-5">{icon}</span>}
    {children}
  </button>
);

export const SecondaryButton: React.FC<PrimaryRestockButtonProps> = ({ 
  onClick, 
  disabled, 
  children, 
  icon,
  className = '' 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 
    rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed 
    transition-all font-semibold text-sm ${className}`}
  >
    {icon && <span className="w-5 h-5">{icon}</span>}
    {children}
  </button>
);

export const DangerButton: React.FC<PrimaryRestockButtonProps> = ({ 
  onClick, 
  disabled, 
  children, 
  icon,
  className = '' 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 
    rounded-lg hover:bg-red-100 active:bg-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed 
    transition-all font-medium text-sm ${className}`}
  >
    {icon && <span className="w-4 h-4">{icon}</span>}
    {children}
  </button>
);

export const TextButton: React.FC<PrimaryRestockButtonProps> = ({ 
  onClick, 
  disabled, 
  children, 
  className = '' 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed 
    transition-colors font-medium text-sm ${className}`}
  >
    {children}
  </button>
);

// ============ BADGES ============

interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'credit' | 'normal' | 'low' | 'critical';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const styles = {
    paid: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-orange-100 text-orange-700 border-orange-200',
    credit: 'bg-blue-100 text-blue-700 border-blue-200',
    normal: 'bg-green-100 text-green-700 border-green-200',
    low: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
  };

  const icons = {
    paid: <Check className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
    credit: <CreditCard className="w-3 h-3" />,
    normal: <Check className="w-3 h-3" />,
    low: <AlertCircle className="w-3 h-3" />,
    critical: <AlertCircle className="w-3 h-3" />,
  };

  const labels = {
    paid: 'Paid',
    pending: 'Pending',
    credit: 'Credit',
    normal: 'Normal',
    low: 'Low Stock',
    critical: 'Critical',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]} ${className}`}>
      {icons[status]}
      {labels[status]}
    </span>
  );
};

export const ServiceBadge: React.FC<{ service: string }> = ({ service }) => (
  <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-medium">
    {service}
  </span>
);

// ============ CARDS ============

interface SummaryStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconBgColor?: string;
}

export const SummaryStatCard: React.FC<SummaryStatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend,
  iconBgColor = 'bg-blue-100'
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${iconBgColor}`}>
        {icon}
      </div>
    </div>
  </div>
);

interface QuickRestockCardProps {
  material: {
    id: number;
    name: string;
    icon: string;
    currentStock: number;
    unit: string;
    minThreshold: number;
    status: 'normal' | 'low' | 'critical';
  };
  onRestock: () => void;
}

export const QuickRestockCard: React.FC<QuickRestockCardProps> = ({ material, onRestock }) => {
  const statusColors = {
    normal: 'text-green-600',
    low: 'text-orange-600',
    critical: 'text-red-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{material.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm mb-1">{material.name}</h4>
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-bold text-sm ${statusColors[material.status]}`}>
              {material.currentStock} {material.unit}
            </span>
            <StatusBadge status={material.status} />
          </div>
          <p className="text-xs text-gray-500">Min: {material.minThreshold} {material.unit}</p>
        </div>
        <PrimaryRestockButton onClick={onRestock} className="px-3 py-1.5 text-xs">
          Restock
        </PrimaryRestockButton>
      </div>
    </div>
  );
};

// ============ INPUT FIELDS ============

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 9999,
  label,
  className = '' 
}) => (
  <div className={className}>
    {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-colors"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || 0)))}
        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-center font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        min={min}
        max={max}
      />
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-colors"
      >
        +
      </button>
    </div>
  </div>
);

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, label, className = '' }) => (
  <div className={className}>
    {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step="0.01"
        min="0"
        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="0.00"
      />
    </div>
  </div>
);

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept = '.pdf,.jpg,.jpeg,.png', label }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-4xl mb-2">📎</div>
          <p className="text-sm text-gray-600">Drop file here or click to browse</p>
          <p className="text-xs text-gray-500 mt-1">Supported: PDF, JPG, PNG</p>
        </label>
      </div>
    </div>
  );
};

// ============ PROGRESS BAR ============

interface ProgressBarProps {
  percentage: number;
  color?: 'green' | 'orange' | 'red';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, color = 'green' }) => {
  const colors = {
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        className={`h-full ${colors[color]} transition-all duration-300`}
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  );
};
