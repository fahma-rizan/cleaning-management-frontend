import { useState, useMemo, useEffect } from 'react';
import { Download, FileText, Filter, TrendingUp, TrendingDown, DollarSign, Calendar, Search } from 'lucide-react';
import type { User } from '../types';
import DemoTopBar from './DemoTopBar';

const API_BASE_URL = 'http://localhost:4000/api';

// FIX (task #17): local-timezone 'YYYY-MM-DD', unlike toISOString() which is
// UTC-based and can roll the date back/forward a day depending on the
// machine's timezone offset.
const toLocalISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

interface PaymentReportExportProps {
  user: User;
  limit?: number;
}

interface BookingRecord {
  bookingId: string;
  serviceType: string;
  // The 4 real main categories this invoice belongs to (from the Invoice
  // document's own mainCategories field — the same categorization the
  // backend uses everywhere else, e.g. Financial Dashboard's category
  // filter). A multi-service invoice can belong to more than one.
  mainCategories: string[];
  date: string;
  // FIX (task #17): plain local-timezone 'YYYY-MM-DD' used ONLY for date-range
  // filtering. `date`/`bookingDate` (toLocaleDateString(), e.g. "8/21/2026")
  // are for display only — parsing that format back with `new Date(...)` for
  // comparison against the <input type="date"> value (which new Date() parses
  // as UTC midnight) drifted by the local UTC offset and silently dropped or
  // included boundary-day records. String-comparing ISO dates avoids Date
  // parsing entirely.
  dateISO: string;
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
  // NEW — the real Invoice.status value (DRAFT/SENT/PAID/UNPAID/PARTIAL/...),
  // kept alongside the coarser `status` bucket above so per-leg merged rows
  // (see `legs` below) can show an accurate label instead of re-deriving it.
  rawStatus?: string;
  // NEW — true for a booking's linked `-BAL` invoice (see
  // controllers/invoiceController.js's createBalanceInvoice /
  // models/Invoice.js's isBalanceInvoice field).
  isBalanceInvoice?: boolean;
  // NEW — set only on a merged row (an Advance+Balance booking whose
  // balance has been settled, so it has TWO Invoice documents sharing one
  // bookingId). One entry per leg, so the table can show "Advance: Paid"
  // / "Balance: Paid" (or Unpaid/Pending) in the same row instead of two
  // separate rows that each looked like an unrelated, half-finished payment.
  legs?: { label: string; amount: number; rawStatus: string }[];
}

