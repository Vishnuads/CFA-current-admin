import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import BASE_URL from "../../api";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

interface Department {
  _id: string;
  name: string;
  slug: string;
}

interface PlacementFormFields {
  name: string;
  role: string;
  company: string;
  note: string;
  type: string;
  department: string;
  order: string;
  isActive: boolean;
}

const initialFields: PlacementFormFields = {
  name: "",
  role: "",
  company: "",
  note: "",
  type: "",
  department: "",
  order: "0",
  isActive: true,
};

const MAX_WORK_IMAGES = 5;

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

interface PlacementsFormProps {
  close: () => void;
  onSuccess?: () => void;
  editData?: PlacementRecord;
}

export default function PlacementsForm({
  close,
  onSuccess,
}: PlacementsFormProps) {
  const [fields, setFields] = useState<PlacementFormFields>(initialFields);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptLoading, setDeptLoading] = useState(true);

  const [studentImage, setStudentImage] = useState<File | null>(null);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [workImages, setWorkImages] = useState<File[]>([]);

  const [studentPreview, setStudentPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [workPreviews, setWorkPreviews] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/departments/get`);
        setDepartments(res.data.data);
      } catch {
        setError("Could not load departments. Is the backend running?");
      } finally {
        setDeptLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    return () => {
      if (studentPreview) URL.revokeObjectURL(studentPreview);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      workPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentPreview, logoPreview, workPreviews]);

  const handleFieldChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setStudentImage(file);
    setStudentPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleCompanyLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCompanyLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleWorkImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_WORK_IMAGES);
    setWorkImages(files);
    setWorkPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const resetMessages = () => {
    setError(null);
    setSuccess(false);
  };

  const resetForm = () => {
    setFields(initialFields);
    setStudentImage(null);
    setCompanyLogo(null);
    setWorkImages([]);
    setStudentPreview(null);
    setLogoPreview(null);
    setWorkPreviews([]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();

    if (
      !fields.name.trim() ||
      !fields.role.trim() ||
      !fields.company.trim() ||
      !fields.department
    ) {
      setError("Name, role, company and department are required.");
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("name", fields.name.trim());
      body.append("role", fields.role.trim());
      body.append("company", fields.company.trim());
      body.append("note", fields.note.trim());
      body.append("type", fields.type.trim());
      body.append("department", fields.department);
      body.append("order", fields.order || "0");
      body.append("isActive", String(fields.isActive));

      if (studentImage) body.append("studentImage", studentImage);
      if (companyLogo) body.append("companyLogo", companyLogo);
      workImages.forEach((file) => body.append("workImages", file));

      const res = await axios.post(`${BASE_URL}/api/placements/create`, body);
      //   const data = await res.json();
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to create placement.");
      }
      console.log(res.data);

      close();
      onSuccess?.();
      setSuccess(true);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/10";
  const labelClasses = "mb-1.5 block text-sm font-medium text-gray-900";

  return (
    <section className="mx-auto w-full max-w-3xl">
     <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Add Placements
          </h1>
          <p className="mt-1 text-sm text-gray-500">
           Fill the details of Students placed across departments.
          </p>
        </div>

        <button
          onClick={() => {
            // navigate("/add-placements");
          }}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <ArrowLeft size={16} />
          Back to Placements
        </button>
      </div>
     
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
       

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic details */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClasses}>
                Student name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={fields.name}
                onChange={handleFieldChange}
                placeholder="e.g. Dhinesh"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="role" className={labelClasses}>
                Role
              </label>
              <input
                id="role"
                name="role"
                type="text"
                value={fields.role}
                onChange={handleFieldChange}
                placeholder="e.g. Assistant Director"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="company" className={labelClasses}>
                Company
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={fields.company}
                onChange={handleFieldChange}
                placeholder="e.g. Director Mani Seyon"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="department" className={labelClasses}>
                Department
              </label>
              <select
                id="department"
                name="department"
                value={fields.department}
                onChange={handleFieldChange}
                disabled={deptLoading}
                className={inputClasses}
              >
                <option value="">
                  {deptLoading ? "Loading departments..." : "Select department"}
                </option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="note" className={labelClasses}>
                Note{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="note"
                name="note"
                type="text"
                value={fields.note}
                onChange={handleFieldChange}
                placeholder="e.g. Vallan, Kattapavakanom"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="type" className={labelClasses}>
                Type{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="type"
                name="type"
                type="text"
                value={fields.type}
                onChange={handleFieldChange}
                placeholder="e.g. 6+ Short films & 5+ Ad shoots"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="order" className={labelClasses}>
                Display order
              </label>
              <input
                id="order"
                name="order"
                type="number"
                value={fields.order}
                onChange={handleFieldChange}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="isActive" className={labelClasses}>
                Status
              </label>

              <select
                id="isActive"
                name="isActive"
                value={String(fields.isActive)}
                onChange={(e) => {
                  setFields((prev) => ({
                    ...prev,
                    isActive: e.target.value === "true",
                  }));
                }}
                className={inputClasses}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Images */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="studentImage" className={labelClasses}>
                Student photo
              </label>
              <input
                id="studentImage"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={handleStudentImage}
                className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-gray-200"
              />
              {studentPreview && (
                <img
                  src={studentPreview}
                  alt="Student preview"
                  className="mt-3 h-24 w-24 rounded-lg border border-gray-200 object-cover"
                />
              )}
            </div>

            <div>
              <label htmlFor="companyLogo" className={labelClasses}>
                Company logo{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="companyLogo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={handleCompanyLogo}
                className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-gray-200"
              />
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Company logo preview"
                  className="mt-3 h-24 w-24 rounded-lg border border-gray-200 object-contain bg-gray-50"
                />
              )}
            </div>
          </div>

          <div>
            <label htmlFor="workImages" className={labelClasses}>
              Work images{" "}
              <span className="font-normal text-gray-400">
                (optional, up to {MAX_WORK_IMAGES})
              </span>
            </label>
            <input
              id="workImages"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={handleWorkImages}
              className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-gray-200"
            />
            {workPreviews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {workPreviews.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Work sample ${i + 1}`}
                    className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900">
              Placement created successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitting ? "Saving..." : "Save placement"}
          </button>
        </form>
      </div>
    </section>
  );
}
