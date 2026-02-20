import { useState } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Package,
  MessageSquare,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  ClipboardList,
  Receipt,
  CreditCard,
  Banknote,
  Download,
  Filter,
  MapPin,
  BarChart3,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  LayoutDashboard,
  FileText,
  AlertCircle,
  LogOut,
  ChevronRight,
  Search,
  Bell,
  PackageOpen,
  Layers,
  AlertTriangle,
  Plus,
  Settings2,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Header from "./Header";
import BackButton from "./BackButton";
import { Button } from "./ui/button";
import type { User } from "../types";
import { StaffManagement } from "./admin/StaffManagement";
import { StaffAvailabilityManagement } from "./admin/StaffAvailabilityManagement";
import { TaskReassignmentManagement } from "./admin/TaskReassignmentManagement";
import logo from "figma:asset/d0e24839a24076173960597a25c12b48f3330fdf.png";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  onProfileClick?: () => void;
}

const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5000 },
  { month: "Mar", revenue: 5800 },
  { month: "Apr", revenue: 6400 },
  { month: "May", revenue: 7200 },
  { month: "Jun", revenue: 7900 },
  { month: "Jul", revenue: 8500 },
];

const serviceData = [
  { name: "Deep Cleaning", value: 35, color: "#7C3AED" },
  { name: "Regular", value: 28, color: "#3B82F6" },
  { name: "Laundry", value: 18, color: "#F59E0B" },
  { name: "Sofa Cleaning", value: 12, color: "#D946EF" },
  { name: "Other", value: 7, color: "#64748B" },
];

export default function AdminDashboard({
  user,
  onLogout,
  theme,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("staff");

  const paymentRecords = [
    {
      id: "PAY-1001",
      bookingId: "BK-1001",
      customer: "Priya Silva",
      service: "Home Cleaning",
      amount: 4500,
      paymentMethod: "Full Payment - Card",
      paymentStatus: "completed",
      date: "2025-02-12",
      time: "10:30 AM",
      transactionId: "TXN-4567890123",
    },
    {
      id: "PAY-1002",
      bookingId: "BK-1002",
      customer: "Rajesh Kumar",
      service: "Laundry Service",
      amount: 1200,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "pending",
      date: "2025-02-12",
      time: "02:00 PM",
      transactionId: "-",
    },
    {
      id: "PAY-1003",
      bookingId: "BK-1003",
      customer: "Nimal Fernando",
      service: "Sofa Cleaning",
      amount: 3500,
      paymentMethod: "Advance Payment (50%)",
      paymentStatus: "partial",
      date: "2025-02-13",
      time: "09:15 AM",
      transactionId: "TXN-4567890124",
    },
    {
      id: "PAY-1004",
      bookingId: "BK-1004",
      customer: "Sarah Johnson",
      service: "Deep Cleaning",
      amount: 8000,
      paymentMethod: "Full Payment - Bank Transfer",
      paymentStatus: "completed",
      date: "2025-02-13",
      time: "11:45 AM",
      transactionId: "TXN-4567890125",
    },
    {
      id: "PAY-1005",
      bookingId: "BK-1005",
      customer: "Ahmed Hassan",
      service: "Office Cleaning",
      amount: 5000,
      paymentMethod: "Pay After Completion",
      paymentStatus: "scheduled",
      date: "2025-02-14",
      time: "08:00 AM",
      transactionId: "-",
    },
    {
      id: "PAY-1006",
      bookingId: "BK-1006",
      customer: "Kumari Perera",
      service: "Carpet Cleaning",
      amount: 6200,
      paymentMethod: "Full Payment - Card",
      paymentStatus: "completed",
      date: "2025-02-11",
      time: "03:20 PM",
      transactionId: "TXN-4567890126",
    },
    {
      id: "PAY-1007",
      bookingId: "BK-1007",
      customer: "David Chen",
      service: "Window Cleaning",
      amount: 2800,
      paymentMethod: "Advance + Balance",
      paymentStatus: "partial",
      date: "2025-02-11",
      time: "01:10 PM",
      transactionId: "TXN-4567890127",
    },
  ];

  const sidebarItems = [
    {
      id: "staff",
      name: "Staff Management",
      icon: Users,
      subItems: [
        { id: "staff-availability", name: "Availability", icon: UserCheck },
        { id: "task-reassignment", name: "Reassignments", icon: RefreshCw },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDFCFE] dark:bg-gray-950 transition-colors">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-[#1e1534] text-white flex flex-col fixed h-screen overflow-y-auto z-50 shadow-2xl transition-transform duration-300 lg:translate-x-0 -translate-x-full">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-900/40">
              <img
                src={logo}
                alt="Cloud Laundry Logo"
                className="w-8 h-8 object-contain brightness-0 invert"
              />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight uppercase leading-none">
                Cloud Laundry.lk
              </h1>
              <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest mt-1">
                Admin Control Center
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative text-left ${isActive ? "bg-white/10 text-white shadow-xl" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                  <IconComponent
                    className={`w-5 h-5 shrink-0 ${isActive ? "text-purple-400" : "text-gray-400 group-hover:text-purple-300"}`}
                  />
                  <span className="font-bold text-sm tracking-wide flex-1 text-left">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute left-0 w-1.5 h-6 bg-purple-500 rounded-r-full" />
                  )}
                </button>
                {item.subItems && isActive && (
                  <div className="pl-12 space-y-1 mt-1">
                    {item.subItems.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveTab(sub.id)}
                        className="w-full text-left py-2 text-xs font-bold text-gray-400 hover:text-purple-400 transition-colors uppercase tracking-widest"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-lg border-2 border-white/10">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-purple-400 uppercase font-black tracking-tighter">
                System Administrator
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-white hover:bg-red-500/20 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 lg:ml-64 min-h-screen bg-[#FDFCFE] dark:bg-gray-950 transition-all duration-300">
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-900 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BackButton />
            <div className="h-6 w-[1px] bg-gray-100 dark:bg-gray-800" />
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight capitalize leading-none">
                {sidebarItems.find((item) => item.id === activeTab)?.name ||
                  "Admin Panel"}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Real-time Management System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
              <input
                type="text"
                placeholder="Search resources..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500/20 w-64 dark:text-white transition-all focus:bg-white"
              />
            </div>
            <button className="p-2.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-950"></span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === "staff-availability" && (
              <StaffAvailabilityManagement />
            )}
            {activeTab === "task-reassignment" && (
              <TaskReassignmentManagement />
            )}
            {activeTab === "staff" && <StaffManagement theme={theme} />}
            {activeTab === "admin-mgmt" && <AdminManagement />}
            {activeTab === "payments" && renderPaymentRecords()}
            {activeTab === "inventory" && renderInventoryManagement()}
            {activeTab === "reviews" && <ReviewsManagement />}
            {activeTab === "complaints" && <ComplaintsManagement />}
            {activeTab === "gps" && <GPSTracking />}
            {activeTab === "reports" && <ReportsManagement />}
            {activeTab === "settings" && <SystemSettings />}
          </div>
        </div>
      </main>
    </div>
  );
}