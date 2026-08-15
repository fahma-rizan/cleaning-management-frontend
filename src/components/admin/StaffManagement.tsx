import { useState, useRef, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Star,
  Phone,
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { Pagination } from "../ui/pagination";
import { staffAPI, getPhotoUrl } from "../../lib/api";

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  nic: string;
  address: string;
  specifications: string[];
  rating: number;
  jobsCompleted: number;
  staffStatus: "Active" | "Inactive";
  profilePhoto: string;
}

const normalizeStaffMember = (staff: any): StaffMember => ({
  ...staff,
  staffStatus: staff.staffStatus ?? staff.status ?? "Active",
});

export function StaffManagement() {
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  useEffect(() => {
    staffAPI
      .getAll()
      .then((data) => setStaffMembers(data.map(normalizeStaffMember)))
      .catch((err) => setError(err.error || "Failed to load staff"))
      .finally(() => setLoading(false));
  }, []);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nic: "",
    address: "",
    specifications: [] as string[],
    status: "Active" as "Active" | "Inactive",
    photo: null as File | null,
  });

  const specificationsList = [
    "Home/Office Cleaning",
    "Laundry Service",
    "Shampoo Vacuum Cleaning",
    "Curtains Cleaning",
  ];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
    }
  };

  const toggleSpecification = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.includes(spec)
        ? prev.specifications.filter((s) => s !== spec)
        : [...prev.specifications, spec],
    }));
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.photo ||
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.nic
    ) {
      toast.error("Please fill all compulsory fields and upload a photo");
      return;
    }

    try {
      // Build FormData for API
      const fd = new FormData();
      fd.append("name", formData.fullName);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      fd.append("nic", formData.nic);
      fd.append("address", formData.address);
      fd.append("specifications", JSON.stringify(formData.specifications));
      fd.append("status", formData.status);
      if (formData.photo) fd.append("photo", formData.photo);

      if (view === "edit" && editingStaff) {
        const updated = await staffAPI.update(editingStaff._id, fd);
        setStaffMembers((prev) =>
          prev.map((s) =>
            s._id === editingStaff._id ? normalizeStaffMember(updated) : s,
          ),
        );
      } else {
        const newStaff = await staffAPI.create(fd);
        setStaffMembers((prev) => [normalizeStaffMember(newStaff), ...prev]);
      }

      toast.success("Save staff successfully", {
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        className: "bg-white border-green-100",
      });

      // Reset form and "redirect" (stay on add interface as requested)
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        nic: "",
        address: "",
        specifications: [],
        status: "Active",
        photo: null,
      });
      setEditingStaff(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error(err.error || "Failed to save staff");
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await staffAPI.deactivate(id);
      setStaffMembers((prev) =>
        prev.map((staff) =>
          staff._id === id ? { ...staff, staffStatus: "Inactive" } : staff,
        ),
      );
      setActiveActionMenu(null);
      toast.info("Staff member deactivated");
    } catch (err: any) {
      toast.error(err.error || "Failed to deactivate staff");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await staffAPI.activate(id);
      setStaffMembers((prev) =>
        prev.map((staff) =>
          staff._id === id ? { ...staff, staffStatus: "Active" } : staff,
        ),
      );
      setActiveActionMenu(null);
      toast.success("Staff member reactivated");
    } catch (err: any) {
      toast.error(err.error || "Failed to reactivate staff");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this staff member? This action cannot be undone.",
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      await staffAPI.delete(id);
      setStaffMembers((prev) => prev.filter((staff) => staff._id !== id));
      setActiveActionMenu(null);
      setDeletingId(null);
      toast.success("Staff member deleted successfully");
    } catch (err: any) {
      setDeletingId(null);
      toast.error(err.error || "Failed to delete staff");
    }
  };

  const filteredStaff = staffMembers.filter(
    (s) =>
      (statusFilter === "All" || s.staffStatus === statusFilter) &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (view === "add" || view === "edit") {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {view === "edit" ? "Edit Staff Member" : "Add New Staff Member"}
          </h2>
          <button
            onClick={() => setView("list")}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSaveStaff} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-sm">
              {formData.photo ? (
                <img
                  src={URL.createObjectURL(formData.photo)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="w-8 h-8 text-purple-600" />
              )}
            </div>
            <Button
              type="button"
              onClick={handleUploadClick}
              className="bg-white hover:bg-gray-50 text-purple-600 border border-purple-200 font-semibold px-6"
            >
              Click to upload photo
            </Button>
            <p className="text-xs text-gray-400 mt-2">* Compulsory</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Full Name *
              </label>
              <Input
                required
                placeholder="Enter full name"
                className="h-12 rounded-xl"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Email Address *
              </label>
              <Input
                required
                type="email"
                placeholder="Enter email address"
                className="h-12 rounded-xl"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Phone Number *
              </label>
              <Input
                required
                placeholder="Enter phone number"
                className="h-12 rounded-xl"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                NIC Number *
              </label>
              <Input
                required
                placeholder="Enter NIC number"
                className="h-12 rounded-xl"
                value={formData.nic}
                onChange={(e) =>
                  setFormData({ ...formData, nic: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Address (Optional)
            </label>
            <Input
              placeholder="Enter home address"
              className="h-12 rounded-xl"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 block">
              Specification (Select one or more)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specificationsList.map((spec) => (
                <label
                  key={spec}
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={formData.specifications.includes(spec)}
                    onChange={() => toggleSpecification(spec)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                    {spec}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-sm font-semibold text-gray-700 block">
              Status
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={formData.status === "Active"}
                  onChange={() =>
                    setFormData({ ...formData, status: "Active" })
                  }
                  className="w-5 h-5 border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={formData.status === "Inactive"}
                  onChange={() =>
                    setFormData({ ...formData, status: "Inactive" })
                  }
                  className="w-5 h-5 border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium text-gray-700">Inactive</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setView("list")}
              className="flex-1 h-14 rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-14 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg shadow-lg shadow-purple-200"
            >
              Save Staff Member
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Loading and error states
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-1">
            Manage your cleaning staff and assignments
          </p>
        </div>
        <Button
          onClick={() => setView("add")}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-6 h-11 flex items-center justify-center font-bold shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Add Staff
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search staff..."
            className="pl-11 h-12 border-gray-200 rounded-xl bg-white shadow-sm focus-visible:ring-purple-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
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

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[980px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">
                  Photo
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">
                  Name
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">
                  Rating
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">
                  Jobs
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">
                  Contact
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase text-gray-500 tracking-widest">
                  Status
                </th>
                <th className="px-6 py-5 text-xs font-black uppercase text-gray-500 tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedStaff.map((staff) => (
                <tr
                  key={staff._id}
                  className="hover:bg-gray-50/30 transition-colors group"
                >
                  <td className="px-6 py-5">
                    {staff.profilePhoto ? (
                      <img
                        src={getPhotoUrl(staff.profilePhoto)}
                        alt={staff.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                        {staff.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-gray-900">
                      {staff.name}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{staff.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-gray-700">
                    {staff.jobsCompleted} jobs
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{staff.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge
                      className={`
                      ${staff.staffStatus === "Active" ? "bg-green-50 text-green-600 border-none px-3 py-1" : ""}
                      ${staff.staffStatus === "Inactive" ? "bg-gray-50 text-gray-600 border-none px-3 py-1" : ""}
                      rounded-full font-semibold text-sm shadow-none
                    `}
                    >
                      {staff.staffStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() =>
                          setActiveActionMenu(
                            activeActionMenu === staff._id ? null : staff._id,
                          )
                        }
                        className="p-2 text-gray-300 hover:text-gray-600 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {activeActionMenu === staff._id && (
                        <div 
                        ref={dropdownRef}
                        className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden">
                          <button
                            onClick={() => {
                              setSelectedStaff(staff);
                              setActiveActionMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() =>
                              staff.staffStatus === "Inactive"
                                ? handleActivate(staff._id)
                                : handleDeactivate(staff._id)
                            }
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium ${
                              staff.staffStatus === "Inactive"
                                ? "text-green-600 hover:bg-green-50"
                                : "text-red-600 hover:bg-red-50"
                            }`}
                          >
                            {staff.staffStatus === "Inactive"
                              ? "Reactivate"
                              : "Deactivate"}
                          </button>
                          <button
                            onClick={() => handleDelete(staff._id)}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 border-t border-gray-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <>
            <div className="p-20 text-center text-gray-500 font-bold">
              No staff found
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredStaff.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="staff"
            />
          </>
        )}
      </div>

      {selectedStaff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedStaff(null)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-600">
              <h2 className="text-2xl font-bold text-white">Staff Details</h2>
              <button
                onClick={() => setSelectedStaff(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center gap-4">
                {selectedStaff.profilePhoto ? (
                  <img
                    src={getPhotoUrl(selectedStaff.profilePhoto)}
                    alt={selectedStaff.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl">
                    {selectedStaff.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedStaff.name}
                  </h3>
                  <Badge
                    className={`
                    ${selectedStaff.staffStatus === "Active" ? "bg-green-50 text-green-600 border-none px-3 py-1" : ""}
                    ${selectedStaff.staffStatus === "Inactive" ? "bg-gray-50 text-gray-600 border-none px-3 py-1" : ""}
                    rounded-full font-semibold text-sm shadow-none mt-1
                  `}
                  >
                    {selectedStaff.staffStatus}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Email
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {selectedStaff.email}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Phone
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {selectedStaff.phone}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    NIC
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {selectedStaff.nic}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Address
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {selectedStaff.address || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Rating
                  </p>
                  <div className="flex items-center gap-1.5 text-gray-900 font-semibold">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedStaff.rating}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Jobs
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {selectedStaff.jobsCompleted}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Specifications
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedStaff.specifications.length > 0 ? (
                    selectedStaff.specifications.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold"
                      >
                        {spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      No specifications
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
