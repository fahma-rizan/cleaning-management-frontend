import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, FileText, ArrowLeft } from "lucide-react";
import Header from "./Header";
import BackButton from "./BackButton";
import PaymentOptions from "./PaymentOptions";
import InvoiceGenerator, { InvoiceData, InvoiceType } from "./InvoiceGenerator";
import { addNotification } from "./NotificationCenter";
import type { User } from "../types";

interface PaymentPageProps {
  user: User;
  onLogout: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function PaymentPage({
  user,
  onLogout,
  theme,
  onToggleTheme,
}: PaymentPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [advancePercentage, setAdvancePercentage] = useState<number>(20);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const paymentProcessedRef = useRef(false);

  useEffect(() => {
    const storedBooking = localStorage.getItem("currentBooking");
    if (storedBooking) {
      setBooking(JSON.parse(storedBooking));
    } else {
      navigate("/services");
    }
  }, [navigate]);

  // Handle return from payment gateway
  useEffect(() => {
    const locationState = location.state as any;

    // Check if returning from payment gateway and not already processed
    if (
      locationState?.processPayment &&
      booking &&
      !paymentProcessedRef.current
    ) {
      paymentProcessedRef.current = true;

      const method =
        locationState.paymentMethod ||
        localStorage.getItem("pendingPaymentMethod");
      const percentage =
        locationState.advancePercentage ||
        localStorage.getItem("pendingAdvancePercentage");

      console.log("Returning from payment gateway, processing payment...", {
        method,
        percentage,
        locationState,
      });

      if (method) {
        setSelectedPaymentMethod(method);
        if (percentage) {
          setAdvancePercentage(
            typeof percentage === "string" ? parseInt(percentage) : percentage,
          );
        }

        // Clear pending data
        localStorage.removeItem("pendingPaymentMethod");
        localStorage.removeItem("pendingAdvancePercentage");

        // Process payment automatically
        setProcessing(true);

        setTimeout(() => {
          processPaymentCompletion(method, percentage, booking);
        }, 2000);
      }
    }
  }, [booking, location.state]);

  const processPaymentCompletion = (
    method: string,
    percentage: any,
    bookingData: any,
  ) => {
    const paidAmount =
      method === "full-online"
        ? bookingData.price
        : Math.round(bookingData.price * ((percentage || 20) / 100));
    const balanceAmount = bookingData.price - paidAmount;

    // Store completed booking
    const completedBooking = {
      ...bookingData,
      paymentMethod: method,
      paymentMethodName:
        method === "full-online"
          ? "Online Payment (Full)"
          : `Advance Payment (${percentage || 20}%)`,
      paidAmount,
      balanceAmount,
      status: method === "full-online" ? "confirmed-paid" : "confirmed-partial",
      bookingDate: new Date().toISOString(),
    };

    const existingBookings = JSON.parse(
      localStorage.getItem("userBookings") || "[]",
    );
    existingBookings.push(completedBooking);
    localStorage.setItem("userBookings", JSON.stringify(existingBookings));

    // Generate invoice
    const invoiceType = method === "full-online" ? "full" : "advance";
    const now = new Date();
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const serviceCode =
      bookingData?.serviceType?.substring(0, 3).toUpperCase() || "SRV";
    const randomNum = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0");
    const invoiceNumber = `INV-${serviceCode}-${dateStr}-${randomNum}`;

    const invoiceData: InvoiceData = {
      invoiceNumber,
      invoiceType: invoiceType as InvoiceType,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      bookingId: bookingData.bookingId,
      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone || "+94 XXX XXX XXX",
        address: bookingData.address || "N/A",
      },
      service: {
        name: bookingData.serviceType || "Cleaning Service",
        date: bookingData.date,
        time: bookingData.time,
        customizations: [],
      },
      pricing: {
        basePrice: bookingData.price,
        customizationTotal: 0,
        total: bookingData.price,
        paidAmount,
        balanceAmount,
      },
      paymentMethod:
        method === "full-online"
          ? "Online Payment (Full)"
          : `Advance Payment (${percentage || 20}%)`,
      status: method === "full-online" ? "paid" : "partial",
    };

    setInvoice(invoiceData);

    // Store invoice
    const existingInvoices = JSON.parse(
      localStorage.getItem("userInvoices") || "[]",
    );
    existingInvoices.push(invoiceData);
    localStorage.setItem("userInvoices", JSON.stringify(existingInvoices));

    // Send notifications
    addNotification(user.id, {
      type: "order-confirmed",
      title: "Booking Confirmed! 🎉",
      message: `Your ${bookingData.serviceType} service is scheduled for ${bookingData.date} at ${bookingData.time}. Booking ID: ${bookingData.bookingId}`,
      bookingId: bookingData.bookingId,
    });

    if (paidAmount > 0) {
      addNotification(user.id, {
        type: "payment",
        title: "Payment Received",
        message: `Payment of Rs. ${paidAmount.toLocaleString()} received successfully. ${
          balanceAmount > 0
            ? `Balance Rs. ${balanceAmount.toLocaleString()} due after service.`
            : ""
        }`,
        bookingId: bookingData.bookingId,
      });
    }

    localStorage.removeItem("currentBooking");

    setProcessing(false);
    setSuccess(true);
  };

