import { useRef } from 'react';
import { Download, FileText, Calendar, User, MapPin, Phone, Mail } from 'lucide-react';
import logoImage from '../assets/61e339fdac995bb65c1169259330f5728c465e0f.png';
import homeCleaningImage from '../assets/home-cleaning.jpg';
import curtainCleaningImage from '../assets/curtain-cleaning.jpg';
import laundryCleaningImage from '../assets/laundry-cleaning.jpg';
import shampooVacumImage from '../assets/Shampoo-Vacum.jpg';
import commonServiceImage from '../assets/common-service.jpg';


export type InvoiceType = 'ADVANCE' | 'FINAL' | 'FULL' | 'COD' | 'REFUND' | 'CANCELLATION';

export interface InvoiceData {
  invoiceNumber: string;
  mainCategories?: string[]; // Added to match backend logic
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
    items: Array<{ name: string; price: number; quantity?: number; unit?: string; description?: string }>;
  };
  pricing: {
    subtotal: number;
    discount?: number;
    couponCode?: string;
    taxRate?: number;   // tax percentage e.g. 8 = 8%
    tax?: number;       // calculated tax amount
    transportCharge?: number;
    total: number;
    paidAmount: number;
    balanceAmount: number;
  };
  paymentMethod: string;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'REFUNDED' | 'CANCELLED' | 'SENT' | 'DRAFT';
}

interface InvoiceGeneratorProps {
  invoice: InvoiceData;
  onDownload?: () => void;
}

