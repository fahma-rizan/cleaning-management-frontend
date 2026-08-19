import { useState, useEffect } from "react";
import {
  FileText,
  CreditCard,
  Users,
  BarChart3,
  Download,
  ChevronDown,
  FileJson,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { reportAPI, staffAPI } from "../../lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Local YYYY-MM-DD (not toISOString, which shifts by timezone offset and
// can land on the wrong day) — matches what <input type="date"> expects.
const toDateInputValue = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toDateInputValue(d);
};

// Default range: today, and one month before it — so the "From"/"To"
// fields open with a sensible one-month window instead of empty.
const getDefaultBookingDateRange = () => {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 1);
  return { from: toDateInputValue(from), to: toDateInputValue(to) };
};

export function ReportsManagement() {
  const [bookingReport, setBookingReport] = useState({
    ...getDefaultBookingDateRange(),
    service: "All Services",
    status: "All Statuses",
  });

  const [paymentReport, setPaymentReport] = useState({
    period: "All Time",
    method: "All Methods",
  });

  const [staffReport, setStaffReport] = useState({
    staff: "All Staff",
    period: "This Month",
  });

  const [customerReport, setCustomerReport] = useState({
    status: "All",
    period: "This Month",
  });

  // Report results
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportTotal, setReportTotal] = useState(0);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeReport, setActiveReport] = useState("");
  const [reportSummary, setReportSummary] = useState<any>(null);
  const [staffNames, setStaffNames] = useState<string[]>([]);

  const REPORT_COLUMNS: Record<string, { header: string; dataKey: string }[]> =
    {
      booking: [
        { header: "Booking ID", dataKey: "bookingId" },
        { header: "Customer", dataKey: "customerName" },
        { header: "Category", dataKey: "serviceCategory" },
        { header: "Date", dataKey: "date" },
        { header: "Time", dataKey: "time" },
        { header: "Status", dataKey: "status" },
        { header: "Price (Rs)", dataKey: "price" },
        { header: "Paid (Rs)", dataKey: "paidAmount" },
        { header: "Balance (Rs)", dataKey: "balanceAmount" },
        { header: "Payment", dataKey: "paymentMethodName" },
        { header: "Pay Status", dataKey: "paymentStatus" },
        { header: "Assigned Staff", dataKey: "assignedStaffName" },
      ],
      payment: [
        { header: "Booking ID", dataKey: "bookingId" },
        { header: "Customer", dataKey: "customerName" },
        { header: "Service", dataKey: "serviceName" },
        { header: "Date", dataKey: "date" },
        { header: "Price (Rs)", dataKey: "price" },
        { header: "Paid (Rs)", dataKey: "paidAmount" },
        { header: "Method", dataKey: "paymentMethodName" },
        { header: "Pay Status", dataKey: "paymentStatus" },
      ],
      staff: [
        { header: "Staff Name", dataKey: "name" },
        { header: "Rating", dataKey: "rating" },
        { header: "Jobs Completed", dataKey: "jobsCompleted" },
        { header: "Status", dataKey: "status" },
      ],
      customer: [
        { header: "Name", dataKey: "name" },
        { header: "Email", dataKey: "email" },
        { header: "Phone", dataKey: "phone" },
        { header: "Status", dataKey: "status" },
        { header: "Bookings", dataKey: "totalBookings" },
        { header: "Total Spent (Rs)", dataKey: "totalSpent" },
        { header: "Loyalty Pts", dataKey: "loyaltyPoints" },
      ],
    };

  const REPORT_LABELS: Record<string, string> = {
    booking: "Booking Report",
    payment: "Payment Report",
    staff: "Staff Performance Report",
    customer: "Customer Activity Report",
  };

  // Load staff names for dropdown
  useEffect(() => {
    staffAPI
      .getAll()
      .then((data) =>
        setStaffNames(["All Staff", ...data.map((s: any) => s.name)]),
      )
      .catch(console.error);
  }, []);

  const handleGenerate = async (
    type: "booking" | "payment" | "staff" | "customer",
  ) => {
    setReportLoading(true);
    setActiveReport(type);
    setReportData([]);
    setReportTotal(0);

    try {
      if (type === "booking") {
        const filters: any = {};
        if (bookingReport.from) filters.from = bookingReport.from;
        if (bookingReport.to) filters.to = bookingReport.to;
        if (bookingReport.service !== "All Services")
          filters.service = bookingReport.service;
        if (bookingReport.status !== "All Statuses")
          filters.status = bookingReport.status.toLowerCase();
        const res = await reportAPI.getBookings(filters);
        setReportData(res.bookings || res); // handles both old and new shape
        if (res.summary) setReportSummary(res.summary);
      } else if (type === "payment") {
        const filters: any = {};
        if (paymentReport.period !== "All Time")
          filters.period = paymentReport.period;
        if (paymentReport.method !== "All Methods") {
          // Map display name to database value
          const methodMap: Record<string, string> = {
            "Cash on Delivery": "cod",
            "Online Payment before Service": "card",
            "Online Payment after Service": "card",
            "Advance Payment": "card",
          };
          filters.method =
            methodMap[paymentReport.method] || paymentReport.method;
        }
        const res = await reportAPI.getPayments(filters);
        setReportData(res.bookings);
        setReportTotal(res.total);
      } else if (type === "staff") {
        const filters: any = {};
        if (staffReport.staff !== "All Staff")
          filters.staff = staffReport.staff;
        if (staffReport.period !== "All") filters.period = staffReport.period;
        const res = await reportAPI.getStaffPerformance(filters);
        setReportData(res.staff || res);
        if (res.summary) setReportSummary(res.summary);
      } else if (type === "customer") {
        const filters: any = {};
        if (customerReport.period !== "All Time")
          filters.period = customerReport.period;
        if (customerReport.status !== "All")
          filters.status = customerReport.status;
        const data = await reportAPI.getCustomers(filters);
        setReportData(data);
      }
    } catch (err: any) {
      alert(err.error || "Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (reportData.length === 0) {
      alert("Generate a report first");
      return;
    }

    // Pick readable columns based on report type
    const columnMap: Record<string, string[]> = {
      booking: [
        "bookingId",
        "customerName",
        "serviceCategory",
        "date",
        "time",
        "status",
        "price",
        "paidAmount",
        "balanceAmount",
        "paymentMethodName",
        "paymentStatus",
        "assignedStaffName",
      ],
      payment: [
        "bookingId",
        "customerName",
        "serviceName",
        "date",
        "price",
        "paidAmount",
        "paymentMethodName",
        "paymentStatus",
      ],
      staff: ["name", "rating", "jobsCompleted", "status"],
      customer: [
        "name",
        "email",
        "phone",
        "status",
        "totalBookings",
        "totalSpent",
        "loyaltyPoints",
      ],
    };

    const cols = columnMap[activeReport] || Object.keys(reportData[0]);
    const headers = cols.join(",");
    const rows = reportData
      .map((r) =>
        cols
          .map((c) => {
            const val = r[c] ?? "";
            return typeof val === "string" && val.includes(",")
              ? `"${val}"`
              : val;
          })
          .join(","),
      )
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeReport}-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const cols = REPORT_COLUMNS[activeReport] || [];
    const label = REPORT_LABELS[activeReport] || "Report";
    const dateStr = new Date().toLocaleDateString("en-LK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const pageWidth = doc.internal.pageSize.getWidth();

    // ── Header bar ──────────────────────────────────────────────────────────
    doc.setFillColor(124, 58, 237); // purple-600
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("CloudLaundry", 14, 11);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Online Cleaning Services Management System", 14, 19);

    // Report title on right side of header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(label, pageWidth - 14, 11, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${dateStr}`, pageWidth - 14, 19, { align: "right" });

    // ── Summary line ────────────────────────────────────────────────────────
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    let summaryY = 36;
    doc.text(`Total records: ${reportData.length}`, 14, summaryY);

    if (activeReport === "payment" && reportTotal > 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(124, 58, 237);
      doc.text(
        `Total Revenue: Rs ${reportTotal.toLocaleString()}`,
        80,
        summaryY,
      );
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
    }

    if (activeReport === "booking") {
      const completed = reportData.filter(
        (r) => r.status === "completed",
      ).length;
      const cancelled = reportData.filter(
        (r) => r.status === "cancelled",
      ).length;
      const pending = reportData.filter((r) =>
        r.status === "pending",
      ).length;
      doc.text(
        `Completed: ${completed}   Cancelled: ${cancelled}   Pending: ${pending}`,
        80,
        summaryY,
      );
    }

    // ── Table ────────────────────────────────────────────────────────────────
    autoTable(doc, {
      startY: summaryY + 6,
      columns: cols,
      body: reportData,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [124, 58, 237],
        textColor: 255,
        fontStyle: "bold",
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [248, 246, 255],
      },
      columnStyles: {
        0: { fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
      // ── Page footer ─────────────────────────────────────────────────────
      didDrawPage: (data: any) => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        const page = (doc as any).internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setFont("helvetica", "normal");
        doc.text(
          `CloudLaundry — ${label} — Page ${page} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" },
        );
        doc.text(
          "Confidential — For internal use only",
          pageWidth - 14,
          doc.internal.pageSize.getHeight() - 8,
          { align: "right" },
        );
      },
    });

    return doc;
  };

  const handleDownloadPDF = () => {
    if (reportData.length === 0) {
      alert("Generate a report first");
      return;
    }
    const doc = buildPDF();
    const filename = `${activeReport}-report-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
  };

  const handlePreviewPDF = () => {
    if (reportData.length === 0) {
      alert("Generate a report first");
      return;
    }
    const doc = buildPDF();
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-purple-100 p-2 rounded-lg">
          <BarChart3 className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-500 font-medium">
            Generate and export comprehensive business reports
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking Reports */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 border-b border-gray-50 pb-4">
            <FileText className="w-5 h-5 text-purple-600" />
            Booking Reports
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  From:
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={bookingReport.from}
                    max={
                      bookingReport.to
                        ? addDays(bookingReport.to, -1)
                        : undefined
                    }
                    onChange={(e) => {
                      const newFrom = e.target.value;
                      // Native max already blocks picking a "From" on/after
                      // "To" — this is just a safety net for browsers that
                      // allow typing past it.
                      if (bookingReport.to && newFrom >= bookingReport.to) return;
                      setBookingReport({
                        ...bookingReport,
                        from: newFrom,
                      });
                    }}
                    className="h-11 rounded-xl border-gray-200 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  To:
                </label>
                <Input
                  type="date"
                  value={bookingReport.to}
                  min={
                    bookingReport.from
                      ? addDays(bookingReport.from, 1)
                      : undefined
                  }
                  onChange={(e) => {
                    const newTo = e.target.value;
                    if (bookingReport.from && newTo <= bookingReport.from) return;
                    setBookingReport({ ...bookingReport, to: newTo });
                  }}
                  className="h-11 rounded-xl border-gray-200 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Service Type:
              </label>
              <select
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={bookingReport.service}
                onChange={(e) =>
                  setBookingReport({
                    ...bookingReport,
                    service: e.target.value,
                  })
                }
              >
                <option>All Services</option>
                <option>Home/Office Cleaning</option>
                <option>Laundry Service</option>
                <option>Shampoo Vacuum Cleaning</option>
                <option>Curtains Cleaning</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Status:
              </label>
              <select
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={bookingReport.status}
                onChange={(e) =>
                  setBookingReport({ ...bookingReport, status: e.target.value })
                }
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
                onClick={() => handleGenerate("booking")}
                disabled={reportLoading}
                className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {reportLoading && activeReport === "booking" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Generate
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={activeReport !== "booking" || reportData.length === 0}
                className="flex-1 h-12 bg-purple-400 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadCSV}
                disabled={activeReport !== "booking" || reportData.length === 0}
                className="flex-1 h-12 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Reports */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 border-b border-gray-50 pb-4">
            <CreditCard className="w-5 h-5 text-orange-500" />
            Payment Reports
          </div>

          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Select Period:
              </label>
              <select
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={paymentReport.period}
                onChange={(e) =>
                  setPaymentReport({ ...paymentReport, period: e.target.value })
                }
              >
                <option>All Time</option>
                <option>This Month</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Payment Method:
              </label>
              <select
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={paymentReport.method}
                onChange={(e) =>
                  setPaymentReport({ ...paymentReport, method: e.target.value })
                }
              >
                <option>All Methods</option>
                <option>Online Payment before Service</option>
                <option>Online Payment after Service</option>
                <option>Advance Payment</option>
                <option>Cash on Delivery</option>
              </select>
            </div>

            <div className="mt-auto pt-2 flex gap-3">
              <Button
                onClick={() => handleGenerate("payment")}
                disabled={reportLoading}
                className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {reportLoading && activeReport === "payment" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Generate
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={activeReport !== "payment" || reportData.length === 0}
                className="flex-1 h-12 bg-purple-400 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadCSV}
                disabled={activeReport !== "payment" || reportData.length === 0}
                className="flex-1 h-12 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Staff Performance Reports */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 border-b border-gray-50 pb-4">
            <Users className="w-5 h-5 text-blue-500" />
            Staff Performance Reports
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Select Staff:
              </label>
              <select
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={staffReport.staff}
                onChange={(e) =>
                  setStaffReport({ ...staffReport, staff: e.target.value })
                }
              >
                {staffNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Period:
              </label>
              <select
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={staffReport.period}
                onChange={(e) =>
                  setStaffReport({ ...staffReport, period: e.target.value })
                }
              >
                <option>This Month</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="pt-8 flex gap-3">
              <Button
                onClick={() => handleGenerate("staff")}
                disabled={reportLoading}
                className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {reportLoading && activeReport === "staff" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Generate
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={activeReport !== "staff" || reportData.length === 0}
                className="flex-1 h-12 bg-purple-400 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadCSV}
                disabled={activeReport !== "staff" || reportData.length === 0}
                className="flex-1 h-12 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Activity Reports */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 border-b border-gray-50 pb-4">
            <BarChart3 className="w-5 h-5 text-green-500" />
            Customer Activity Reports
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Status:
              </label>
              <select
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={customerReport.status}
                onChange={(e) =>
                  setCustomerReport({
                    ...customerReport,
                    status: e.target.value,
                  })
                }
              >
                <option value="All">All Customers</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Period:
              </label>
              <select
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-gray-700"
                value={customerReport.period}
                onChange={(e) =>
                  setCustomerReport({
                    ...customerReport,
                    period: e.target.value,
                  })
                }
              >
                <option>This Month</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
                <option>All Time</option>
              </select>
            </div>

            <div className="pt-8 flex gap-3">
              <Button
                onClick={() => handleGenerate("customer")}
                disabled={reportLoading}
                className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {reportLoading && activeReport === "customer" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Generate
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={
                  activeReport !== "customer" || reportData.length === 0
                }
                className="flex-1 h-12 bg-purple-400 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadCSV}
                disabled={
                  activeReport !== "customer" || reportData.length === 0
                }
                className="flex-1 h-12 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview Table */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 capitalize">
                {activeReport} Report — {reportData.length} records
              </h3>
              {reportTotal > 0 && (
                <p className="text-purple-600 font-semibold mt-1">
                  Total Revenue: Rs {reportTotal.toLocaleString()}
                </p>
              )}
              {reportSummary && activeReport === "booking" && (
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-green-600 font-semibold">
                    ✓ Completed: {reportSummary.completed}
                  </span>
                  <span className="text-red-600 font-semibold">
                    ✗ Cancelled: {reportSummary.cancelled}
                  </span>
                  <span className="text-amber-600 font-semibold">
                    ⏳ Pending: {reportSummary.pending}
                  </span>
                  <span className="text-purple-600 font-semibold">
                    Rs {reportSummary.revenue?.toLocaleString()} revenue
                  </span>
                </div>
              )}
              {reportSummary && activeReport === "staff" && (
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-gray-600 font-semibold">
                    Active staff: {reportSummary.activeStaff}/
                    {reportSummary.totalStaff}
                  </span>
                  <span className="text-gray-600 font-semibold">
                    Total jobs: {reportSummary.totalJobs}
                  </span>
                  <span className="text-purple-600 font-semibold">
                    Avg rating: {reportSummary.avgRating} ★
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handlePreviewPDF}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl px-4 h-10 font-bold flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Preview PDF
              </Button>
              <Button
                onClick={handleDownloadPDF}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 h-10 font-bold flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button
                onClick={handleDownloadCSV}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 h-10 font-bold flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Download CSV
              </Button>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {activeReport === "booking" &&
                  [
                    "Booking ID",
                    "Customer",
                    "Category",
                    "Date",
                    "Time",
                    "Status",
                    "Price",
                    "Paid",
                    "Balance",
                    "Payment",
                    "Assigned Staff",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                {activeReport === "payment" &&
                  [
                    "Booking ID",
                    "Customer",
                    "Service",
                    "Date",
                    "Price",
                    "Paid",
                    "Payment Method",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                {activeReport === "staff" &&
                  ["Staff Name", "Rating", "Jobs Completed", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                {activeReport === "customer" &&
                  [
                    "Name",
                    "Email",
                    "Phone",
                    "Status",
                    "Bookings",
                    "Total Spent",
                    "Loyalty Points",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.slice(0, 10).map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 text-sm text-gray-700">
                  {activeReport === "booking" && (
                    <>
                      <td className="px-4 py-3 text-purple-600 font-medium">
                        {row.bookingId}
                      </td>
                      <td className="px-4 py-3">{row.customerName}</td>
                      <td className="px-4 py-3">{row.serviceCategory}</td>
                      <td className="px-4 py-3">{row.date}</td>
                      <td className="px-4 py-3">{row.time}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        Rs {row.price?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        Rs {row.paidAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        Rs {row.balanceAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{row.paymentMethodName}</td>
                      <td className="px-4 py-3">
                        {row.assignedStaffName || "—"}
                      </td>
                    </>
                  )}
                  {activeReport === "payment" && (
                    <>
                      <td className="px-4 py-3 text-purple-600 font-medium">
                        {row.bookingId}
                      </td>
                      <td className="px-4 py-3">{row.customerName}</td>
                      <td className="px-4 py-3">{row.serviceName}</td>
                      <td className="px-4 py-3">{row.date}</td>
                      <td className="px-4 py-3">
                        Rs {row.price?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        Rs {row.paidAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{row.paymentMethodName}</td>
                      <td className="px-4 py-3">{row.paymentStatus}</td>
                    </>
                  )}
                  {activeReport === "staff" && (
                    <>
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">{row.rating} ★</td>
                      <td className="px-4 py-3">{row.jobsCompleted}</td>
                      <td className="px-4 py-3">{row.status}</td>
                    </>
                  )}
                  {activeReport === "customer" && (
                    <>
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">{row.email}</td>
                      <td className="px-4 py-3">{row.phone}</td>
                      <td className="px-4 py-3">{row.status}</td>
                      <td className="px-4 py-3">{row.totalBookings}</td>
                      <td className="px-4 py-3">
                        Rs {row.totalSpent?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{row.loyaltyPoints}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {reportData.length > 10 && (
            <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-100">
              Showing 10 of {reportData.length} records — download CSV for full
              data
            </div>
          )}
        </div>
      )}
    </div>
  );
}