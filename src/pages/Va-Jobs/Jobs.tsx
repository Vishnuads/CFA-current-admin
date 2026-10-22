import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import DOMPurify from "dompurify";
import { Eye, Trash2, Plus, X, List, Pencil } from "lucide-react";
import BASE_URL from "../../api";

// ---- Change these if your backend routes are named differently ----
const API = {
  list: `${BASE_URL}/api/va-jobs/get`,
  remove: (id: string) => `${BASE_URL}/api/va-jobs/delete/${id}`,
};

interface Job {
  _id: string;
  title: string;
  qualification: string;
  experience: string;
  jd: string;
  location: string;
  status: "Published" | "Draft" | "Closed";
  createdAt?: string;
}

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "–";

const statusClasses: Record<Job["status"], string> = {
  Published: "bg-gray-900 text-white",
  Draft: "bg-gray-100 text-gray-900",
  Closed: "bg-gray-50 text-gray-400 border border-gray-200",
};


export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Job | null>(null);

  const getJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API.list);
      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Could not load jobs. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getJobs();
  }, []);

  const deleteJob = async (id: string) => {
    if (!window.confirm("Delete this job? This can't be undone.")) return;

    setDeletingId(id);
    try {
      await axios.delete(API.remove(id));
      setJobs((prev) => prev.filter((j) => j._id !== id));
      if (viewing?._id === id) setViewing(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Vishnuads Company Jobs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Job openings shown on the careers page.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/va-careers/add-jobs")}
            className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <Plus size={16} />
            Add Job
          </button>
          <button
            onClick={() => navigate("/va-careers/applications")}
            className="flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800"
          >
            <List size={16} />
            Job Applications
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            Loading jobs...
          </p>
        ) : jobs.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            No jobs yet. Add one to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Title", "Location", "Experience", "Status", "Actions"].map(
                    (h, i) => (
                      <th
                        key={i}
                        className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((j) => (
                  <tr key={j._id}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {j.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(j.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {j.location}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {j.experience}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[j.status]}`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start gap-1">
                         <button
                          onClick={() => navigate(`/va-careers/edit-jobs/${j._id}`)}
                          aria-label={`View ${j.title}`}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setViewing(j)}
                          aria-label={`View ${j.title}`}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => deleteJob(j._id)}
                          disabled={deletingId === j._id}
                          aria-label={`Delete ${j.title}`}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== View popup ===== */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="relative mt- w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-6">
            <button
              type="button"
              onClick={() => setViewing(null)}
              aria-label="Close"
              className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-900"
            >
              <X size={18} />
            </button>

            <div className="mb-6 pr-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {viewing.title}
              </h2>
              <span
                className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[viewing.status]}`}
              >
                {viewing.status}
              </span>
            </div>

            <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {[
                { label: "Location", value: viewing.location },
                { label: "Experience", value: viewing.experience },
                { label: "Qualification", value: viewing.qualification },
                { label: "Posted", value: formatDate(viewing.createdAt) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <dt className="text-sm text-gray-500">{row.label}</dt>
                  <dd className="text-right text-sm font-medium text-gray-900">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-gray-900">
                Job description
              </p>
              {/* Tailwind resets list/heading styles, so restore them here */}
              <div
                className="rounded-lg border overflow-y-scroll border-gray-200 p-4 text-sm leading-relaxed text-gray-900
                  [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold
                  [&_h3]:mb-1.5 [&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold
                  [&_p]:mb-2
                  [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5
                  [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5
                  [&_a]:underline"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(viewing.jd),
                }}
              />
            </div>

            {/* <button
              type="button"
              onClick={() => setViewing(null)}
              className="mt-5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
            >
              Close
            </button> */}
          </div>
        </div>
      )}
    </section>
  );
}
