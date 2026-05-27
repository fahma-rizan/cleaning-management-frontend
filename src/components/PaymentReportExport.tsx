import { useState, useMemo, useEffect } from 'react';
import { Download, FileText, Filter, TrendingUp, TrendingDown, DollarSign, Calendar, Search } from 'lucide-react';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';

const API_BASE_URL = 'http://localhost:4000/api';

interface PaymentReportExportProps {
  user: User;
  limit?: number;
}

interface BookingRecord {
  bookingId: string;
  serviceType: string;
  date: string;
  paymentMethod: string;
  paymentMethodName: string;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  bookingDate: string;
  invoiceNumber?: string;
  customerName?: string;
  customerPhone?: string;
  _id?: string;
  createdAt?: string;
}

const SERVICE_TYPES = ['Home Cleaning', 'Laundry', 'Curtain Cleaning', 'Sofa Cleaning', 'Interior Cleaning', 'Deep Cleaning'];

export default function PaymentReportExport({ user, limit = 0 }: PaymentReportExportProps) {
  const [records, setRecords] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Fetch data from backend API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/invoices`);
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }
        const invoices = await response.json();
        
        // Transform backend invoice data to BookingRecord format
        const transformedRecords = invoices.map((inv: any) => {
          // Extract service type from serviceItems or use a default
          const serviceType = inv.serviceItems?.[0]?.name || 'Cleaning Service';
          
          // Determine payment method
          let paymentMethod = 'full-online';
          if (inv.status === 'PARTIAL') {
            paymentMethod = 'advance-balance';
          } else if (inv.status === 'COD') {
            paymentMethod = 'cod';
          }
          
          return {
            bookingId: inv.bookingId,
            serviceType,
            date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '',
            paymentMethod,
            paymentMethodName: getPaymentMethodName(paymentMethod),
            paidAmount: inv.paidAmount || 0,
            balanceAmount: inv.balanceAmount || 0,
            status: getStatusFromInvoice(inv.status),
            bookingDate: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '',
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customer?.name || '',
            customerPhone: inv.customer?.phone || '',
            _id: inv._id,
            createdAt: inv.createdAt
          };
        });
        
        setRecords(transformedRecords);
      } catch (err: any) {
        setError(err.message);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvoices();
  }, []);
  
  // Helper functions to map backend data
  const getPaymentMethodName = (method: string) => {
    const methodLabel: Record<string, string> = {
      'full-online': 'Online (Full)',
      'advance-balance': 'Advance',
      'cod': 'Cash on Delivery',
      'pay-after-completion': 'Pay After Completion',
    };
    return methodLabel[method] || method;
  };
  
  const getStatusFromInvoice = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'confirmed-paid';
      case 'PARTIAL':
        return 'confirmed-partial';
      case 'COD':
      case 'PENDING':
        return 'confirmed-unpaid';
      default:
        return status;
    }
  };

  const isLimitedView = limit > 0;

  const filtered = useMemo(() => {
    return records.filter(b => {
      const matchesMethod = filterMethod === 'all' || b.paymentMethod === filterMethod;
      const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
      const matchesService = filterService === 'all' || b.serviceType === filterService;
      const matchesCustomer = !filterCustomer || 
        (b.customerName && b.customerName.toLowerCase().includes(filterCustomer.toLowerCase())) ||
        (b.customerPhone && b.customerPhone.toLowerCase().includes(filterCustomer.toLowerCase()));
      const matchesFromDate = !fromDate || new Date(b.date) >= new Date(fromDate);
      const matchesToDate = !toDate || new Date(b.date) <= new Date(toDate);
      return matchesMethod && matchesStatus && matchesService && matchesCustomer && matchesFromDate && matchesToDate;
    }).slice(0, limit || undefined);
  }, [records, filterMethod, filterStatus, filterService, filterCustomer, fromDate, toDate, limit]);

  const paginated = useMemo(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return filtered.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  const totalRevenue = useMemo(() => {
    return filtered.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  }, [filtered]);

  const totalCollected = useMemo(() => {
    return filtered.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  }, [filtered]);

  const totalPending = useMemo(() => {
    return filtered.reduce((sum, b) => sum + (b.balanceAmount || 0), 0);
  }, [filtered]);

  const statusLabel: Record<string, string> = {
    'confirmed-paid': 'Paid',
    'confirmed-partial': 'Partial',
    'confirmed-unpaid': 'COD / Unpaid',
  };

  const methodLabel: Record<string, string> = {
    'full-online': 'Online (Full)',
    'advance-balance': 'Advance',
    'cod': 'Cash on Delivery',
    'pay-after-completion': 'Pay After Completion',
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const headers = [
        'Invoice No.', 'Booking ID', 'Customer Name', 'Customer Phone',
        'Service Type', 'Date', 'Payment Method',
        'Paid Amount (Rs)', 'Balance Amount (Rs)', 'Status',
      ];
      const rows = paginated.map(b => [
        b.invoiceNumber || '—',
        b.bookingId,
        b.customerName || '—',
        b.customerPhone || '—',
        b.serviceType,
        b.date,
        b.paymentMethodName || methodLabel[b.paymentMethod] || b.paymentMethod,
        b.paidAmount || 0,
        b.balanceAmount || 0,
        statusLabel[b.status] || b.status,
      ]);

      const csv = [headers, ...rows]
        .map(row => row.map(c => `"${c}"`).join(','))
        .join('\n');

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payment_Report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 800);
  };

  const clearFilters = () => {
    setFilterMethod('all'); setFilterStatus('all'); setFilterService('all');
    setFilterCustomer(''); setFromDate(''); setToDate('');
  };

  if (isLoading) {
    return (
      <div className={isLimitedView ? '' : 'min-h-screen bg-gray-50'}>
        {!isLimitedView && <DemoTopBar user={user} />}
        <div className={isLimitedView ? '' : 'container mx-auto px-4 py-8 max-w-7xl'}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment records...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={isLimitedView ? '' : 'min-h-screen bg-gray-50'}>
        {!isLimitedView && <DemoTopBar user={user} />}
        <div className={isLimitedView ? '' : 'container mx-auto px-4 py-8 max-w-7xl'}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading payment records</p>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isLimitedView ? '' : 'min-h-screen bg-gray-50'}>
      {!isLimitedView && <DemoTopBar user={user} />}
      <div className={isLimitedView ? '' : 'container mx-auto px-4 py-8 max-w-7xl'}>
        {!isLimitedView && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Payment Report</h1>
              <p className="text-gray-500 mt-1">Filter, review and export payment records</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, sub: `${filtered.length} records`, icon: DollarSign, bg: 'bg-purple-100', ic: 'text-purple-600', val: 'text-gray-900' },
                { label: 'Collected', value: `Rs. ${totalCollected.toLocaleString()}`, sub: 'Received', icon: TrendingUp, bg: 'bg-green-100', ic: 'text-green-600', val: 'text-green-600' },
                { label: 'Pending', value: `Rs. ${totalPending.toLocaleString()}`, sub: 'Balance due', icon: TrendingDown, bg: 'bg-orange-100', ic: 'text-orange-600', val: 'text-orange-600' },
              ].map((card, i) => (
                <div key={i} className={`${card.bg} rounded-xl p-6`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                      <h3 className={`text-2xl font-bold ${card.val}`}>{card.value}</h3>
                      <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-white ${card.ic}`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <h2 className="font-semibold text-gray-700">Filters</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Payment Method */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Payment Method</label>
                  <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                    <option value="all">All Methods</option>
                    <option value="full-online">Online (Full)</option>
                    <option value="advance-balance">Advance</option>
                    <option value="cod">Cash on Delivery</option>
                    <option value="pay-after-completion">Pay After Completion</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                    <option value="all">All Statuses</option>
                    <option value="confirmed-paid">Paid</option>
                    <option value="confirmed-partial">Partial</option>
                    <option value="confirmed-unpaid">COD / Unpaid</option>
                  </select>
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Service Type</label>
                  <select value={filterService} onChange={e => setFilterService(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                    <option value="all">All Services</option>
                    {SERVICE_TYPES.map((service, i) => (
                      <option key={i} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                {/* Customer Search */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Customer</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input type="text" value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)}
                      placeholder="Name or phone"
                      className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* From Date */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={clearFilters} className="text-sm text-purple-600 hover:underline">Clear Filters</button>
              </div>
            </div>
          </>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {!isLimitedView && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-700">Records</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{paginated.length}</span>
              </div>
              <button onClick={handleExport} disabled={exporting || paginated.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  exporting || paginated.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}>
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export to Excel'}
              </button>
            </div>
          )}

          {paginated.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No payment records found</p>
              <p className="text-sm mt-1">Try adjusting your filters or make a booking first</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Invoice No.</th>
                    <th className="px-4 py-3 text-left">Booking ID</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Service</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Payment Method</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((b, i) => (
                    <tr key={b.bookingId || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-mono text-sm">{b.invoiceNumber || '—'}</td>
                      <td className="px-4 py-3 font-mono text-sm">{b.bookingId}</td>
                      <td className="px-4 py-3">{b.customerName || '—'}</td>
                      <td className="px-4 py-3">{b.customerPhone || '—'}</td>
                      <td className="px-4 py-3">{b.serviceType}</td>
                      <td className="px-4 py-3">{b.date}</td>
                      <td className="px-4 py-3">{b.paymentMethodName || methodLabel[b.paymentMethod] || b.paymentMethod}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        `Rs. ${(b.paidAmount || 0).toLocaleString()}`
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-500">
                        {(b.balanceAmount || 0) > 0 ? `Rs. ${(b.balanceAmount || 0).toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          b.status === 'confirmed-paid' ? 'bg-green-100 text-green-700' :
                          b.status === 'confirmed-partial' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {statusLabel[b.status] || b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {!isLimitedView && (
                  <tfoot>
                    <tr className="bg-purple-50 font-semibold text-sm">
                      <td className="px-4 py-4" colSpan={7}>Total ({paginated.length} records)</td>
                      <td className="px-4 py-4 text-right text-green-600">Rs. {totalCollected.toLocaleString()}</td>
                      <td className="px-4 py-4 text-right text-orange-500">Rs. {totalPending.toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLimitedView && totalPages > 1 && (
          <div className="flex items-center justify-center">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border ${
                    currentPage === page
                      ? 'border-purple-500 bg-purple-50 text-purple-600'
                      : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                  } text-sm font-medium`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}