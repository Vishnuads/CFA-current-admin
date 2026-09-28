import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import BASE_URL from "../../api";
import { ArrowLeft, Trash } from "lucide-react";
import { Link } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Registration {
  _id: number;
  title: string;
  name: string;
  phone: string;
  email: string;
  amount: number;
  location: string;
  userType: string;
  filmInterest: string;
  paymentStatus: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
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

const WorkshopRegistration = () => {
  const [data, setData] = useState<Registration[]>([]);
  const [selected, setSelected] = useState<Registration | null>(null);
  const [titleFilter, setTitleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const getUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/workshop-registration/get`);
      const result = res.data;
      setData(result.data);
    } catch {
      alert("Failed to fetch Data");
    }
  };

  const deleteUser = async (id: any) => {
    try {
      const confirmDel = confirm("Are you sure want to Delete?");
      if (confirmDel) {
        await axios.delete(
          `${BASE_URL}/api/workshop-registration/delete/${id}`,
        );
        setData((p) => p.filter((del) => del._id == id));
      }
      getUsers();
      toast.success("Registration Deleted !");
    } catch (err) {
      console.log("Error", err);
      toast.error("Failed to delete");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Unique workshop titles for the filter dropdown
  const titleOptions = useMemo(() => {
    const titles = Array.from(new Set(data.map((row) => row.title)));
    return titles;
  }, [data]);

  // Apply title filter
  const filteredData = useMemo(() => {
    if (titleFilter === "all") return data;
    return data.filter((row) => row.title === titleFilter);
  }, [data, titleFilter]);

  // Reset to page 1 whenever the filter or the underlying data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [titleFilter, data.length]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="flex gap-4 items-center text-2xl font-semibold text-gray-800">
            <Link
              to="/workshops"
              className="p-2 rounded-full bg-black text-white"
            >
              {" "}
              <ArrowLeft size={16} />{" "}
            </Link>{" "}
            Registrations
          </h1>

          {/* Title filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="titleFilter"
              className="text-sm text-gray-600 whitespace-nowrap"
            >
              Filter by Workshop
            </label>
            <select
              id="titleFilter"
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="all">All </option>
              {titleOptions.map((title) => (
                <option key={title} value={title}>
                  {title}
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
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Workshop</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
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
                    <td className="px-4 py-3 text-gray-500">
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.phone}</td>
                    <td className="px-4 py-3 text-red-600">{row.title}</td>

                    <td className="px-4 py-3 text-gray-600">
                      {row.amount == 0 ? (
                        <span>Free</span>
                      ) : (
                        <span>₹{row.amount}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-gray-600">{row.location}</td>
                    <td className="px-4 py-3 text-gray-600">
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
                          onClick={() => deleteUser(row._id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                         <Trash size={16}/>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Registration Details
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1">
              {/* <DetailRow label="S.No" value={selected.sNo} /> */}
              <DetailRow label="Workshop Title" value={selected.title} />
              <DetailRow label="Name" value={selected.name} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow
                label="Amount"
                value={selected.amount == 0 ? "Free" : `₹${selected.amount}`}
              />
              <DetailRow label="Location" value={selected.location} />
              <DetailRow label="User Type" value={selected.userType} />
              <DetailRow label="Film Interest" value={selected.filmInterest} />
              <DetailRow
                label="Payment Status"
                value={
                  <span className={statusBadge(selected.paymentStatus)}>
                    {selected.paymentStatus}
                  </span>
                }
              />
              {/* <DetailRow
                label="Razorpay Order ID"
                value={selected.razorpayOrderId}
              /> */}
              <DetailRow
                label="Razorpay Payment ID"
                value={selected.razorpayPaymentId}
              />
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

      <ToastContainer theme="light" />
    </div>
  );
};

export default WorkshopRegistration;
