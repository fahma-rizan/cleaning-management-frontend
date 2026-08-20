import { useState, useRef, useEffect } from "react";
import {
  Users,
  Search,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Package,
  Star,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Home,
  Building2,
  CreditCard,
  DollarSign,
  Award,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Pagination } from "../ui/pagination";
import { customerAPI } from "../../lib/api";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalBookings: number;
  totalSpent: number;
  loyaltyPoints: number;
  customerStatus: "active" | "inactive";
  lastBooking?: string;
}

export function CustomerManagement() {
  const DETAILS_PREVIEW_LIMIT = 5;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Load on mount
  useEffect(() => {
    customerAPI
      .getAll()
      .then((data) => setCustomers(data))
      .catch((err) => setError(err.error || "Failed to load customers"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const itemsPerPage = 10;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "inactive":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery);
      const matchesStatus =
        statusFilter === "All" || customer.customerStatus === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    .sort(
      (a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
    );

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalCustomers = filteredCustomers.length;

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
    setOpenDropdown(null);
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
    setOpenDropdown(null);
    setCustomerDetails(null);
    setDetailsError("");
    setShowAllBookings(false);
    setShowAllPayments(false);
    setShowAllReviews(false);
    setDetailsLoading(true);
    customerAPI
      .getDetails(customer._id)
      .then((data) => {
        setCustomerDetails(data);
        setCustomers((prev) =>
          prev.map((c) =>
            c._id === customer._id
              ? {
                  ...c,
                  totalBookings: data.totalBookings ?? c.totalBookings,
                  totalSpent: data.totalSpent ?? c.totalSpent,
                  loyaltyPoints: data.loyaltyPoints ?? c.loyaltyPoints,
                }
              : c,
          ),
        );
      })
      .catch((err) => setDetailsError(err.error || "Failed to load customer details"))
      .finally(() => setDetailsLoading(false));
  };

  const handleReactivate = async (customer: Customer) => {
    if (!confirm(`Are you sure you want to reactivate ${customer.name}?`))
      return;
    try {
      await customerAPI.updateStatus(customer._id, "active");
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === customer._id ? { ...c, customerStatus: "active" } : c,
        ),
      );
      setSelectedCustomer((prev) =>
        prev ? { ...prev, customerStatus: "active" } : null,
      );
      setOpenDropdown(null);
    } catch (err: any) {
      alert(err.error || "Failed to reactivate customer");
    }
  };

  // Customer details are now fetched from the backend in handleViewDetails
  // (see customerAPI.getDetails) instead of this mock generator.

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-medium">
        {error}
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Customer Management
        </h1>
        <p className="text-gray-500 font-medium">
          Manage and view all customer accounts
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center">
            <Users className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {customers.length}
            </div>
            <div className="text-gray-500 font-medium">Total Customers</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {customers.filter((c) => c.customerStatus === "active").length}
            </div>
            <div className="text-gray-500 font-medium">Active</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center">
            <XCircle className="w-7 h-7 text-gray-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {customers.filter((c) => c.customerStatus === "inactive").length}
            </div>
            <div className="text-gray-500 font-medium">Inactive</div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search customers by name, email, or phone..."
            className="pl-12 h-14 bg-white border-gray-200 rounded-xl focus-visible:ring-purple-600 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(["All", "Active", "Inactive"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 h-11 rounded-xl text-sm font-semibold transition-colors ${
                statusFilter === status
                  ? "bg-purple-600 text-white shadow-md shadow-purple-100"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Loyalty Points
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCustomers.map((customer, index) => (
                <tr
                  key={customer._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-gray-900">
                        {customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {`CUST-${String((currentPage - 1) * itemsPerPage + index + 1).padStart(3, "0")}`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {customer.joinDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-500" />
                      <span className="font-bold text-gray-900">
                        {customer.totalBookings}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">
                      LKR {customer.totalSpent.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-900">
                        {customer.loyaltyPoints}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={`${getStatusColor(customer.customerStatus)} border-none shadow-none font-bold px-3 py-1`}
                    >
                      {customer.customerStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="relative"
                      ref={openDropdown === customer._id ? dropdownRef : null}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 rounded-lg border-gray-200"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === customer._id ? null : customer._id,
                          )
                        }
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      {openDropdown === customer._id && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <button
                            onClick={() => handleViewDetails(customer)}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                            View Details
                          </button>

                          {/* Inactive → Reactivate */}
                          {customer.customerStatus === "inactive" && (
                            <button
                              onClick={() => handleReactivate(customer)}
                              className="w-full px-4 py-2.5 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Reactivate
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCustomers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalCustomers}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="customers"
        />
      )}

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            No customers found matching your search
          </p>
        </div>
      )}

      {/* Customer Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Customer Details
              </h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {detailsLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!detailsLoading && detailsError && (
              <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium">
                  {detailsError}
                </div>
              </div>
            )}

            {!detailsLoading && !detailsError && customerDetails && (
            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">
                  Personal Info
                </h3>
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {customerDetails.name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <span className="text-sm text-gray-600 font-medium">
                        Name:
                      </span>
                      <span className="ml-2 text-lg font-bold text-gray-900">
                        {customerDetails.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 font-medium">
                        Email:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {customerDetails.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 font-medium">
                        Phone:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {customerDetails.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 font-medium">
                        Member Since:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {customerDetails.joinDate ? new Date(customerDetails.joinDate).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 font-medium">
                        Loyalty Points:
                      </span>
                      <span className="ml-2 text-gray-900 font-bold">
                        {customerDetails.loyaltyPoints} points
                      </span>
                      <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                        {customerDetails.loyaltyTier} tier
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">
                  Booking Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {customerDetails.totalBookings}
                    </div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {customerDetails.completedBookings}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {customerDetails.cancelledBookings}
                    </div>
                    <div className="text-sm text-gray-600">Cancelled</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      LKR {customerDetails.totalSpent.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                </div>
              </div>

              {/* Saved Addresses */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">
                  Saved Addresses
                </h3>
                <div className="space-y-3">
                  {customerDetails.addresses.length === 0 && (
                    <div className="text-sm text-gray-500">No addresses on file.</div>
                  )}
                  {customerDetails.addresses.map(
                    (addr: { type?: string; address: string }, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {addr.type && addr.type !== "Home" ? (
                        <Building2 className="w-5 h-5 text-purple-600 mt-0.5" />
                      ) : (
                        <Home className="w-5 h-5 text-purple-600 mt-0.5" />
                      )}
                      <div>
                        {addr.type && (
                          <div className="font-bold text-gray-900">
                            {addr.type}:
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          {addr.address}
                        </div>
                      </div>
                    </div>
                    ),
                  )}
                </div>
              </div>

              {/* Booking History */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">
                  Booking History
                </h3>
                <div className="space-y-2">
                  {customerDetails.bookingHistory.length === 0 && (
                    <div className="text-sm text-gray-500">No bookings yet.</div>
                  )}
                  {(showAllBookings
                    ? customerDetails.bookingHistory
                    : customerDetails.bookingHistory.slice(0, DETAILS_PREVIEW_LIMIT)
                  ).map((booking: {
                    id: string;
                    service: string;
                    date: string;
                    status: string;
                    amount: number;
                  }) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-sm font-bold text-purple-600">
                          {booking.id}
                        </span>
                        <span className="text-sm text-gray-900">
                          {booking.service}
                        </span>
                        <span className="text-sm text-gray-500">
                          {booking.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.status === "completed" && (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-gray-900">
                              LKR {booking.amount.toLocaleString()}
                            </span>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <>
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-700 font-medium">
                              Confirmed
                            </span>
                            <span className="font-bold text-gray-900">
                              LKR {booking.amount.toLocaleString()}
                            </span>
                          </>
                        )}
                        {booking.status === "cancelled" && (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 font-medium">
                              Cancelled
                            </span>
                          </>
                        )}
                        {booking.status !== "completed" && booking.status !== "confirmed" && booking.status !== "cancelled" && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold capitalize">
                            {booking.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {!showAllBookings && customerDetails.bookingHistory.length > DETAILS_PREVIEW_LIMIT && (
                    <button
                      onClick={() => setShowAllBookings(true)}
                      className="w-full text-center py-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      View All Bookings
                    </button>
                  )}
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">
                  Payment History
                </h3>
                <div className="space-y-2">
                  {customerDetails.paymentHistory.length === 0 && (
                    <div className="text-sm text-gray-500">No payments recorded.</div>
                  )}
                  {(showAllPayments
                    ? customerDetails.paymentHistory
                    : customerDetails.paymentHistory.slice(0, DETAILS_PREVIEW_LIMIT)
                  ).map((payment: {
                    id: string;
                    date: string;
                    method: string;
                    amount: number;
                  }) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-sm font-bold text-gray-700">
                          {payment.id}
                        </span>
                        <span className="text-sm text-gray-600">
                          {payment.date}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {payment.method}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          LKR {payment.amount.toLocaleString()}
                        </span>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                  {!showAllPayments && customerDetails.paymentHistory.length > DETAILS_PREVIEW_LIMIT && (
                    <button
                      onClick={() => setShowAllPayments(true)}
                      className="w-full text-center py-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      View All Payments
                    </button>
                  )}
                </div>
              </div>

              {/* Ratings & Reviews */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">
                  Ratings & Reviews
                </h3>
                {customerDetails.averageRating !== null ? (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        Average Rating: {customerDetails.averageRating}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= Math.round(customerDetails.averageRating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-sm text-gray-500">
                    No reviews yet.
                  </div>
                )}
                <div className="space-y-4">
                  {(showAllReviews
                    ? customerDetails.reviews
                    : customerDetails.reviews.slice(0, DETAILS_PREVIEW_LIMIT)
                  ).map(
                    (
                      review: { text: string; rating: number; date?: string },
                      idx: number,
                    ) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 font-medium mb-2">
                        "{review.text}"
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.date ? new Date(review.date).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                    ),
                  )}
                  {!showAllReviews && customerDetails.reviews.length > DETAILS_PREVIEW_LIMIT && (
                    <button
                      onClick={() => setShowAllReviews(true)}
                      className="w-full text-center py-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      View All Reviews
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-4 border-t border-gray-200">
                {/* Inactive → Reactivate */}
                {customerDetails?.customerStatus === "inactive" && (
                  <Button
                    variant="outline"
                    onClick={() => handleReactivate(customerDetails!)}
                    className="flex-1 min-w-[180px] border-green-200 bg-green-50 text-green-700 hover:bg-green-100 py-3 rounded-xl font-bold justify-center"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Reactivate
                  </Button>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}