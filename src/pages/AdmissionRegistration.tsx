import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import BASE_URL from "../api";
import { Trash } from "lucide-react";

interface Admission {
  _id?: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  dob: string;
  fatherName: string;
  fatherNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  course: string;
  paymentOption: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  rzp_payment_id: string;
}

const PAGE_SIZE = 20;

const statusBadge = (status: string) => {
  const base =
    "px-2.5 py-1 rounded-full text-xs font-medium capitalize inline-block";
  if (status.toLowerCase() === "success")
    return `${base} bg-green-100 text-green-700`;
  if (status.toLowerCase() === "pending")
    return `${base} bg-yellow-100 text-yellow-700`;
  return `${base} bg-red-100 text-red-700`;
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between border-b border-gray-100 py-2 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-800 font-medium text-right break-all">
      {value}
    </span>
  </div>
);

const AdmissionRegistration = () => {
  const [data, setData] = useState<Admission[]>([]);
  const [selected, setSelected] = useState<Admission | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const getUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admission/get`);
      const result = res.data;
      setData(result.data);
    } catch (err) {
      console.log("Failed to fetch Data", err);
    }
  };

  const deleteAdmission = async (id: any) => {
    try {
      const confirmDel = confirm("Are you sure deleting admission?");
      if (confirmDel) {
        await axios.delete(`${BASE_URL}/api/admission/delete/${id}`);

        setData((p) => p.filter((del) => del._id == id));
        alert("Admission Deleted successfully !");
        getUsers();
      }
    } catch (err) {
      alert("Failed to delete");
      console.log("error", err);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Unique course names for the filter dropdown
  const courseOptions = useMemo(() => {
    const courses = Array.from(new Set(data.map((row) => row.course)));
    return courses;
  }, [data]);

  // Apply course filter
  const filteredData = useMemo(() => {
    if (courseFilter === "all") return data;
    return data.filter((row) => row.course === courseFilter);
  }, [data, courseFilter]);

  // Reset to page 1 whenever the filter or the underlying data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [courseFilter, data.length]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const formatDate = (value: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className=" text-2xl font-semibold text-gray-800">Admissions</h1>

          {/* Course filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="courseFilter"
              className="text-sm text-gray-600 whitespace-nowrap"
            >
              Filter by Course
            </label>
            <select
              id="courseFilter"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="all">All </option>
              {courseOptions.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">S.No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Number</th>
                  <th className="px-4 py-3">Course</th>
                  {/* <th className="px-4 py-3">City</th> */}
                  {/* <th className="px-4 py-3">Payment Option</th> */}
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
                {paginatedData.map((row, idx) => (
                  <tr
                    key={row._id ?? idx}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {row.fullName}
                    </td>
                    <td className="px-4 py-3">{row.age}</td>
                    <td className="px-4 py-3">{row.phone}</td>
                    <td className="px-4 py-3">{row.course}</td>
                    {/* <td className="px-4 py-3">{row.city}</td> */}
                    {/* <td className="px-4 py-3 capitalize">{row.paymentOption}</td> */}
                    <td className="px-4 py-3">₹{row.amount}</td>
                    <td className="px-4 py-3">
                      <span className={statusBadge(row.paymentStatus)}>
                        {row.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelected(row)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteAdmission(row._id)}
                          className="px-3 py-1.5 font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}
                {"–"}
                {Math.min(currentPage * PAGE_SIZE, filteredData.length)} of{" "}
                {filteredData.length}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        page === currentPage
                          ? "bg-gray-800 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Admission Details
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1 grid grid-cols-2 sm:grid-cols-2 gap-8">
              <div>
                <DetailRow label="Full Name" value={selected.fullName} />
                <DetailRow label="Email" value={selected.email} />
                <DetailRow label="Phone" value={selected.phone} />
                <DetailRow label="Age" value={selected.age} />
                <DetailRow label="Gender" value={selected.gender} />
                <DetailRow label="DOB" value={formatDate(selected.dob)} />
                <DetailRow label="Father's Name" value={selected.fatherName} />
                <DetailRow
                  label="Father's Number"
                  value={selected.fatherNumber}
                />
                <DetailRow label="Address" value={selected.address} />
              </div>
              <div>
                <DetailRow label="City" value={selected.city} />
                <DetailRow label="State" value={selected.state} />
                <DetailRow label="Country" value={selected.country} />
                <DetailRow label="Course" value={selected.course} />
                <DetailRow
                  label="Submission Date"
                  value={formatDate(selected.createdAt)}
                />
                <DetailRow
                  label="Payment Option"
                  value={selected.paymentOption}
                />
                <DetailRow label="Amount" value={`₹${selected.amount}`} />
                <DetailRow
                  label="Payment Status"
                  value={
                    <span className={statusBadge(selected.paymentStatus)}>
                      {selected.paymentStatus}
                    </span>
                  }
                />
                <DetailRow
                  label="Razorpay Payment ID"
                  value={selected.rzp_payment_id || "-"}
                />
              </div>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-5 w-full py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionRegistration;