// FIX: there are only 4 real service categories in this system — LND/CUR/
// SVC/HOC, the same 4 the Invoice model's mainCategories field and every
// other admin page (Financial Dashboard's category filter, invoiceUtils.js)
// already use. This dropdown previously hardcoded 6 raw service NAMES
// ('Home Cleaning', 'Sofa Cleaning', 'Interior Cleaning', 'Deep Cleaning',
// etc.) that didn't map to that category system at all, was missing
// 'Shampoo Vacuum'/'Office Cleaning'/etc. entirely, and filtered against
// records' raw first-service-item name instead of their real category —
// so a "Sofa Cleaning" or "Deep Cleaning" booking never showed up grouped
// with anything else, and there was no way to see "all Home/Office
// Cleaning revenue" the way the rest of the app can.
const MAIN_CATEGORIES: { code: string; label: string }[] = [
  { code: 'LND', label: 'Laundry' },
  { code: 'CUR', label: 'Curtain Cleaning' },
  { code: 'SVC', label: 'Shampoo Vacuum Cleaning' },
  { code: 'HOC', label: 'Home / Office Cleaning' },
];
const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(MAIN_CATEGORIES.map(c => [c.code, c.label]));

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
          
          // FIX: this used to check inv.status === 'COD', but 'COD' is
          // never a valid status value (it's an invoiceType value — status
          // is PAID/PARTIAL/UNPAID/etc.), so that branch could never match.
          // Everything that wasn't PARTIAL silently fell back to
          // 'full-online' — meaning every COD and Pay-After-Completion
          // invoice was mislabeled as Full Online here. The Invoice model
          // already carries a real paymentMethod label on every invoice
          // (set by routes/payhere.js and routes/booking.js at creation
          // time — 'Full Online', 'Advance + Balance', 'Cash on Delivery',
          // 'Online Payment After Completion', etc.) — read that directly
          // instead of guessing from status.
          const rawMethod = (inv.paymentMethod || '').toLowerCase();
          let paymentMethod = 'full-online';
          // FIX (Tier 1.4): routes/booking.js and controllers/invoiceController.js
          // now label a cash-settled advance-balance invoice 'COD' and an
          // online one 'Online Balance Payment' (spec-mandated — see the
          // label-change comments at those call sites), replacing the old
          // 'Advance + Balance (Cash)'/'(Online)' strings this parsing was
          // written against. 'cod' === exact match handles the new cash
          // label without also matching real Cash-on-Delivery invoices
          // (whose label is the full phrase 'Cash on Delivery', matched
          // separately below) — deliberately bucketing both as the same
          // 'cod' report category since both are "cash collected in person,
          // no gateway involved". 'online balance' is checked before the
          // generic 'advance' check since it no longer contains that word.
          if (rawMethod === 'cod' || rawMethod.includes('cash on delivery')) {
            paymentMethod = 'cod';
          } else if (rawMethod.includes('online balance')) {
            paymentMethod = 'advance-balance';
          } else if (rawMethod.includes('pay after') || rawMethod.includes('after completion')) {
            paymentMethod = 'pay-after-completion';
          } else if (rawMethod.includes('advance')) {
            paymentMethod = 'advance-balance';
          } else if (rawMethod.includes('full online')) {
            paymentMethod = 'full-online';
          } else {
            // Unrecognised/blank paymentMethod (shouldn't normally happen) —
            // fall back to the invoice status instead of silently mislabeling
            // it as Full Online.
            paymentMethod = inv.status === 'PARTIAL' ? 'advance-balance' : 'full-online';
          }

          return {
            bookingId: inv.bookingId,
            serviceType,
            // FIX: use the invoice's real mainCategories field instead of
            // re-deriving anything from the raw service name — this is the
            // exact same field Financial Dashboard's category filter reads,
            // so this report now agrees with the rest of the app about
            // which category a booking belongs to.
            mainCategories: inv.mainCategories || [],
            date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '',
            dateISO: inv.createdAt ? toLocalISODate(new Date(inv.createdAt)) : '',
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
            createdAt: inv.createdAt,
            rawStatus: inv.status,
            isBalanceInvoice: !!inv.isBalanceInvoice,
          };
        });

        // NEW — merge an Advance+Balance booking's two invoices (the
        // original advance invoice + its linked `-BAL` invoice, once the
        // balance has been settled) into ONE row instead of two. Both
        // share the same bookingId (populated as the human-readable code
        // by getAllInvoices — see controllers/invoiceController.js).
        // Every other payment method only ever has one invoice per
        // booking, so those groups pass through unchanged below.
        const byBooking = new Map<string, typeof transformedRecords>();
        transformedRecords.forEach((r: BookingRecord) => {
          const key = r.bookingId || r._id || `${Math.random()}`;
          if (!byBooking.has(key)) byBooking.set(key, []);
          byBooking.get(key)!.push(r);
        });

        const mergedRecords: BookingRecord[] = [];
        byBooking.forEach(group => {
          if (group.length <= 1) {
            mergedRecords.push(...group);
            return;
          }
          const balanceLeg = group.find(r => r.isBalanceInvoice) || group[group.length - 1];
          const advanceLeg = group.find(r => !r.isBalanceInvoice) || group[0];
          const bothPaid = advanceLeg.rawStatus === 'PAID' && balanceLeg.rawStatus === 'PAID';
          mergedRecords.push({
            ...advanceLeg,
            invoiceNumber: [advanceLeg.invoiceNumber, balanceLeg.invoiceNumber].filter(Boolean).join(' / '),
            paidAmount: (advanceLeg.paidAmount || 0) + (balanceLeg.paidAmount || 0),
            balanceAmount: (advanceLeg.balanceAmount || 0) + (balanceLeg.balanceAmount || 0),
            status: bothPaid ? 'confirmed-paid' : 'confirmed-partial',
            legs: [
              { label: 'Advance', amount: advanceLeg.paidAmount || 0, rawStatus: advanceLeg.rawStatus || '' },
              { label: 'Balance', amount: balanceLeg.paidAmount || balanceLeg.balanceAmount || 0, rawStatus: balanceLeg.rawStatus || '' },
            ],
          });
        });

        setRecords(mergedRecords);
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
      // FIX: match against the real category code (LND/CUR/SVC/HOC), same
      // as Financial Dashboard's category filter — inclusive, so a
      // multi-service invoice matches if ANY of its categories match.
      const matchesService = filterService === 'all' || b.mainCategories.includes(filterService);
      const matchesCustomer = !filterCustomer || 
        (b.customerName && b.customerName.toLowerCase().includes(filterCustomer.toLowerCase())) ||
        (b.customerPhone && b.customerPhone.toLowerCase().includes(filterCustomer.toLowerCase()));
      // FIX (task #17): compare ISO 'YYYY-MM-DD' strings directly (lexicographic
      // order matches date order) instead of round-tripping through `new Date()`,
      // which parsed the two sides in different timezone bases and dropped
      // boundary-day records — see the `dateISO` field comment above.
      const matchesFromDate = !fromDate || b.dateISO >= fromDate;
      const matchesToDate = !toDate || b.dateISO <= toDate;
      return matchesMethod && matchesStatus && matchesService && matchesCustomer && matchesFromDate && matchesToDate;
    }).slice(0, limit || undefined);
  }, [records, filterMethod, filterStatus, filterService, filterCustomer, fromDate, toDate, limit]);

  const paginated = useMemo(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return filtered.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  // FIX: totalRevenue was an exact copy-paste of totalCollected (both summed
  // only paidAmount) — so the "Total Revenue" card always showed the same
  // number as "Collected", and never included the "Pending" balance shown
  // right next to it. Total Revenue should be the full invoiced amount
  // (what was collected + what's still owed), matching how Financial
  // Dashboard and Analytics both define it.
  const totalCollected = useMemo(() => {
    return filtered.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  }, [filtered]);

  const totalPending = useMemo(() => {
    return filtered.reduce((sum, b) => sum + (b.balanceAmount || 0), 0);
  }, [filtered]);

  const totalRevenue = useMemo(() => {
    return totalCollected + totalPending;
  }, [totalCollected, totalPending]);

  const statusLabel: Record<string, string> = {
    'confirmed-paid': 'Paid',
    'confirmed-partial': 'Partial',
    'confirmed-unpaid': 'COD / Unpaid',
  };

  // FIX: the "Service" column and CSV export used to show the raw first
  // service item name (e.g. "Sofa Cleaning", "Deep Cleaning") — now shows
  // the actual main category(ies) it belongs to, consistent with the
  // filter above and with the rest of the app.
  const categoryLabelFor = (b: BookingRecord): string => {
    if (!b.mainCategories || b.mainCategories.length === 0) return b.serviceType || '—';
    return b.mainCategories.map(c => CATEGORY_LABEL[c] || c).join(', ');
  };

  const methodLabel: Record<string, string> = {
    'full-online': 'Online (Full)',
    'advance-balance': 'Advance',
    'cod': 'Cash on Delivery',
    'pay-after-completion': 'Pay After Completion',
  };

  // NEW — label for one leg of a merged Advance+Balance row (see `legs` on
  // BookingRecord above). Uses the real Invoice.status value directly
  // rather than the coarser confirmed-paid/partial/unpaid buckets those
  // don't distinguish "settled via a -BAL invoice" from "still owed".
  const legLabel = (rawStatus: string): string => {
    switch (rawStatus) {
      case 'PAID': return 'Paid';
      case 'SENT': return 'Pending';
      case 'UNPAID': return 'Unpaid';
      case 'PARTIAL': return 'Partial';
      case 'REFUND_PENDING': return 'Refund Pending';
      case 'REFUNDED': return 'Refunded';
      default: return rawStatus || 'Unknown';
    }
  };

  const legBadgeClass = (rawStatus: string): string => {
    if (rawStatus === 'PAID') return 'text-green-600';
    if (rawStatus === 'UNPAID' || rawStatus === 'SENT') return 'text-orange-600';
    return 'text-gray-500';
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const headers = [
        'Invoice No.', 'Booking ID', 'Customer Name', 'Customer Phone',
        'Service Type', 'Date', 'Payment Method',
        // NEW — for a merged Advance+Balance row this is now "Advance:
        // Paid (Rs X) / Balance: Paid (Rs Y)" instead of a single number
        // that couldn't say which leg was which.
        'Paid Amount (Rs)', 'Balance Amount (Rs)', 'Status',
      ];
      const rows = paginated.map(b => [
        b.invoiceNumber || '—',
        b.bookingId,
        b.customerName || '—',
        b.customerPhone || '—',
        categoryLabelFor(b),
        b.date,
        b.paymentMethodName || methodLabel[b.paymentMethod] || b.paymentMethod,
        b.legs
          ? b.legs.map(l => `${l.label}: ${legLabel(l.rawStatus)} (Rs ${l.amount.toLocaleString()})`).join(' / ')
          : (b.paidAmount || 0),
        b.legs ? '' : (b.balanceAmount || 0),
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
                    {MAIN_CATEGORIES.map((cat) => (
                      <option key={cat.code} value={cat.code}>{cat.label}</option>
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
                      <td className="px-4 py-3">{categoryLabelFor(b)}</td>
                      <td className="px-4 py-3">{b.date}</td>
                      <td className="px-4 py-3">{b.paymentMethodName || methodLabel[b.paymentMethod] || b.paymentMethod}</td>
                      {/* FIX: this cell was rendering the literal template-
                          literal text (no {} around it — JSX treated it as
                          plain text, backticks and all) instead of the
                          computed amount. Also now shows a 2-line
                          Advance/Balance breakdown for a merged row
                          instead of one number that couldn't say which
                          leg it belonged to. */}
                      <td className="px-4 py-3 text-right font-semibold">
                        {b.legs ? (
                          <div className="space-y-0.5">
                            {b.legs.map((leg, li) => (
                              <div key={li} className={legBadgeClass(leg.rawStatus)}>
                                {leg.label}: {legLabel(leg.rawStatus)} — Rs. {leg.amount.toLocaleString()}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-green-600">Rs. {(b.paidAmount || 0).toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-500">
                        {b.legs ? '—' : ((b.balanceAmount || 0) > 0 ? `Rs. ${(b.balanceAmount || 0).toLocaleString()}` : '—')}
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