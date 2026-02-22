import { useState } from 'react';
import { 
  FileText, 
  CreditCard, 
  Users, 
  BarChart3, 
  Download, 
  ChevronDown, 
  FileJson, 
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function ReportsManagement() {
  const [bookingReport, setBookingReport] = useState({
    from: '2026-02-01',
    to: '2026-02-28',
    service: 'All Services',
    status: 'All Statuses'
  });

  const [paymentReport, setPaymentReport] = useState({
    period: 'This Month',
    method: 'All Methods'
  });

  const [staffReport, setStaffReport] = useState({
    staff: 'All Staff',
    period: 'This Month'
  });

  const [customerReport, setCustomerReport] = useState({
    metric: 'New Customers',
    period: 'Last 6 Months'
  });

  const handleDownload = (type: string, format: string) => {
    // Mock download functionality
    alert(`Generating ${type} in ${format} format...`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-purple-100 p-2 rounded-lg">
          <BarChart3 className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 font-medium">Generate and export comprehensive business reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking Reports */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 border-b border-gray-50 pb-4">
            <FileText className="w-5 h-5 text-purple-600" />
            Booking Reports
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">From:</label>
                <div className="relative">
                  <Input 
                    type="date" 
                    value={bookingReport.from}
                    onChange={(e) => setBookingReport({...bookingReport, from: e.target.value})}
                    className="h-11 rounded-xl border-gray-200 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">To:</label>
                <Input 
                  type="date" 
                  value={bookingReport.to}
                  onChange={(e) => setBookingReport({...bookingReport, to: e.target.value})}
                  className="h-11 rounded-xl border-gray-200 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Service Type:</label>
              <select 
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={bookingReport.service}
                onChange={(e) => setBookingReport({...bookingReport, service: e.target.value})}
              >
                <option>All Services</option>
                <option>Deep Cleaning</option>
                <option>Laundry Pickup</option>
                <option>Ironing</option>
                <option>Sofa Cleaning</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Status:</label>
              <select 
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={bookingReport.status}
                onChange={(e) => setBookingReport({...bookingReport, status: e.target.value})}
              >
                <option>All Statuses</option>
                <option>Completed</option>
                <option>In Progress</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="pt-2 flex gap-3">
              <Button 
                onClick={() => handleDownload('Booking Report', 'PDF')}
                className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleDownload('Booking Report', 'CSV')}
                className="flex-1 h-12 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Download CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Reports */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 border-b border-gray-50 pb-4">
            <CreditCard className="w-5 h-5 text-orange-500" />
            Payment Reports
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Select Period:</label>
              <select 
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={paymentReport.period}
                onChange={(e) => setPaymentReport({...paymentReport, period: e.target.value})}
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Quarter</option>
                <option>Custom Range</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Payment Method:</label>
              <select 
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={paymentReport.method}
                onChange={(e) => setPaymentReport({...paymentReport, method: e.target.value})}
              >
                <option>All Methods</option>
                <option>Credit/Debit Card</option>
                <option>Bank Transfer</option>
                <option>Cash on Service</option>
              </select>
            </div>

            <div className="pt-8">
              <Button className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                Generate Payment Report
              </Button>
            </div>
          </div>
        </div>

        {/* Staff Performance Reports */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 border-b border-gray-50 pb-4">
            <Users className="w-5 h-5 text-blue-500" />
            Staff Performance Reports
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Select Staff:</label>
              <select 
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={staffReport.staff}
                onChange={(e) => setStaffReport({...staffReport, staff: e.target.value})}
              >
                <option>All Staff</option>
                <option>Maria Garcia</option>
                <option>John Smith</option>
                <option>Lisa Wang</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Period:</label>
              <select 
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={staffReport.period}
                onChange={(e) => setStaffReport({...staffReport, period: e.target.value})}
              >
                <option>This Month</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="pt-8">
              <Button className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                Generate Performance Report
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Activity Reports */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 border-b border-gray-50 pb-4">
            <BarChart3 className="w-5 h-5 text-green-500" />
            Customer Activity Reports
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Metric:</label>
              <select 
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={customerReport.metric}
                onChange={(e) => setCustomerReport({...customerReport, metric: e.target.value})}
              >
                <option>New Customers</option>
                <option>Booking Frequency</option>
                <option>Loyalty Point Usage</option>
                <option>Churn Rate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Period:</label>
              <select 
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={customerReport.period}
                onChange={(e) => setCustomerReport({...customerReport, period: e.target.value})}
              >
                <option>Last 6 Months</option>
                <option>Last 12 Months</option>
                <option>All Time</option>
              </select>
            </div>

            <div className="pt-8">
              <Button className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                Generate Activity Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}