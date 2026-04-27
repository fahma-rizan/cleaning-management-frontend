import { useState } from 'react';
import { CreditCard, Wallet, Banknote, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

interface PaymentOptionsProps {
  totalAmount: number;
  serviceDetails: {
    serviceName: string;
    customizations?: string[];
    discountApplied?: number;
    couponCode?: string;
  };
  onPaymentMethodSelect: (method: string, advancePercentage?: number) => void;
  theme?: 'light' | 'dark';
  bookingData?: any;
}

export default function PaymentOptions({ 
  totalAmount, 
  serviceDetails, 
  onPaymentMethodSelect,
  theme = 'light',
  bookingData
}: PaymentOptionsProps) {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [advancePercentage] = useState(20); // Fixed 20% advance

  const advanceAmount = Math.round(totalAmount * (advancePercentage / 100));
  const balanceAmount = totalAmount - advanceAmount;

  const paymentMethods = [
    {
      id: 'full-online',
      name: 'Pay Full Amount Online',
      description: 'Pay the complete amount now and confirm your booking',
      icon: CreditCard,
      amount: totalAmount,
      badge: 'Instant Confirmation',
      badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      id: 'advance-balance',
      name: 'Pay Advance (20%)',
      description: `Pay Rs. ${advanceAmount.toLocaleString()} now, Rs. ${balanceAmount.toLocaleString()} after service`,
      icon: Wallet,
      amount: advanceAmount,
      badge: 'Most Popular',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay cash to our service professional after completion',
      icon: Banknote,
      amount: 0,
      badge: 'Pay Later',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      id: 'pay-after-completion',
      name: 'Online Payment After Completion',
      description: 'Complete service first, pay online later',
      icon: Clock,
      amount: 0,
      badge: 'Service First',
      badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    onPaymentMethodSelect(methodId, methodId === 'advance-balance' ? advancePercentage : undefined);
  };

  const getPaymentAmount = () => {
    return selectedMethod === 'advance-balance' ? advanceAmount : totalAmount;
  };

  return (
    <div className={`space-y-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Price Breakdown */}
      <div className={`rounded-xl p-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl mb-4">Price Breakdown</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Service: {serviceDetails.serviceName}
            </span>
            <span>Rs. {totalAmount.toLocaleString()}</span>
          </div>
          
          {serviceDetails.customizations && serviceDetails.customizations.length > 0 && (
            <div className="border-t pt-3">
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Customizations:
              </p>
              {serviceDetails.customizations.map((custom, idx) => (
                <div key={idx} className="flex justify-between text-sm ml-4">
                  <span>{custom}</span>
                </div>
              ))}
            </div>
          )}
          
          {serviceDetails.discountApplied && serviceDetails.discountApplied > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({serviceDetails.couponCode})</span>
              <span>- Rs. {serviceDetails.discountApplied.toLocaleString()}</span>
            </div>
          )}
          
          <div className={`border-t pt-3 flex justify-between text-xl ${theme === 'dark' ? 'border-gray-700' : ''}`}>
            <span>Total Amount</span>
            <span className="text-purple-600">Rs. {totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className={`rounded-xl p-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl mb-4">Select Payment Method</h2>
        <div className="space-y-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => handleMethodSelect(method.id)}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-700 hover:border-purple-400'
                      : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      isSelected 
                        ? 'bg-purple-100 dark:bg-purple-900/50' 
                        : 'bg-gray-100 dark:bg-gray-600'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg">{method.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${method.badgeColor}`}>
                          {method.badge}
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {method.description}
                      </p>
                      {method.id === 'advance-balance' && (
                        <div className={`mt-2 p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'
                        }`}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-purple-700 dark:text-purple-400">Pay Now:</span>
                            <span className="text-purple-900 dark:text-purple-300">Rs. {advanceAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-purple-700 dark:text-purple-400">Pay After Service:</span>
                            <span className="text-purple-900 dark:text-purple-300">Rs. {balanceAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {method.amount > 0 ? (
                      <div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Pay Now
                        </div>
                        <div className="text-xl text-purple-600 dark:text-purple-400">
                          Rs. {method.amount.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        No advance payment
                      </div>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-3 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Selected</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Information Box */}
      <div className={`rounded-xl p-5 border-2 ${
        theme === 'dark' 
          ? 'bg-blue-900/20 border-blue-700' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex gap-3">
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <div className="text-sm">
            <p className="mb-2"><strong>Payment Information:</strong></p>
            <ul className="space-y-1 list-disc ml-4">
              <li>All online payments are secure and encrypted</li>
              <li>You will receive an invoice immediately after payment</li>
              <li>Cancellation refunds are processed within 5-7 business days</li>
              <li>COD payments must be made to the service professional</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}