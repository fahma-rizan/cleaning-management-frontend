import { useState, useEffect } from "react";
import {
  Search,
  Clock,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  MoreVertical,
  X,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Pagination } from "../ui/pagination";
import { complaintAPI, staffAPI } from "../../lib/api";
import { toast } from "sonner";

interface Complaint {
  _id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  description: string;
  customerName: string;
  serviceName: string;
  serviceDate: string;
  assignedStaffName: string;
  status: "Pending" | "In Progress" | "Resolved";
  notes: Array<{ adminName: string; note: string; createdAt: string }>;
  createdAt: string;
}

export function ComplaintsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal form state
  const [modalForm, setModalForm] = useState({
    assignedStaff: "",
    status: "" as "Pending" | "In Progress" | "Resolved" | "",
    priority: "" as "High" | "Medium" | "Low" | "",
    newNote: "",
  });

  //State and Filtering
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Pending" | "In Progress" | "Resolved"
  >("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    setLoading(true);
    complaintAPI
      .getAll()
      .then((data) => setComplaints(data))
      .catch((err) => setError(err.error || "Failed to load complaints"))
      .finally(() => setLoading(false));
  }, []);

  //Staff assign
  const [staffList, setStaffList] = useState<{ _id: string; name: string }[]>(
    [],
  );
  useEffect(() => {
    staffAPI
      .getAll()
      .then((data) => setStaffList(data))
      .catch((err) => console.error(err));
  }, []);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus =
      statusFilter === "All" || complaint.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      complaint.title.toLowerCase().includes(query) ||
      complaint.description.toLowerCase().includes(query) ||
      complaint.customerName.toLowerCase().includes(query) ||
      complaint.serviceName.toLowerCase().includes(query) ||
      complaint.assignedStaffName.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setModalForm({
      assignedStaff: complaint.assignedStaffName,
      status: complaint.status,
      priority: complaint.priority,
      newNote: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    try {
      if (modalForm.assignedStaff) {
        await complaintAPI.assign(
          selectedComplaint._id,
          modalForm.assignedStaff,
        );
      }

      // Update status if changed
      if (modalForm.status && modalForm.status !== selectedComplaint.status) {
        await complaintAPI.updateStatus(
          selectedComplaint._id,
          modalForm.status,
        );
      }

      // Update priority if changed
      if (
        modalForm.priority &&
        modalForm.priority !== selectedComplaint.priority
      ) {
        await complaintAPI.updatePriority(
          selectedComplaint._id,
          modalForm.priority,
        );
      }

      // Add note if typed
      if (modalForm.newNote.trim()) {
        await complaintAPI.addNote(
          selectedComplaint._id,
          modalForm.newNote.trim(),
        );
      }

      // Refresh the complaint from API to get latest notes
      const updated = await complaintAPI.getById(selectedComplaint._id);
      setComplaints((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c)),
      );

      toast.success("Complaint updated successfully");
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.error || "Failed to update complaint");
    }
  };

  // Loading/error display
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
          Complaint Management
        </h1>
        <p className="text-gray-500 font-medium">
          Track and resolve customer complaints efficiently
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center">
            <Clock className="w-7 h-7 text-orange-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {complaints.filter((c) => c.status === "Pending").length}
            </div>
            <div className="text-gray-500 font-medium">Pending</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
            <ArrowRight className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {complaints.filter((c) => c.status === "In Progress").length}
            </div>
            <div className="text-gray-500 font-medium">In Progress</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-green-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {complaints.filter((c) => c.status === "Resolved").length}
            </div>
            <div className="text-gray-500 font-medium">Resolved</div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      {/* Search and Status Filters */}
      <div className="space-y-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search complaints..."
            className="pl-12 h-14 bg-white border-gray-200 rounded-xl focus-visible:ring-purple-600 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(["All", "Pending", "In Progress", "Resolved"] as const).map(
  (filter: "All" | "Pending" | "In Progress" | "Resolved") => {
    const count = filter === "All"
      ? complaints.length
      : complaints.filter((c) => c.status === filter).length;

    return (
      <button
        key={filter}
        onClick={() => setStatusFilter(filter)}
        className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
          statusFilter === filter
            ? "bg-purple-600 text-white shadow-lg shadow-purple-100"
            : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
        }`}
      >
        {filter}
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          statusFilter === filter
            ? "bg-white/20 text-white"
            : "bg-gray-100 text-gray-500"
        }`}>
          {count}
        </span>
      </button>
    );
  }
)}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {paginatedComplaints.map((complaint) => (
          <div
            key={complaint._id}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-purple-100 transition-colors group relative"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-gray-400 font-medium">
                    {complaint._id}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">
                    {complaint.title}
                  </h3>
                </div>

                <p className="text-gray-600 leading-relaxed text-lg max-w-4xl">
                  {complaint.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500 font-medium text-sm pt-2">
                  <span>By {complaint.customerName}</span>
                  <span>Assigned: {complaint.assignedStaffName}</span>
                  <span>
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                  {complaint.notes.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>{complaint.notes.length} notes</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge
                  className={`
                  ${complaint.status === "Pending" ? "bg-orange-50 text-orange-500 hover:bg-orange-50" : ""}
                  ${complaint.status === "In Progress" ? "bg-blue-50 text-blue-600 hover:bg-blue-50" : ""}
                  ${complaint.status === "Resolved" ? "bg-green-50 text-green-600 hover:bg-green-50" : ""}
                  rounded-full px-5 py-2.5 font-bold text-base flex items-center gap-2 border-none shadow-none min-w-[140px] justify-center
                `}
                >
                  {complaint.status === "Pending" && (
                    <Clock className="w-5 h-5" />
                  )}
                  {complaint.status === "In Progress" && (
                    <ArrowRight className="w-5 h-5" />
                  )}
                  {complaint.status === "Resolved" && (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  {complaint.status}
                </Badge>
                <Button
                  onClick={() => handleViewDetails(complaint)}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-2.5 font-bold h-auto"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredComplaints.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        itemLabel="complaints"
      />

      {/* Details Modal */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold">Complaint Details</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Complaint ID and Priority */}
              <div>
                <div className="text-gray-600 mb-2">
                  Complaint ID: #{selectedComplaint._id}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-600">Priority:</span>
                  <div className="flex items-center gap-2">
                    {selectedComplaint.priority === "High" && (
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    )}
                    {selectedComplaint.priority === "Medium" && (
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    )}
                    {selectedComplaint.priority === "Low" && (
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    )}
                    <span className="text-gray-900">
                      {selectedComplaint.priority}
                    </span>
                  </div>
                </div>
                <div className="text-gray-600">
                  Status:{" "}
                  <span className="text-gray-900">
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-bold mb-3">
                  Customer Information:
                </h3>
                <div className="space-y-2">
                  <div className="text-gray-600">
                    Name:{" "}
                    <span className="text-gray-900">
                      {selectedComplaint.customerName}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    Email: <span className="text-gray-900">N/A</span>
                  </div>
                  <div className="text-gray-600">
                    Phone: <span className="text-gray-900">N/A</span>
                  </div>
                </div>
              </div>

              {/* Related Service */}
              <div>
                <h3 className="text-lg font-bold mb-3">Related Service</h3>
                <div className="space-y-2">
                  <div className="text-gray-600">
                    Service:{" "}
                    <span className="text-gray-900">
                      {selectedComplaint.serviceName}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    Date:{" "}
                    <span className="text-gray-900">
                      {selectedComplaint.serviceDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold mb-3">Description:</h3>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-gray-700">
                  {selectedComplaint.description}
                </div>
              </div>

              {/* Existing Internal Notes */}
              {selectedComplaint.notes &&
                selectedComplaint.notes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-3">
                      Internal Notes ({selectedComplaint.notes.length}):
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedComplaint.notes.map((note, index) => (
                        <div
                          key={index}
                          className="bg-purple-50 border border-purple-100 p-4 rounded-lg"
                        >
                          <div className="text-xs text-purple-600 font-bold mb-2">
                            {new Date(note.createdAt).toLocaleString()} —{" "}
                            {note.adminName}
                          </div>
                          <div className="text-gray-900">{note.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Add Internal Notes */}
              <div>
                <h3 className="text-lg font-bold mb-3">
                  Add Internal Notes (not visible to customer):
                </h3>
                <textarea
                  value={modalForm.newNote}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, newNote: e.target.value })
                  }
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Type your note here..."
                />
              </div>

              {/* Action Dropdowns */}
              <div className="space-y-3">
                <div>
                  <label className="text-gray-600 block mb-2">Assign to:</label>
                  <select
                    value={modalForm.assignedStaff}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        assignedStaff: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="">Select Staff</option>
                    {staffList.map((staff) => (
                      <option key={staff._id} value={staff._id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-600 block mb-2">
                    Change Status:
                  </label>
                  <select
                    value={modalForm.status}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        status: e.target.value as
                          | "Pending"
                          | "In Progress"
                          | "Resolved",
                      })
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="">[Select Status ▼]</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-600 block mb-2">Priority:</label>
                  <select
                    value={modalForm.priority}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        priority: e.target.value as "High" | "Medium" | "Low",
                      })
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="">[Select Priority ▼]</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end">
                <Button
                  onClick={handleUpdateComplaint}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-8 py-3 font-bold"
                >
                  Update Complaint
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