  const generateInvoiceNumber = (type: string): string => {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const serviceCode =
      booking?.serviceType?.substring(0, 3).toUpperCase() || "SRV";
    const randomNum = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0");
    return `INV-${serviceCode}-${dateStr}-${randomNum}`;
  };

  const createInvoice = (bookingData: any, type: InvoiceType): InvoiceData => {
    const now = new Date();
    const paidAmount = getPaidAmount();
    const balanceAmount = bookingData.price - paidAmount;

    return {
      invoiceNumber: generateInvoiceNumber(type),
      invoiceType: type,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      bookingId: bookingData.bookingId,
      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone || "+94 XXX XXX XXX",
        address: bookingData.address || "N/A",
      },
      service: {
        name: bookingData.serviceType || "Cleaning Service",
        date: bookingData.date,
        time: bookingData.time,
        customizations: [],
      },
      pricing: {
        basePrice: bookingData.price,
        customizationTotal: 0,
        total: bookingData.price,
        paidAmount,
        balanceAmount,
      },
      paymentMethod: getPaymentMethodName(),
      status: getPaymentStatus(),
    };
  };

  const getPaymentMethodName = (): string => {
    const methodNames: { [key: string]: string } = {
      "full-online": "Online Payment (Full)",
      "advance-balance": `Advance Payment (${advancePercentage}%)`,
      cod: "Cash on Delivery",
      "pay-after-completion": "Online Payment After Completion",
    };
    return methodNames[selectedPaymentMethod] || "Not Selected";
  };

  const getPaidAmount = (): number => {
    if (!booking) return 0;
    switch (selectedPaymentMethod) {
      case "full-online":
        return booking.price;
      case "advance-balance":
        return Math.round(booking.price * (advancePercentage / 100));
      case "cod":
      case "pay-after-completion":
        return 0;
      default:
        return 0;
    }
  };

  const getPaymentStatus = ():
    | "paid"
    | "partial"
    | "pending"
    | "refunded"
    | "cancelled" => {
    switch (selectedPaymentMethod) {
      case "full-online":
        return "paid";
      case "advance-balance":
        return "partial";
      case "cod":
      case "pay-after-completion":
        return "pending";
      default:
        return "pending";
    }
  };

  const getInvoiceType = (): InvoiceType => {
    switch (selectedPaymentMethod) {
      case "full-online":
        return "full";
      case "advance-balance":
        return "advance";
      case "cod":
        return "cod";
      case "pay-after-completion":
        return "full";
      default:
        return "full";
    }
  };

  const handlePaymentMethodSelect = (method: string, percentage?: number) => {
    setSelectedPaymentMethod(method);
    if (percentage) {
      setAdvancePercentage(percentage);
    }

    // If online payment selected, navigate to gateway page immediately
    if (method === "full-online" || method === "advance-balance") {
      // Make sure booking is loaded
      if (!booking) {
        console.error("Booking data not available");
        return;
      }

      const amount =
        method === "full-online"
          ? booking.price
          : Math.round((booking.price * (percentage || 20)) / 100);

      // Store payment method before navigation
      localStorage.setItem("pendingPaymentMethod", method);
      if (percentage) {
        localStorage.setItem("pendingAdvancePercentage", percentage.toString());
      }

      console.log("Navigating to payment gateway with:", {
        paymentMethod: method,
        amount: amount,
        bookingData: booking,
        advancePercentage: percentage,
      });

      navigate("/payment-gateway", {
        state: {
          paymentMethod: method,
          amount: amount,
          bookingData: booking,
          advancePercentage: percentage,
        },
      });
    }
  };

  const handlePaymentProcessing = async () => {
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);

      const paidAmount = getPaidAmount();
      const balanceAmount = booking.price - paidAmount;

      // Store completed booking
      const completedBooking = {
        ...booking,
        paymentMethod: selectedPaymentMethod,
        paymentMethodName: getPaymentMethodName(),
        paidAmount,
        balanceAmount,
        status:
          selectedPaymentMethod === "cod" ||
          selectedPaymentMethod === "pay-after-completion"
            ? "confirmed-unpaid"
            : paidAmount === booking.price
              ? "confirmed-paid"
              : "confirmed-partial",
        bookingDate: new Date().toISOString(),
      };

      const existingBookings = JSON.parse(
        localStorage.getItem("userBookings") || "[]",
      );
      existingBookings.push(completedBooking);
      localStorage.setItem("userBookings", JSON.stringify(existingBookings));

      // Generate invoice
      const invoiceData = createInvoice(completedBooking, getInvoiceType());
      setInvoice(invoiceData);

      // Store invoice
      const existingInvoices = JSON.parse(
        localStorage.getItem("userInvoices") || "[]",
      );
      existingInvoices.push(invoiceData);
      localStorage.setItem("userInvoices", JSON.stringify(existingInvoices));

      // Send notification
      addNotification(user.id, {
        type: "order-confirmed",
        title: "Booking Confirmed! 🎉",
        message: `Your ${booking.serviceType} service is scheduled for ${booking.date} at ${booking.time}. Booking ID: ${booking.bookingId}`,
        bookingId: booking.bookingId,
      });

      // Send payment notification
      if (paidAmount > 0) {
        addNotification(user.id, {
          type: "payment",
          title: "Payment Received",
          message: `Payment of Rs. ${paidAmount.toLocaleString()} received successfully. ${
            balanceAmount > 0
              ? `Balance Rs. ${balanceAmount.toLocaleString()} due after service.`
              : ""
          }`,
          bookingId: booking.bookingId,
        });
      }

      localStorage.removeItem("currentBooking");
    }, 2000);
  };

  if (!booking) {
    return null;
  }

  if (success && invoice) {
    return (
      <div
        className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <Header
          user={user}
          onLogout={onLogout}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        {!showInvoice ? (
          <div className="container mx-auto px-4 py-16">
            <div
              className={`max-w-2xl mx-auto rounded-2xl shadow-xl p-8 text-center ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
              }`}
            >
              <div className="flex justify-center mb-6">
                <div className="bg-green-500 p-4 rounded-full">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
              </div>

              <h1 className="text-3xl mb-4">
                {selectedPaymentMethod === "cod" ||
                selectedPaymentMethod === "pay-after-completion"
                  ? "Booking Confirmed!"
                  : "Payment Successful!"}
              </h1>

              <p
                className={`mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                {selectedPaymentMethod === "cod"
                  ? "Your booking is confirmed. Please pay cash to the service professional after completion."
                  : selectedPaymentMethod === "pay-after-completion"
                    ? "Your booking is confirmed. You will receive a payment link after service completion."
                    : selectedPaymentMethod === "advance-balance"
                      ? `Thank you for your advance payment of Rs. ${invoice.pricing.paidAmount.toLocaleString()}. Balance Rs. ${invoice.pricing.balanceAmount.toLocaleString()} will be collected after service.`
                      : "Your booking has been confirmed and payment is complete."}
              </p>

              <div
                className={`rounded-lg p-6 mb-6 ${
                  theme === "dark" ? "bg-gray-700" : "bg-purple-50"
                }`}
              >
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p
                      className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Booking ID
                    </p>
                    <p className="font-mono">{booking.bookingId}</p>
                  </div>
                  <div>
                    <p
                      className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Invoice Number
                    </p>
                    <p className="font-mono">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p
                      className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Service Date
                    </p>
                    <p>{booking.date}</p>
                  </div>
                  <div>
                    <p
                      className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Time
                    </p>
                    <p>{booking.time}</p>
                  </div>
                  <div>
                    <p
                      className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Amount Paid
                    </p>
                    <p className="text-green-600">
                      Rs. {invoice.pricing.paidAmount.toLocaleString()}
                    </p>
                  </div>
                  {invoice.pricing.balanceAmount > 0 && (
                    <div>
                      <p
                        className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Balance Due
                      </p>
                      <p className="text-orange-600">
                        Rs. {invoice.pricing.balanceAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowInvoice(true)}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  View & Download Invoice
                </button>

                <button
                  onClick={() => navigate("/staff")}
                  className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    theme === "dark"
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8">
            <button
              onClick={() => setShowInvoice(false)}
              className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Confirmation
            </button>
            <InvoiceGenerator invoice={invoice} theme={theme} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <Header
        user={user}
        onLogout={onLogout}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <h1
            className={`text-4xl mb-2 ${theme === "dark" ? "text-white" : ""}`}
          >
            Complete Your Booking
          </h1>
          <p
            className={`mb-8 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
          >
            Choose your preferred payment method to confirm your booking
          </p>

          <PaymentOptions
            totalAmount={booking.price}
            serviceDetails={{
              serviceName: booking.serviceType || "Cleaning Service",
              customizations: [],
            }}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            theme={theme}
          />

          {/* Debug info */}
          {selectedPaymentMethod && (
            <div
              className={`mt-4 p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
            >
              <p className="text-sm">Selected: {selectedPaymentMethod}</p>
              <p className="text-sm">
                Booking loaded: {booking ? "Yes" : "No"}
              </p>
            </div>
          )}

          {/* Confirm Button - Only show for COD and Pay After Completion */}
          {selectedPaymentMethod &&
            (selectedPaymentMethod === "cod" ||
              selectedPaymentMethod === "pay-after-completion") && (
              <div className="mt-6">
                <button
                  onClick={handlePaymentProcessing}
                  disabled={processing}
                  className={`w-full py-4 rounded-lg text-lg transition-colors ${
                    processing
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
                <p
                  className={`text-xs mt-3 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  By confirming, you agree to our terms and conditions
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
