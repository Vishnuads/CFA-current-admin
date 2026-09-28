import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api";
import { Trash2, Plus, Pencil, Eye } from "lucide-react";
// import { type PlacementRecord } from "./PlacementsForm2";
import PlacementView from "./PlacementView";
import { useNavigate } from "react-router";

interface Department {
  _id: string;
  name: string;
  slug: string;
}

export interface PlacementRecord {
  _id: string;
  name: string;
  role: string;
  company: string;
  note?: string;
  type?: string;
  department: { _id: string; name: string; slug: string } | string;
  order: number;
  isActive: boolean;
  studentImage: string | null;
  companyLogo: string | null;
  workImages: string[];
}

export default function Placements() {
  const [placements, setPlacements] = useState<PlacementRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // const [editingPlacement, setEditingPlacement] =
  //   useState<PlacementRecord | null>(null);
  const [viewingPlacement, setViewingPlacement] =
    useState<PlacementRecord | null>(null);

  const navigate = useNavigate();
  const getDepartments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/departments/get`);
      setDepartments(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getPlacements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/placements/get`);
      setPlacements(res.data.data);
    //   console.log(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePlacement = async (id: string) => {
    const confirmed = window.confirm("Delete this placement record?");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await axios.delete(`${BASE_URL}/api/placements/delete/${id}`);
      setPlacements((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.log("Error:", err);
      alert("Failed to delete placement.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    getDepartments();
    getPlacements();
  }, []);

  const filteredPlacements = departmentFilter
    ? placements.filter((p) => {
        const deptId =
          typeof p.department === "string" ? p.department : p.department._id;
        return deptId === departmentFilter;
      })
    : placements;

  const departmentName = (p: PlacementRecord) =>
    typeof p.department === "string" ? p.department : p.department.name;

  return (
    <section className="mx-auto w-full max-w-5xl p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            All Placements
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Students placed across departments and companies.
          </p>
        </div>

        <div className="flex  items-center gap-4">

       <div className="">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          <option value="">All departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

        <button
          onClick={() => {
            // setEditingPlacement(null);
            navigate("/add-placements");
          }}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <Plus size={16} />
          Add Placement
        </button>

        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            Loading placements...
          </p>
        ) : filteredPlacements.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            No placements found.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredPlacements.map((p) => (
              <li
                key={p._id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  {p.studentImage ? (
                    <img
                      src={`${BASE_URL}${p.studentImage}`}
                      alt={p.name}
                      className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-[10px] text-gray-400">
                      No photo
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.role} · {p.company}
                    </p>
                    <p className="text-xs text-gray-400">{departmentName(p)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.isActive
                        ? "bg-gray-100 text-gray-900"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>

                  <button
                    onClick={() => setViewingPlacement(p)}
                    aria-label={`View ${p.name}`}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    onClick={() => {
                      // setEditingPlacement(p);
                      navigate(`/edit-placements/${p._id}`)
                    }}
                    aria-label={`Edit ${p.name}`}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => deletePlacement(p._id)}
                    disabled={deletingId === p._id}
                    aria-label={`Delete ${p.name}`}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewingPlacement && (
        <PlacementView
          placement={viewingPlacement}
          close={() => setViewingPlacement(null)}
        />
      )}
    </section>
  );
}
