import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { EyeIcon, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api";
import Badge from "../../components/ui/badge/Badge";

interface Books {
  _id: string;
  name: string;
  email: string;
  phone: string;
  alternate: string;
  price: number;
  address: string;
  book: string;
  paymentStatus: string;
  rzp_payment_id: string;
  createdAt: string;
}

export default function BooksTable() {
  const [data, setData] = useState<Books[]>([]);

  // Controls popup visibility
  const [isOpen, setIsOpen] = useState(false);

  // Stores the customer/order whose details are being viewed
  const [selectedOrder, setSelectedOrder] = useState<Books | null>(null);

  const getBookOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/bookOrders/get`);

      setData(res.data.data);
    } catch (err) {
      console.log("Error :", err);
      alert("Failed to fetch Book Orders");
    }
  };

  useEffect(() => {
    getBookOrders();
  }, []);

  // Open popup with selected customer's details
  const handleView = (order: Books) => {
    setSelectedOrder(order);
    setIsOpen(true);
  };

  // Close popup
  const handleClose = () => {
    setIsOpen(false);
    setSelectedOrder(null);
  };

  const deleteOrder = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}/api/bookOrders/delete/${id}`);

      alert("Order deleted successfully");

      setData((prev) => prev.filter((order) => order._id !== id));

      // If the deleted order is currently open in popup
      if (selectedOrder?._id === id) {
        handleClose();
      }
    } catch (err) {
      console.log("Error:", err);
      alert("Failed to delete Book Order");
    }
  };

  return (
    <>
      {/* ================= TABLE ================= */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b bg-gray-100 border-gray-100">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 uppercase text-gray-700 text-start text-theme-xs dark:text-gray-400"
                >
                  No
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 uppercase text-gray-700 text-start text-theme-xs dark:text-gray-400"
                >
                  Customer Name
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 uppercase text-gray-700 text-start text-theme-xs dark:text-gray-400"
                >
                  Phone
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 uppercase text-gray-700 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 uppercase text-gray-700 text-start text-theme-xs dark:text-gray-400"
                >
                  Price
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 uppercase text-gray-700 text-start text-theme-xs dark:text-gray-400"
                >
                  Payment Status
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 uppercase text-gray-700 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.length > 0 ? (
                data.map((order, idx) => (
                  <TableRow key={order._id}>
                    {/* Number */}
                    <TableCell className="px-5 py-4 text-start">
                      {idx + 1}
                    </TableCell>

                    {/* Customer Name */}
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="font-medium text-gray-800 dark:text-white/90">
                        {order.name}
                      </div>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.phone}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>

                    {/* Price */}
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      ₹{order.price}
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={
                          order.paymentStatus === "success"
                            ? "success"
                            : order.paymentStatus === "failed"
                            ? "error"
                            : "warning"
                        }
                      >
                        {order.paymentStatus === "success"
                          ? "Success"
                          : order.paymentStatus === "failed"
                          ? "Failed"
                          : "Pending"}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => handleView(order)}
                          className="text-blue-600 transition hover:text-blue-800"
                          title="View Details"
                        >
                          <EyeIcon size={18} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => deleteOrder(order._id)}
                          className="text-red-600 transition hover:text-red-800"
                          title="Delete Order"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-gray-400"
                  >
                    No book orders found.
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ================= DETAILS POPUP ================= */}

      {isOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4"
          onClick={handleClose}
        >
          {/* Popup */}
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Content */}
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between  bg-white ">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Order Details
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                   {new Date(
                    selectedOrder.createdAt
                  ).toLocaleString("en-IN")}
                
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
              {/* Customer Information */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Customer Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailItem
                    label="Customer Name"
                    value={selectedOrder.name}
                  />

                  <DetailItem
                    label="Email"
                    value={selectedOrder.email}
                  />

                  <DetailItem
                    label="Phone"
                    value={selectedOrder.phone}
                  />

                  <DetailItem
                    label="Alternative Phone"
                    value={selectedOrder.alternate || "Not provided"}
                  />

                  <div className="sm:col-span-2">
                    <DetailItem
                      label="Address"
                      value={selectedOrder.address}
                    />
                  </div>
                </div>
              </div>

              {/* Book Information */}
              <div>
                {/* <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Book Information
                </h3> */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="">
                    <DetailItem
                      label="Book"
                      value={selectedOrder.book}
                    />
                  </div>

                  <DetailItem
                    label="Price"
                    value={`₹${selectedOrder.price}`}
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Payment Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Payment Status
                    </p>

                    <Badge
                      size="sm"
                      color={
                        selectedOrder.paymentStatus === "success"
                          ? "success"
                          : selectedOrder.paymentStatus === "failed"
                          ? "error"
                          : "warning"
                      }
                    >
                      {selectedOrder.paymentStatus === "success"
                        ? "Success"
                        : selectedOrder.paymentStatus === "failed"
                        ? "Failed"
                        : "Pending"}
                    </Badge>
                  </div>

                  <DetailItem
                    label="Payment ID"
                    value={selectedOrder.rzp_payment_id || "Not available"}
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}


interface DetailItemProps {
  label: string;
  value: string | number;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p className="break-words text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
        {value}
      </p>
    </div>
  );
}

