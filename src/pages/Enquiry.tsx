import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import BASE_URL from "../api";
import {  Trash2 } from "lucide-react";

interface Enquiry {
  _id?: string;
  name: string;
  phone: string;
  email: string;
  about: string;
  message: string;
  createdAt: string;
}

const PAGE_SIZE = 20;

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between gap-5 border-b border-gray-100 py-2 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-800 font-medium text-right break-after-avoid">
      {value}
    </span>
  </div>
);

const Enquiry = () => {
  const [data, setData] = useState<Enquiry[]>([]);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [aboutFilter, setAboutFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const getUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/contact/get`);
      const result = res.data;
      setData(result.data);
    } catch {
      alert("Failed to fetch Data");
    }
  };

  const deleteEnquiry = async (id: any) => {
    try {
      await axios.delete(`${BASE_URL}/api/contact/delete/${id}`);

      alert("Enquiry Deleted !");
      setData((p) => p.filter((del) => del._id == id));
      getUsers();
    } catch (err) {
      console.log("error", err);
      alert("Failed to delete user");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Unique "about" values for the filter dropdown
  const aboutOptions = useMemo(() => {
    const options = Array.from(new Set(data.map((row) => row.about)));
    return options;
  }, [data]);

  // Apply about filter
  const filteredData = useMemo(() => {
    if (aboutFilter === "all") return data;
    return data.filter((row) => row.about === aboutFilter);
  }, [data, aboutFilter]);

  // Reset to page 1 whenever the filter or the underlying data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [aboutFilter, data.length]);

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
    return d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="flex gap-4 items-center text-2xl font-semibold text-gray-800">
            
            Enquiries
          </h1>

          {/* About filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="aboutFilter"
              className="text-sm text-gray-600 whitespace-nowrap"
            >
              Filter by About
            </label>
            <select
              id="aboutFilter"
              value={aboutFilter}
              onChange={(e) => setAboutFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="all">All</option>
              {aboutOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">About</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
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
                      {row.name}
                    </td>
                    <td className="px-4 py-3">{row.phone}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.about}</td>
                    <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelected(row)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          View
                        </button>
                        <button onClick={() => deleteEnquiry(row._id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                          <Trash2 size={16}/>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Enquiry Details
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1">
              <DetailRow label="Name" value={selected.name} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="About" value={selected.about} />
              <DetailRow label="Message" value={selected.message} />
              <DetailRow label="Date" value={formatDate(selected.createdAt)} />
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

export default Enquiry;
