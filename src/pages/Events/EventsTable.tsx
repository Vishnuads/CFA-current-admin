import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Edit, Trash } from "lucide-react";
import { Link } from "react-router";
import Button from "../../components/ui/button/Button";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api";
import { PlusIcon } from "../../icons";
import { useNavigate } from "react-router";

interface Events {
  _id: string;
  title: string;
  tagline: string;
  highlights: string[];
  date: string;
  displayDate: string;
  images: string[];
  location: string;
}

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

export default function EventsTable() {
  const [data, setData] = useState<Events[]>([]);
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();

  const getEvents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/events/get`);
      setData(res.data.data);
    } catch (err) {
      console.log("Error :", err);
      alert("Failed to fetch Workshops");
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  const deleteEvent = async (id: string) => {
    try {
      await axios.delete(`${BASE_URL}/api/events/delete/${id}`);
      alert("Deleted");
      setData((pre) => pre.filter((del) => del._id !== id));
    } catch (err) {
      console.log("error", err);
      alert("Failed to delete user");
    }
  };

  // Unique years present in the data, for the year filter dropdown
  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        data
          .map((row) => {
            const d = new Date(row.date);
            return isNaN(d.getTime()) ? null : d.getFullYear();
          })
          .filter((y): y is number => y !== null),
      ),
    ).sort((a, b) => b - a);
    return years;
  }, [data]);

  // Apply month + year filters
  const filteredData = useMemo(() => {
    return data.filter((row) => {
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
      <header>
        <div className="flex items-center justify-between mb-1 px-3">
          <h1 className="font-semibold text-2xl">All Events</h1>
          <div className="flex items-center gap-4" >
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Month
                </label>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-gray-300"
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
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-gray-300"
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
            <Link to="/create-event">
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
      </header>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Filters */}

        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
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
                {/* <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Location
                </TableCell> */}
                {/* <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell> */}
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
                  <TableCell className="px-5 py-8 text-center text-gray-400 dark:text-gray-500">
                    No events found.
                  </TableCell>
                </TableRow>
              )}
              {paginatedData.map((order, idx) => (
                <TableRow key={order._id ?? idx}>
                  <TableCell className="px-5 py-4 text-start">
                    <div>{(currentPage - 1) * PAGE_SIZE + idx + 1}</div>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-22 h-auto">
                        <img
                          src={`${BASE_URL}/${order.images[0]}`}
                          alt={order.title}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 w-sm text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.title}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.date}
                  </TableCell>
                  {/* <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.location}
                  </TableCell> */}
                  {/* <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color={order.isActive ? "success" : "error"}>
                    {order.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell> */}
                  <TableCell className="flex items-center h-22 gap-3 ">
                    {/* <button className="text-blue-600">
                    <EyeIcon size={18} />
                  </button> */}
                    <button
                      className="text-yellow-500"
                      onClick={() => {
                        navigate(`/edit-event/${order._id}`);
                      }}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteEvent(order?._id)}
                      className="text-red-600"
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
                        ? "bg-gray-800 text-white"
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
