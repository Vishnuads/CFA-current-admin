import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import Badge from "../../components/ui/badge/Badge";
import { Edit, Trash } from "lucide-react";
import axios from "axios";
import BASE_URL from "../../api";
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import Button from "../../components/ui/button/Button";
import { PlusIcon } from "../../icons";

type Workshop = {
  _id: string;
  poster: string;
  title: string;
  fee: string;
  datelabel: string;
  headline?: string;
  desc?: string;
  date?: string;
  isActive?: boolean;
  points?: string[];
};

const PAGE_SIZE = 20;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function WorkshopTable() {
  const [data, setData] = useState<Workshop[]>([]);
  const [error, setError] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const navigate = useNavigate();

  const getWorkshops = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/workshops/get`);
      setData(res.data.data);
    } catch (error) {
      console.log("Error :", error);
      setError("Failed to fetch Workshops");
    }
  };

  const deleteWorkshop = async (id: string) => {
    if (!id) {
      console.error("Delete failed: No ID provided");
      return;
    }

    // Log this to check if the generated URL has a valid ID at the end
    console.log("Deleting URL:", `${BASE_URL}/api/workshops/delete/${id}`);

    try {
      await axios.delete(`${BASE_URL}/api/workshops/delete/${id}`);
      alert("Deleted");
      setData((pre) => pre.filter((del) => del._id !== id));
    } catch (err: any) {
      // console.log("error", err);
      // setError("Failed to delete user");
      console.error("Server validation error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  useEffect(() => {
    getWorkshops();
  }, []);

  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        data
          .map((row) => {
            if (!row.date) return null;
            const d = new Date(row.date);
            return isNaN(d.getTime()) ? null : d.getFullYear();
          })
          .filter((y): y is number => y !== null),
      ),
    ).sort((a, b) => b - a);
    return years;
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (!row.date) return monthFilter === "all" && yearFilter === "all";
      const d = new Date(row.date);
      if (isNaN(d.getTime()))
        return monthFilter === "all" && yearFilter === "all";
      const matchesMonth =
        monthFilter === "all" || d.getMonth() === Number(monthFilter);
      const matchesYear =
        yearFilter === "all" || d.getFullYear() === Number(yearFilter);
      return matchesMonth && matchesYear;
    });
  }, [data, monthFilter, yearFilter]);

  // Reset to page 1 whenever filters or data change
  useEffect(() => {
    setCurrentPage(1);
  }, [monthFilter, yearFilter, data.length]);

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
    <>
      <div>
        <div className="flex items-center justify-between mb-4 px-3">
          <h1 className="font-semibold text-2xl">All Workshops</h1>
          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    Month
                  </label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-gray-300"
                  >
                    <option value="all">All </option>
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    Year
                  </label>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-gray-300"
                  >
                    <option value="all">All </option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <Link to="/workshop-registrations">
              <button className=" bg-green-600 text-white px-3.5 py-2.5 rounded-md">
                Registrations
              </button>
            </Link>

            <Link to="/create-workshop">
              <Button
                size="sm"
                variant="primary"
                startIcon={<PlusIcon className="size-3" fill="white" />}
              >
                Create
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border-b border-red-100 px-5 py-3">
            {error}
          </div>
        )}

        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 bg-gray-50/60 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  No
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Image
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Fee
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-10 text-center text-gray-400 dark:text-gray-500">
                    No workshops found.
                  </TableCell>
                </TableRow>
              )}
              {paginatedData.map((order, idx) => (
                <TableRow
                  key={order._id ?? idx}
                  className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                    <div>{(currentPage - 1) * PAGE_SIZE + idx + 1}</div>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
                        <img
                          src={`${BASE_URL}/${order.poster}`}
                          alt={order.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-gray-700 text-start text-theme-sm dark:text-gray-300">
                    {order.title}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.datelabel}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    ₹ {order.fee}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={order.isActive ? "success" : "error"}
                    >
                      {order.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center h-22 gap-3">
                    <button
                      className="text-yellow-500 hover:text-yellow-600 transition-colors"
                      onClick={() => {
                        navigate(`/edit-workshop/${order._id}`);
                      }}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteWorkshop(order?._id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}
              {"–"}
              {Math.min(currentPage * PAGE_SIZE, filteredData.length)} of{" "}
              {filteredData.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.03]"
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
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
