import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import BASE_URL from "../../api";

const STATUS_OPTIONS = ["Published", "Draft", "Closed"] as const;
type JobStatus = (typeof STATUS_OPTIONS)[number];

interface JobFormFields {
  title: string;
  qualification: string;
  experience: string;
  location: string;
  status: JobStatus;
}

const initialFields: JobFormFields = {
  title: "",
  qualification: "",
  experience: "",
  location: "",
  status: "Published",
};

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

// Quill returns "<p><br></p>" when empty, so strip tags before checking.
const isJdEmpty = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, "")
    .trim().length === 0;

export default function JobForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [fields, setFields] = useState<JobFormFields>(initialFields);
  const [jd, setJd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/jobs/get/${id}`);

        const job = res.data.data;
        console.log(job);

        setFields({
          title: job.title ?? "",
          qualification: job.qualification ?? "",
          experience: job.experience ?? "",
          location: job.location ?? "",
          status: job.status ?? "Draft",
        });

        setJd(job.jd ?? "");
      } catch (err) {
        console.error("Failed to fetch job:", err);
        setError("Unable to load Job details.");
      }
    };

    fetchJobs();
  }, [id, isEdit]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (
      !fields.title.trim() ||
      !fields.qualification.trim() ||
      !fields.experience.trim() ||
      !fields.location.trim()
    ) {
      setError("Title, qualification, experience and location are required.");
      return;
    }

    if (isJdEmpty(jd)) {
      setError("Please add a job description.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: fields.title.trim(),
        qualification: fields.qualification.trim(),
        experience: fields.experience.trim(),
        location: fields.location.trim(),
        status: fields.status,
        jd,
      };

      const res = isEdit
        ? await axios.put(`${BASE_URL}/api/jobs/update/${id}`, payload)
        : await axios.post(`${BASE_URL}/api/jobs/create`, payload);

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to create job.");
      }

      setSuccess(true);
      if (isEdit) {
        setTimeout(() => navigate("/careers"), 700);
      } else {
        setFields(initialFields);
        setJd("");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/10";
  const labelClasses = "mb-1.5 block text-sm font-medium text-gray-900";

  return (
    <section className="mx-auto w-full max-w-2xl p-4 sm:p-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Job" : "Add Job"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? "Update this job opening."
              : "Create a job opening to show on the careers page."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className={labelClasses}>
                Job title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={fields.title}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="qualification" className={labelClasses}>
                Qualification
              </label>
              <input
                id="qualification"
                name="qualification"
                type="text"
                value={fields.qualification}
                onChange={handleChange}
                placeholder="e.g. B.E / B.Tech or relevant degree"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="experience" className={labelClasses}>
                Experience
              </label>
              <input
                id="experience"
                name="experience"
                type="text"
                value={fields.experience}
                onChange={handleChange}
                placeholder="e.g. 1–3 years"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="location" className={labelClasses}>
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={fields.location}
                onChange={handleChange}
                placeholder="e.g. Chennai, Tamil Nadu"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="status" className={labelClasses}>
                Status
              </label>
              <select
                id="status"
                name="status"
                value={fields.status}
                onChange={handleChange}
                className={inputClasses}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClasses}>Job description</label>
            <div
              className="overflow-hidden rounded-lg border border-gray-300 bg-white
                [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50
                [&_.ql-container]:border-0 [&_.ql-container]:text-sm
                [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-gray-900
                [&_.ql-editor.ql-blank::before]:text-gray-400 [&_.ql-editor.ql-blank::before]:not-italic"
            >
              <ReactQuill
                theme="snow"
                value={jd}
                onChange={setJd}
                modules={QUILL_MODULES}
                placeholder="Write the job description, responsibilities, requirements..."
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900">
              Job {isEdit ? "updated" : "created"} successfully.
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/careers")}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
            >
              Back to jobs
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitting ? "Saving..." : isEdit ? "Update job" : "Save job"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
