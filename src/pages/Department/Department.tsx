import { useEffect, useState } from "react";
import DepartmentForm from "./DepartmentForm";
import axios from "axios";
import BASE_URL from "../../api";
import { Trash2, Plus } from "lucide-react";

interface Courses {
  _id: string;
  name: string;
  slug: string;
  order: number;
}

export default function Department() {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Courses[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/departments/get`);
      setCourses(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this department? All placements under it will be removed too.",
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await axios.delete(`${BASE_URL}/api/departments/delete/${id}`);
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.log("Error:", err);
      alert("Failed to delete department.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  return (
    <section className="mx-auto w-full max-w-3xl p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            All Departments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Departments students can be placed under.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <Plus size={16} />
          Add Department
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            Loading departments...
          </p>
        ) : courses.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            No departments yet. Add one to get started.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {courses.map((c, idx) => (
              <li key={c._id} className="flex items-center gap-5 px-6 py-3">
                <div className="text-xs text-gray-500">{idx + 1}</div>
                <div className="flex items-center justify-between w-full ">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-400">{c.slug}</p>
                  </div>

                  <button
                    onClick={() => deleteCourse(c._id)}
                    disabled={deletingId === c._id}
                    aria-label={`Delete ${c.name}`}
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

      {open && (
        <DepartmentForm close={() => setOpen(false)} onSuccess={getCourses} />
      )}
    </section>
  );
}
