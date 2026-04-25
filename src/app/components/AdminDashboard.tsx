import { useState } from "react";
import { LogOut, RefreshCw, UserCheck, Users } from "lucide-react";
import { Button } from "./ui/button";
import type { User } from "../types";
import { StaffManagement } from "./admin/StaffManagement";
import { StaffAvailabilityManagement } from "./admin/StaffAvailabilityManagement";
import { TaskReassignmentManagement } from "./admin/TaskReassignmentManagement";
import imgLogo from "figma:asset/d0e24839a24076173960597a25c12b48f3330fdf.png";

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
}: AdminDashboardProps) {
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
  ] as const;

  const [activeTab, setActiveTab] = useState<
    "staff" | "staff-availability" | "task-reassignment"
  >("staff");

  const activeLabel =
    sidebarItems.find((item) => item.id === activeTab)?.name ??
    sidebarItems
      .flatMap((item) => item.subItems ?? [])
      .find((item) => item.id === activeTab)?.name ??
    "Staff Management";

  return (
    <div className="flex min-h-screen bg-[#FDFCFE] dark:bg-gray-950 transition-colors">
      <aside className="w-64 bg-[#1e1534] text-white flex flex-col fixed h-screen overflow-y-auto z-50 shadow-2xl lg:translate-x-0 -translate-x-full">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-900/40">
            <img
              src={imgLogo}
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
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setActiveTab(sub.id)}
                          className={`w-full flex items-center gap-2.5 text-left py-2 text-xs font-bold transition-colors uppercase tracking-widest ${isSubActive ? "text-white" : "text-gray-400 hover:text-purple-400"}`}
                        >
                          <SubIcon className="w-4 h-4 shrink-0" />
                          <span>{sub.name}</span>
                        </button>
                      );
                    })}
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
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 min-h-screen bg-[#FDFCFE] dark:bg-gray-950 transition-all duration-300">
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-900 px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {activeLabel}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Staff operations only
            </p>
          </div>
          <Button
            variant="outline"
            className="h-10 px-4 gap-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 shrink-0"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>

        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            {activeTab === "staff" && <StaffManagement />}
            {activeTab === "staff-availability" && (
              <StaffAvailabilityManagement />
            )}
            {activeTab === "task-reassignment" && (
              <TaskReassignmentManagement />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
