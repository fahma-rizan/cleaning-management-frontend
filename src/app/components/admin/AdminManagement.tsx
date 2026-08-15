import { useState, useRef, useEffect } from "react";
import { adminAPI } from "../../lib/api";
import {
  ShieldCheck,
  Search,
  Plus,
  MoreVertical,
  X,
  Trash2,
  Edit2,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  Eye,
  Ban,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Pagination } from "../ui/pagination";
import {
  type AdminRole,
  getAdminRowActions,
  getAssignableRoles,
} from "../../lib/permissions";
import { normalizePhoneNumber } from "../../lib/phone";
import type { User } from "../../types";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  adminRole: AdminRole;
  adminStatus: "Active" | "Inactive";
  lastActive: string;
  isSuperAdmin?: boolean; // flag to lock the super admin row
}



interface AdminManagementProps {
  currentUser: User;
}

export function AdminManagement({ currentUser }: AdminManagementProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminAPI
      .getAll()
      .then((data) => setAdmins(data))
      .catch((err) => setError(err.error || "Failed to load admins"))
      .finally(() => setLoading(false));
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [viewingAdmin, setViewingAdmin] = useState<AdminUser | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "Main Admin" as AdminRole,
    status: "Active" as "Active" | "Inactive",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleOpenModal = (admin: AdminUser | null = null) => {
    // Super Admin record is permanently protected — never open edit for it
    if (admin?.isSuperAdmin) return;
    const assignable = getAssignableRoles(
      currentUser.adminRole ?? "Customer Support",
    );
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        address: admin.address,
        password: "",
        role: admin.adminRole,
        status: admin.adminStatus,
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        role: assignable[0] ?? "Operations Manager",
        status: "Active",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const assignable = getAssignableRoles(
      currentUser.adminRole ?? "Customer Support",
    );

    // Extra guard: verify the chosen role is actually assignable
    if (!assignable.includes(formData.role)) {
      alert("You are not permitted to assign this role.");
      return;
    }
    try {
      const normalizedPhone = normalizePhoneNumber(formData.phone);

      if (editingAdmin) {
        const updated = await adminAPI.update(editingAdmin._id, {
          role: formData.role,
          status: formData.status,
          name: formData.name,
          phone: normalizedPhone,
          address: formData.address,
        });
        setAdmins((prev) =>
          prev.map((a) => (a._id === editingAdmin._id ? updated : a)),
        );
      } else {
        const newAdmin = await adminAPI.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: normalizedPhone,
          address: formData.address,
          role: formData.role,
        });
        setAdmins((prev) => [...prev, newAdmin]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.error || "Failed to save admin");
    }
  };

  const handleDelete = async (id: string) => {
    const target = admins.find((a) => a._id === id);
    if (target?.isSuperAdmin) return;
    if (!window.confirm("Are you sure you want to remove this admin?")) return;
    try {
      await adminAPI.delete(id);
      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch (err: any) {
      alert(err.error || "Failed to delete admin");
    }
  };

  const handleViewDetails = (admin: AdminUser) => {
    setViewingAdmin(admin);
    setOpenDropdown(null);
  };

  const handleEditFromDropdown = (admin: AdminUser) => {
    handleOpenModal(admin);
    setOpenDropdown(null);
  };

  const handleDeactivate = async (admin: AdminUser) => {
    if (admin.isSuperAdmin) return;
    if (!window.confirm(`Are you sure you want to deactivate ${admin.name}?`))
      return;
    try {
      await adminAPI.deactivate(admin._id);
      setAdmins((prev) =>
        prev.map((a) =>
          a._id === admin._id ? { ...a, status: "Inactive" as "Inactive" } : a,
        ),
      );
    } catch (err: any) {
      alert(err.error || "Failed to deactivate admin");
    }
    setOpenDropdown(null);
  };

  const handleActivate = async (admin: AdminUser) => {
    if (admin.isSuperAdmin) return;
    try {
      await adminAPI.activate(admin._id);
      setAdmins((prev) =>
        prev.map((a) =>
          a._id === admin._id ? { ...a, status: "Active" as "Active" } : a,
        ),
      );
    } catch (err: any) {
      alert(err.error || "Failed to reactivate admin");
    }
    setOpenDropdown(null);
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (admin.isSuperAdmin) return;
    if (!window.confirm(`Are you sure you want to delete ${admin.name}? This action cannot be undone.`))
      return;
    try {
      await adminAPI.delete(admin._id);
      setAdmins((prev) => prev.filter((a) => a._id !== admin._id));
    } catch (err: any) {
      alert(err.error || "Failed to delete admin");
    }
    setOpenDropdown(null);
  };

  // In a real app, these handlers would make API calls and refresh the list from the server
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
    <div className="w-full space-y-8 transition-opacity duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Users</h1>
            <p className="text-gray-500 font-medium">
              Manage system administrators and their permissions
            </p>
          </div>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-purple-100 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search Admin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-purple-500 bg-white"
        />
      </div>

      {/* Admin Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-visible">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-4 sm:px-6 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">
                Admin Details
              </th>
              <th className="px-4 sm:px-6 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">
                Role
              </th>
              <th className="px-4 sm:px-6 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">
                Status
              </th>
              <th className="px-4 sm:px-6 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">
                Last Active
              </th>
              <th className="px-4 sm:px-6 py-5 text-xs font-black uppercase text-gray-500 tracking-widest text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedAdmins.map((admin) => (
              <tr
                key={admin._id}
                className="hover:bg-gray-50/30 transition-colors group"
              >
                <td className="px-4 sm:px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block">
                        {admin.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {admin.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      admin.adminRole === "Super Admin"
                        ? "bg-yellow-100 text-yellow-700"
                        : admin.adminRole === "Main Admin"
                          ? "bg-purple-100 text-purple-700"
                          : admin.adminRole === "Operations Manager"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {admin.adminRole}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${admin.adminStatus === "Active" ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <span
                      className={`text-sm font-bold ${admin.adminStatus === "Active" ? "text-green-600" : "text-gray-400"}`}
                    >
                      {admin.adminStatus}
                    </span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-5 text-sm font-medium text-gray-500">
                  {admin.lastActive}
                </td>
                <td className="px-4 sm:px-6 py-5 text-right">
                  <div
                    className="relative inline-block"
                    ref={openDropdown === admin._id ? dropdownRef : null}
                  >
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === admin._id ? null : admin._id,
                        )
                      }
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openDropdown === admin._id && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        {/* View — always visible for everyone */}
                        <button
                          onClick={() => handleViewDetails(admin)}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                          View Details
                        </button>

                        {/* Edit and Deactivate — only if permitted by hierarchy */}
                        {(() => {
                          const { canEdit, canDeactivate } = getAdminRowActions(
                            currentUser.adminRole ?? "Customer Support",
                            admin.adminRole,
                          );
                          return (
                            <>
                              {canEdit && (
                                <button
                                  onClick={() => handleEditFromDropdown(admin)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-500" />
                                  Edit Admin
                                </button>
                              )}
                              {canDeactivate && (
                                <>
                                  <button
                                    onClick={() =>
                                      admin.adminStatus === "Inactive"
                                        ? handleActivate(admin)
                                        : handleDeactivate(admin)
                                    }
                                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors border-t border-gray-100 ${
                                      admin.adminStatus === "Inactive"
                                        ? "text-green-600 hover:bg-green-50"
                                        : "text-red-600 hover:bg-red-50"
                                    }`}
                                  >
                                    <Ban className="w-4 h-4" />
                                    {admin.adminStatus === "Inactive" ? "Reactivate" : "Deactivate"}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAdmin(admin)}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                    Delete
                                  </button>
                                </>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAdmins.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-bold">No admins found</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredAdmins.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        itemLabel="admins"
      />

      {/* View Details Modal */}
      {viewingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-600">
              <h2 className="text-2xl font-bold text-white">Admin Details</h2>
              <button
                onClick={() => setViewingAdmin(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Admin Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="flex items-start gap-8 mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {viewingAdmin.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Full Name
                    </label>
                    <div className="text-xl font-bold text-gray-900">
                      {viewingAdmin.name}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-900 font-medium">
                        {viewingAdmin.email}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-900 font-medium">
                        {viewingAdmin.phone}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Address
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-900 font-medium">
                        {viewingAdmin.address}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Role
                    </label>
                    <span
                      className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${
                        viewingAdmin.adminRole === "Main Admin"
                          ? "bg-purple-100 text-purple-700"
                          : viewingAdmin.adminRole === "Operations Manager"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {viewingAdmin.adminRole}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Status
                    </label>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${viewingAdmin.adminStatus === "Active" ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span
                        className={`text-sm font-bold ${viewingAdmin.adminStatus === "Active" ? "text-green-600" : "text-gray-400"}`}
                      >
                        {viewingAdmin.adminStatus}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Last Active
                    </label>
                    <span className="text-gray-900 font-medium">
                      {viewingAdmin.lastActive}
                    </span>
                  </div>
                </div>
              </div>

              {(["Super Admin", "Main Admin"] as AdminRole[]).includes(
                currentUser.adminRole ?? "Customer Support",
              ) && (
                <Button
                  onClick={() => handleOpenModal()}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-purple-100 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-purple-600">
              <h2 className="text-2xl font-bold text-white">
                {editingAdmin ? "Edit Admin" : "Add New Admin"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {editingAdmin ? (
                  // Read-only display for editing mode
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-3">
                    <div>
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Name
                      </Label>
                      <div className="text-gray-900 font-bold mt-1">
                        {formData.name}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Contact Number
                      </Label>
                      <div className="text-gray-900 font-medium mt-1">
                        {formData.phone}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Address
                      </Label>
                      <div className="text-gray-900 font-medium mt-1">
                        {formData.address}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Editable fields for adding new admin
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">
                        Name
                      </Label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Enter full name"
                          className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">
                        Contact Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+94 77 123 4567"
                          className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">
                        Address
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          placeholder="Enter address"
                          className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      type="email"
                      placeholder="admin@cloudlaundry.lk"
                      className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {!editingAdmin && (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        type="password"
                        placeholder="••••••••"
                        className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-bold text-gray-700">
                    Role
                  </Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(val: AdminRole) =>
                      setFormData({ ...formData, role: val })
                    }
                    className="grid grid-cols-1 gap-3"
                  >
                    {getAssignableRoles(
                      currentUser.adminRole ?? "Customer Support",
                    ).map((role) => (
                      <div
                        key={role}
                        className="flex items-center space-x-2 p-3 rounded-xl border border-gray-100 hover:bg-purple-50 transition-colors"
                      >
                        <RadioGroupItem value={role} id={`role-${role}`} />
                        <div className="flex-1 cursor-pointer">
                          <Label
                            htmlFor={`role-${role}`}
                            className="font-bold block cursor-pointer"
                          >
                            {role}
                          </Label>
                          <span className="text-xs text-gray-500">
                            {role === "Main Admin" &&
                              "Full access to all tabs and features."}
                            {role === "Operations Manager" &&
                              "Access to Overview, Staff Management, Inventory, and GPS Tracking."}
                            {role === "Customer Support" &&
                              "Access to Overview, Customer Management, Reviews, and Complaints."}
                          </span>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <Label className="text-sm font-bold text-gray-700">
                    Account Status
                  </Label>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroup
                        value={formData.status}
                        onValueChange={(val: "Active" | "Inactive") =>
                          setFormData({ ...formData, status: val })
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Active" id="status-active" />
                          <Label
                            htmlFor="status-active"
                            className="font-bold cursor-pointer text-green-600"
                          >
                            Active
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="Inactive"
                            id="status-inactive"
                          />
                          <Label
                            htmlFor="status-inactive"
                            className="font-bold cursor-pointer text-gray-500"
                          >
                            Inactive
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex items-center gap-3 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-12 rounded-xl font-bold text-gray-600 border-gray-200 hover:bg-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 h-12 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white"
              >
                {editingAdmin ? "Save Changes" : "Save Admin"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