export default function InvoiceGenerator({ invoice, onDownload }: InvoiceGeneratorProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const getInvoiceTitle = (type: InvoiceType): string => {
    const titles = {
      ADVANCE: 'ADVANCE PAYMENT INVOICE',
      FINAL: 'FINAL INVOICE',
      FULL: 'INVOICE',
      COD: 'CASH ON DELIVERY INVOICE',
      REFUND: 'REFUND INVOICE / CREDIT NOTE',
      CANCELLATION: 'CANCELLATION INVOICE',
    };
    return titles[type] || 'INVOICE';
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      PAID: 'bg-green-100 text-green-700',
      PARTIAL: 'bg-yellow-100 text-yellow-700',
      PENDING: 'bg-orange-100 text-orange-700',
      SENT: 'bg-blue-100 text-blue-700',
      DRAFT: 'bg-gray-100 text-gray-700',
      REFUNDED: 'bg-blue-100 text-blue-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  // Service-specific footer messages based on categories
  const getServiceFooterMessage = (categories: string[]): string => {
    if (!categories || categories.length === 0) return '-- Excellence In Every Clean --';
    if (categories.length > 1) return '-- Comprehensive Care for Your Home --';
    
    const cat = categories[0];
    switch (cat) {
      case 'SVC': return '-- Your Upholstery Deserves The Best --';
      case 'CUR': return '-- Fresh Curtains, Fresh Home --';
      case 'LND': return '-- Clean Clothes, Happy You --';
      case 'HOC': return '-- Excellence In Every Clean --';
      default: return '-- Excellence In Every Clean --';
    }
  };

  // Service-specific terms and conditions based on categories
  const getServiceTerms = (categories: string[]): string[] => {
    const commonTerms = [
      'Cancellations must be made 24 hours in advance for full refund',
      'Quality guarantee - 100% satisfaction or free re-service',
      'For queries, contact us at info@cloudlaundry.lk or +94 11 234 5678',
    ];

    if (!categories || categories.length === 0) return commonTerms;

    const termsMap: Record<string, string[]> = {
      SVC: [
        'Deep steam cleaning with eco-friendly detergents',
        'Drying time: 4-6 hours depending on weather conditions',
      ],
      CUR: [
        'Pickup and delivery service included',
        'Dry cleaning for delicate fabrics',
        'Ironing and rehanging service available',
      ],
      LND: [
        'Garments are processed according to care label instructions',
        'Stain removal is attempted but not guaranteed for old stains',
      ],
      HOC: [
        'Payment due upon completion unless advance paid',
        'Our staff are fully vetted and insured',
      ],
    };

    let specificTerms: string[] = [];
    categories.forEach(cat => {
      if (termsMap[cat]) {
        specificTerms = [...specificTerms, ...termsMap[cat]];
      }
    });

    // Remove duplicates and combine with common terms
    return [...new Set(specificTerms), ...commonTerms];
  };

  const getServiceImage = (categories: string[]): string => {
    if (!categories || categories.length === 0) return '';
    
    // If multiple categories, show the "MULTI" common image
    if (categories.length > 1) {
      return commonServiceImage;
    }

    const cat = categories[0];
    switch (cat) {
      case 'HOC': return homeCleaningImage;
      case 'CUR': return curtainCleaningImage;
      case 'LND': return laundryCleaningImage;
      case 'SVC': return shampooVacumImage;
      default: return '';
    }
  };

  // Check if payment method requires bank details
  const showBankDetails = (): boolean => {
    const method = invoice.paymentMethod?.toLowerCase() || '';
    return method.includes('bank') || method.includes('transfer') || 
           ((invoice.pricing?.balanceAmount || 0) > 0 && invoice.status === 'PARTIAL');
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
          'bg-white'
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
                <tbody className={'bg-white'}>
                  {/* Service Items */}
                  {invoice.service?.items && invoice.service.items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{item.name}</div>
                        {item.description && <div className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{item.description}</div>}
                      </td>
                      <td className="px-4 py-3 text-right">{item.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">{item.quantity || 1}{item.unit ? ` ${item.unit}` : ''}</td>
                      <td className="px-4 py-3 text-right">{((item.quantity || 1) * item.price).toLocaleString()}</td>
                    </tr>
                  ))}
                  
                  {/* Transport Charge */}
                  {(invoice.pricing?.transportCharge || 0) > 0 && (
                    <tr className="border-b">
                      <td className="px-4 py-3">Transport Expense / Pickup & Delivery Charge</td>
                      <td className="px-4 py-3 text-right" colSpan={2}></td>
                      <td className="px-4 py-3 text-right">{(invoice.pricing?.transportCharge || 0).toLocaleString()}</td>
                    </tr>
                  )}

                  {/* Discount */}
                  {(invoice.pricing?.discount || 0) > 0 && (
                    <tr className="border-b bg-green-50">
                      <td className="px-4 py-3 text-green-700">
                        Discount {invoice.pricing?.couponCode ? `(${invoice.pricing.couponCode})` : ''}
                      </td>
                      <td className="px-4 py-3 text-right" colSpan={2}></td>
                      <td className="px-4 py-3 text-right text-green-700">- Rs: {(invoice.pricing?.discount || 0).toLocaleString()}</td>
                    </tr>
                  )}

                  {/* Tax */}
                  {(invoice.pricing?.tax || 0) > 0 && (
                    <tr className="border-b">
                      <td className="px-4 py-3 text-gray-600">
                        Tax {invoice.pricing?.taxRate ? `(${invoice.pricing.taxRate}%)` : ''}
                      </td>
                      <td className="px-4 py-3 text-right" colSpan={2}></td>
                      <td className="px-4 py-3 text-right">{(invoice.pricing?.tax || 0).toLocaleString()}</td>
                    </tr>
                  )}

                  {/* Total */}
                  <tr className="border-t-2 border-gray-300 font-semibold bg-purple-50">
                    <td className="px-4 py-3 text-purple-800">Total Amount</td>
                    <td className="px-4 py-3 text-right" colSpan={2}></td>
                    <td className="px-4 py-3 text-right text-purple-800">Rs: {(invoice.pricing?.total || 0).toLocaleString()}</td>
                  </tr>
                  
                   {/* Payment Details Rows */}
                   <tr className="border-b bg-green-50">
                     <td className="px-4 py-3 text-green-700 font-semibold">Paid Amount</td>
                     <td className="px-4 py-3 text-right" colSpan={2}></td>
                     <td className="px-4 py-3 text-right text-green-700 font-semibold">Rs: {(invoice.pricing?.paidAmount || 0).toLocaleString()}</td>
                   </tr>
                   
                   {(invoice.pricing?.balanceAmount || 0) > 0 && (
                     <tr className="border-b bg-orange-50">
                       <td className="px-4 py-3 text-orange-700 font-semibold">Balance Due</td>
                       <td className="px-4 py-3 text-right" colSpan={2}></td>
                       <td className="px-4 py-3 text-right text-orange-700 font-semibold">Rs: {(invoice.pricing?.balanceAmount || 0).toLocaleString()}</td>
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
            
            <div className={`px-4 py-2 text-sm bg-gray-50 text-gray-600`}>
              Scheduled: {invoice.service?.date || 'N/A'} at {invoice.service?.time || 'N/A'}
            </div>
          </div>

          {/* Bank Details - Show if balance due or bank transfer */}
          {showBankDetails() && (
            <div className={`mt-6 rounded-lg p-6 print:p-4 bg-blue-50 border-2 border-blue-200`}>
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
              {(invoice.pricing?.balanceAmount || 0) > 0 && (
                <p className="mt-4 text-xs text-orange-600 font-semibold">
                  * Please transfer the balance amount of Rs. {(invoice.pricing?.balanceAmount || 0).toLocaleString()} and send payment confirmation to info@cloudlaundry.lk
                </p>
              )}
            </div>
          )}

          {/* QR Code and Terms Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-3 gap-6 print:mt-6">
            <div className="col-span-1">
              <h4 className="text-sm text-gray-600 mb-2 font-semibold">Terms & Conditions:</h4>
              <ul className="text-xs text-gray-500 space-y-1">
                {getServiceTerms(invoice.mainCategories || []).map((term, idx) => (
                  <li key={idx}>• {term}</li>
                ))}
              </ul>
            </div>

            {/* Professional Service Badge Placement */}
            <div className="flex justify-center items-center">
              {getServiceImage(invoice.mainCategories || []) && (
                <div className="relative">
                  <img 
                    src={getServiceImage(invoice.mainCategories || [])} 
                    alt="Service Badge"
                    className="w-24 h-24 object-cover rounded-full border-4 border-purple-50 shadow-sm"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold uppercase tracking-wider">
                    {invoice.mainCategories?.[0] || 'SERVICE'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className={`p-3 rounded-lg bg-gray-100`}>
                {/* Real Scannable QR Code */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Invoice: ${invoice.invoiceNumber}\nBooking: ${invoice.bookingId}\nAmount: Rs. ${invoice.pricing?.total || 0}\nPaid: Rs. ${invoice.pricing?.paidAmount || 0}\nBalance: Rs. ${invoice.pricing?.balanceAmount || 0}\nWebsite: https://cloudlaundry.lk`)}`}
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
            <p className="text-xs mt-1">{getServiceFooterMessage(invoice.mainCategories || [])}</p>
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