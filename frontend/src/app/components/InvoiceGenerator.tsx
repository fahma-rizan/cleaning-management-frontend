import { useRef } from 'react';
import { Download, FileText, Calendar, User, MapPin, Phone, Mail } from 'lucide-react';
import logoImage from 'figma:asset/61e339fdac995bb65c1169259330f5728c465e0f.png';

export type InvoiceType = 'advance' | 'final' | 'full' | 'cod' | 'refund' | 'cancellation';

export interface InvoiceData {
  invoiceNumber: string;
  invoiceType: InvoiceType;
  date: string;
  time: string;
  bookingId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  service: {
    name: string;
    date: string;
    time: string;
    customizations?: Array<{ name: string; price: number; quantity?: number; unit?: string }>;
  };
  pricing: {
    basePrice: number;
    customizationTotal?: number;
    discount?: number;
    couponCode?: string;
    tax?: number;
    transportCharge?: number;
    total: number;
    paidAmount: number;
    balanceAmount: number;
  };
  paymentMethod: string;
  status: 'paid' | 'partial' | 'pending' | 'refunded' | 'cancelled';
}

interface InvoiceGeneratorProps {
  invoice: InvoiceData;
  onDownload?: () => void;
  theme?: 'light' | 'dark';
}

export default function InvoiceGenerator({ invoice, onDownload, theme = 'light' }: InvoiceGeneratorProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const getInvoiceTitle = (type: InvoiceType): string => {
    const titles = {
      advance: 'ADVANCE PAYMENT INVOICE',
      final: 'FINAL INVOICE',
      full: 'INVOICE',
      cod: 'CASH ON DELIVERY INVOICE',
      refund: 'REFUND INVOICE / CREDIT NOTE',
      cancellation: 'CANCELLATION INVOICE',
    };
    return titles[type] || 'INVOICE';
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      paid: 'bg-green-100 text-green-700',
      partial: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-orange-100 text-orange-700',
      refunded: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  // Service-specific footer messages
  const getServiceFooterMessage = (serviceName: string): string => {
    const name = serviceName.toLowerCase();
    if (name.includes('sofa') || name.includes('upholstery')) {
      return '-- Your Sofa Deserves The Best --';
    } else if (name.includes('mattress')) {
      return '-- Sleep Better, Live Better --';
    } else if (name.includes('carpet') || name.includes('rug')) {
      return '-- Bringing Back The Original Shine --';
    } else if (name.includes('curtain')) {
      return '-- Fresh Curtains, Fresh Home --';
    } else if (name.includes('laundry') || name.includes('wash')) {
      return '-- Clean Clothes, Happy You --';
    } else {
      return '-- Excellence In Every Clean --';
    }
  };

  // Service-specific terms and conditions
  const getServiceTerms = (serviceName: string): string[] => {
    const name = serviceName.toLowerCase();
    const commonTerms = [
      'Cancellations must be made 24 hours in advance for full refund',
      'Quality guarantee - 100% satisfaction or free re-service',
      'For queries, contact us at info@cloudlaundry.lk or +94 11 234 5678',
    ];

    let specificTerms: string[] = [];
    
    if (name.includes('sofa') || name.includes('upholstery')) {
      specificTerms = [
        'Deep steam cleaning with eco-friendly detergents',
        'Fabric protection treatment available upon request',
        'Drying time: 4-6 hours depending on weather conditions',
      ];
    } else if (name.includes('mattress')) {
      specificTerms = [
        'UV sanitization and dust mite removal included',
        'Recommended to air mattress for 2-3 hours after service',
        'Anti-allergen treatment available at additional cost',
      ];
    } else if (name.includes('carpet') || name.includes('rug')) {
      specificTerms = [
        'Professional hot water extraction method used',
        'Color restoration and stain removal treatment included',
        'Avoid walking on carpet for 2-3 hours after cleaning',
      ];
    } else if (name.includes('curtain')) {
      specificTerms = [
        'Pickup and delivery service included',
        'Dry cleaning for delicate fabrics',
        'Ironing and rehanging service available',
      ];
    } else {
      specificTerms = [
        'Payment due upon completion unless advance paid',
      ];
    }

    return [...specificTerms, ...commonTerms];
  };

  // Check if payment method requires bank details
  const showBankDetails = (): boolean => {
    const method = invoice.paymentMethod.toLowerCase();
    return method.includes('bank') || method.includes('transfer') || 
           (invoice.pricing.balanceAmount > 0 && invoice.status === 'partial');
  };

  const handleDownload = () => {
    // Trigger callback
    if (onDownload) {
      onDownload();
    }
    
    // Use browser's native print dialog which allows saving as PDF
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-4">
      {/* Invoice Preview - A4 Size */}
      <div 
        ref={invoiceRef}
        className={`invoice-printable mx-auto rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
        }`}
        style={{
          width: '210mm',
          minHeight: '297mm',
          maxWidth: '100%',
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8 print:p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <img 
                src={logoImage} 
                alt="Cloud Laundry Logo" 
                className="w-20 h-20 object-contain bg-white rounded-lg p-2"
              />
              <div>
                <h1 className="text-4xl mb-2 print:text-3xl">CLOUD LAUNDRY.LK</h1>
                <p className="text-purple-100">Professional Cleaning Services</p>
                <div className="mt-4 space-y-1 text-sm text-purple-100">
                  <p>📍 Colombo, Sri Lanka</p>
                  <p>📞 +94 11 234 5678</p>
                  <p>✉️ info@cloudlaundry.lk</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white text-purple-600 px-4 py-2 rounded-lg mb-3">
                <FileText className="w-8 h-8 mx-auto mb-1" />
                <div className="text-xs">INVOICE</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                {invoice.status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-8 print:p-6">
          {/* Invoice Info Row */}
          <div className="grid grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg mb-4 print:text-base">{getInvoiceTitle(invoice.invoiceType)}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-mono">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-mono">{invoice.bookingId}</span>
                </div>
                <div className="flex gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{invoice.date} at {invoice.time}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg mb-4 print:text-base">Customer Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{invoice.customer.name}</span>
                </div>
                <div className="flex gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{invoice.customer.email}</span>
                </div>
                <div className="flex gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{invoice.customer.phone}</span>
                </div>
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-xs">{invoice.customer.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-8">
            {/* Service Description Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-600 text-white text-sm">
                    <th className="px-4 py-2 text-left border-r border-purple-500">Service Description</th>
                    <th className="px-4 py-2 text-right border-r border-purple-500">Price</th>
                    <th className="px-4 py-2 text-center border-r border-purple-500">Sqft/ Unit</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className={theme === 'dark' ? 'bg-gray-700' : 'bg-white'}>
                  <tr className="border-b">
                    <td className="px-4 py-3">{invoice.service.name}</td>
                    <td className="px-4 py-3 text-right">{invoice.pricing.basePrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">1</td>
                    <td className="px-4 py-3 text-right">{invoice.pricing.basePrice.toLocaleString()}</td>
                  </tr>
                  
                  {/* Customizations */}
                  {invoice.service.customizations && invoice.service.customizations.length > 0 && invoice.service.customizations.map((custom, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-3">{custom.name}</td>
                      <td className="px-4 py-3 text-right">{custom.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">{custom.quantity || 1}</td>
                      <td className="px-4 py-3 text-right">{((custom.quantity || 1) * custom.price).toLocaleString()}</td>
                    </tr>
                  ))}
                  
                  {/* Transport Charge */}
                  <tr className="border-b">
                    <td className="px-4 py-3">Transport Expense/ pickup and delivery charge</td>
                    <td className="px-4 py-3 text-right" colSpan={2}></td>
                    <td className="px-4 py-3 text-right">{(invoice.pricing.transportCharge || 0).toLocaleString()}</td>
                  </tr>
                  
                  {/* Sub Total */}
                  <tr className="border-t-2 border-gray-300 font-semibold">
                    <td className="px-4 py-3">Sub Total</td>
                    <td className="px-4 py-3 text-right" colSpan={2}></td>
                    <td className="px-4 py-3 text-right">Rs: {invoice.pricing.total.toLocaleString()}</td>
                  </tr>
                  
                  {/* Payment Details Rows */}
                  <tr className="border-b bg-green-50">
                    <td className="px-4 py-3 text-green-700 font-semibold">Paid Amount</td>
                    <td className="px-4 py-3 text-right" colSpan={2}></td>
                    <td className="px-4 py-3 text-right text-green-700 font-semibold">Rs: {invoice.pricing.paidAmount.toLocaleString()}</td>
                  </tr>
                  
                  {invoice.pricing.balanceAmount > 0 && (
                    <tr className="border-b bg-orange-50">
                      <td className="px-4 py-3 text-orange-700 font-semibold">Balance Due</td>
                      <td className="px-4 py-3 text-right" colSpan={2}></td>
                      <td className="px-4 py-3 text-right text-orange-700 font-semibold">Rs: {invoice.pricing.balanceAmount.toLocaleString()}</td>
                    </tr>
                  )}
                  
                  {/* Payment Method Row */}
                  <tr className="border-b bg-purple-50">
                    <td className="px-4 py-3 text-purple-700 font-semibold">Payment Method</td>
                    <td className="px-4 py-3 text-right" colSpan={2}></td>
                    <td className="px-4 py-3 text-right text-purple-700 font-semibold">{invoice.paymentMethod}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className={`px-4 py-2 text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} text-gray-600`}>
              Scheduled: {invoice.service.date} at {invoice.service.time}
            </div>
          </div>

          {/* Bank Details - Show if balance due or bank transfer */}
          {showBankDetails() && (
            <div className={`mt-6 rounded-lg p-6 print:p-4 ${theme === 'dark' ? 'bg-blue-900/20 border-2 border-blue-700' : 'bg-blue-50 border-2 border-blue-200'}`}>
              <h4 className="text-sm font-semibold mb-3 text-blue-900 dark:text-blue-300">Bank Transfer Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Bank Name:</p>
                  <p className="font-semibold">Commercial Bank</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Account Name:</p>
                  <p className="font-semibold">CLOUD LAUNDRY.LK AND CLEANERS (PVT) LTD.</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Account Number:</p>
                  <p className="font-semibold font-mono">1000906392</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Branch:</p>
                  <p className="font-semibold">Malabe</p>
                </div>
              </div>
              {invoice.pricing.balanceAmount > 0 && (
                <p className="mt-4 text-xs text-orange-600 font-semibold">
                  * Please transfer the balance amount of Rs. {invoice.pricing.balanceAmount.toLocaleString()} and send payment confirmation to info@cloudlaundry.lk
                </p>
              )}
            </div>
          )}

          {/* QR Code and Terms Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-3 gap-6 print:mt-6">
            <div className="col-span-2">
              <h4 className="text-sm text-gray-600 mb-2 font-semibold">Terms & Conditions:</h4>
              <ul className="text-xs text-gray-500 space-y-1">
                {getServiceTerms(invoice.service.name).map((term, idx) => (
                  <li key={idx}>• {term}</li>
                ))}
              </ul>
            </div>
            
            <div className="text-center">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {/* Real Scannable QR Code */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Invoice: ${invoice.invoiceNumber}\nBooking: ${invoice.bookingId}\nAmount: Rs. ${invoice.pricing.total}\nPaid: Rs. ${invoice.pricing.paidAmount}\nBalance: Rs. ${invoice.pricing.balanceAmount}\nWebsite: https://cloudlaundry.lk`)}`}
                  alt="Invoice QR Code"
                  className="w-24 h-24 mx-auto"
                />
                <p className="text-xs text-gray-500 mt-2">Scan for details</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500 print:mt-6">
            <p className="font-semibold">Thank you for choosing Cloud Laundry.LK</p>
            <p className="text-xs mt-1">This is a computer-generated invoice and does not require a signature</p>
            <p className="text-xs mt-1">{getServiceFooterMessage(invoice.service.name)}</p>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center print:hidden">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download Invoice (PDF)
        </button>
      </div>
    </div>
  );
}