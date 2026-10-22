import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api";
import {
  Eye,
  Trash2,
  X,
  Download,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router";

const API = {
  list: `${BASE_URL}/api/va-applications/get`,
  remove: (id: string) => `${BASE_URL}/api/va-applications/delete/${id}`,
  updateStatus: (id: string) => `${BASE_URL}/api/va-applications/status/${id}`,
};

const STATUS_OPTIONS = ["Pending", "Shortlisted", "Rejected"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

interface Application {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  resume: string;
  location: string;
  resumeOriginalName: string;
  resumeMimeType: string;
  status: Status;
  createdAt: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// DB stores "uploads/resumes/x.pdf" (no leading slash) — normalise it.
const resumeUrl = (path: string) => `${BASE_URL}/${path.replace(/^\/+/, "")}`;

const selectClasses: Record<Status, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Shortlisted: "bg-green-100 text-green-800 border-green-300",
  Rejected: "bg-red-100 text-red-800 border-red-300",
};

const baseSelectClasses =
  "rounded-lg border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50";

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Application | null>(null);
  const [downloading, setDownloading] = useState(false);

  const navigate = useNavigate();

  const getApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API.list);
      setApplications(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Could not load applications. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getApplications();
  }, []);

  const deleteApplication = async (id: string) => {
    if (!window.confirm("Delete this application? This can't be undone."))
      return;

    setDeletingId(id);
    try {
      await axios.delete(API.remove(id));
      setApplications((prev) => prev.filter((a) => a._id !== id));
      if (viewing?._id === id) setViewing(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete application.");
    } finally {
      setDeletingId(null);
    }
  };

  const updateStatus = async (id: string, status: Status) => {
    const previous = applications.find((a) => a._id === id)?.status;

    // Optimistic update, rolled back if the request fails
    setApplications((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status } : a)),
    );
    setViewing((v) => (v && v._id === id ? { ...v, status } : v));
    setUpdatingId(id);

    try {
      await axios.put(API.updateStatus(id), { status });
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
      if (previous) {
        setApplications((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: previous } : a)),
        );
        setViewing((v) => (v && v._id === id ? { ...v, status: previous } : v));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // `download` attribute is ignored for cross-origin URLs, so fetch as a blob.
  const downloadResume = async (app: Application) => {
    setDownloading(true);
    // console.log(blobUrl);
      console.log(app.resume);
    try {
      const res = await axios.get(resumeUrl(app.resume), 
      // { responseType: "blob"}
    );
      const blobUrl = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = app.resumeOriginalName || "resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to download resume.");
    } finally {
      setDownloading(false);
    }

  };

  return (
    <section className="mx-auto w-full max-w-5xl p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Vishnuads Job Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Candidates who applied through the careers form.
          </p>
        </div>

        <button
          onClick={() => navigate("/va-careers")}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <ArrowLeft size={16} />
          Back to Jobs
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            Loading applications...
          </p>
        ) : applications.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            No applications yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-center">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Name", "Role", "Submitted", "Status", "Action"].map(
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
                {applications.map((a) => (
                  <tr key={a._id}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {a.name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {a.role}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(a.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={a.status}
                        disabled={updatingId === a._id}
                        onChange={(e) =>
                          updateStatus(a._id, e.target.value as Status)
                        }
                        className={`${baseSelectClasses} ${selectClasses[a.status]}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewing(a)}
                          aria-label={`View ${a.name}`}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => deleteApplication(a._id)}
                          disabled={deletingId === a._id}
                          aria-label={`Delete ${a.name}`}
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
          <div className="relative my-8 w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
            <button
              type="button"
              onClick={() => setViewing(null)}
              aria-label="Close"
              className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-900"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {viewing.name}
              </h2>
              <p className="text-sm text-gray-500">
                Applied for {viewing.role}
              </p>
            </div>

            <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {[
                { label: "Email", value: viewing.email },
                { label: "Phone", value: viewing.phone },
                { label: "Role", value: viewing.role },
                { label: "Current Location", value: viewing.location},
                { label: "Submitted",
                  value: formatDateTime(viewing.createdAt),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <dt className="text-sm text-gray-500">{row.label}</dt>
                  <dd className="break-all text-right text-sm font-medium text-gray-900">
                    {row.value}
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm text-gray-500">Status</dt>
                <dd>
                  <select
                    value={viewing.status}
                    disabled={updatingId === viewing._id}
                    onChange={(e) =>
                      updateStatus(viewing._id, e.target.value as Status)
                    }
                      className={`${baseSelectClasses} ${selectClasses[viewing.status]}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
            </dl>

            {/* Resume */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-gray-900">
                  Resume{" "}
                  <span className="font-normal text-gray-400">
                    ({viewing.resumeOriginalName})
                  </span>
                </p>
                <div className="flex tems-center gap-5">
                  <a
                    href={resumeUrl(viewing.resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
                  >
                    <ExternalLink size={14} />
                    View
                  </a>

                  {/* <button
                    onClick={() => downloadResume(viewing)}
                    disabled={downloading}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    <Download size={14} />
                    {downloading ? "Downloading..." : "Download"}
                  </button> */}
                </div>
              </div>
            </div>

            {/* <button
              type="button"
              onClick={() => setViewing(null)}
              className="mt-8 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
            >
              Close
            </button> */}
          </div>
        </div>
      )}
    </section>
  );
}
