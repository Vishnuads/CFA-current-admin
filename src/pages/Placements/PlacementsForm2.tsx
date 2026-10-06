import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import BASE_URL from "../../api";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

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

interface PlacementFormFields {
  name: string;
  role: string;
  company: string;
  note: string;
  type: string;
  department: string;
  order: string;
  isActive: string;
}

const initialFields: PlacementFormFields = {
  name: "",
  role: "",
  company: "",
  note: "",
  type: "",
  department: "",
  order: "0",
  isActive: "true",
};

const MAX_WORK_IMAGES = 5;

const fieldsFromRecord = (record: PlacementRecord): PlacementFormFields => ({
  name: record.name || "",
  role: record.role || "",
  company: record.company || "",
  note: record.note || "",
  type: record.type || "",
  department:
    typeof record.department === "string"
      ? record.department
      : record.department?._id || "",
  order: String(record.order ?? 0),
  isActive: String(record.isActive),
});

export default function PlacementsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [fields, setFields] = useState<PlacementFormFields>(initialFields);

  const [editData, setEditData] = useState<PlacementRecord | null>(null);
  const [recordLoading, setRecordLoading] = useState(isEditMode);

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

  // Load departments for the dropdown
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

  // In edit mode, fetch the existing placement and pre-fill the form
  useEffect(() => {
    if (!isEditMode) return;

    const fetchPlacement = async () => {
      setRecordLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/placements/get/${id}`);
        // const record: PlacementRecord = res.data.data;
        setEditData(res.data.data);
        setFields(fieldsFromRecord(res.data.data));
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message);
        } else {
          setError("Could not load this placement.");
        }
      } finally {
        setRecordLoading(false);
      }
    };
    fetchPlacement();
  }, [id, isEditMode]);

  // Clean up object URLs on unmount / change to avoid memory leaks
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
      body.append("isActive", fields.isActive);

      if (studentImage) body.append("studentImage", studentImage);
      if (companyLogo) body.append("companyLogo", companyLogo);
      workImages.forEach((file) => body.append("workImages", file));

      const res = isEditMode
        ? await axios.put(`${BASE_URL}/api/placements/update/${id}`, body)
        : await axios.post(`${BASE_URL}/api/placements/create`, body);

      if (!res.data.success) {
        throw new Error(
          res.data.message ||
            `Failed to ${isEditMode ? "update" : "create"} placement.`,
        );
      }

      setSuccess(true);

      // if (!isEditMode) {
        // Give the success message a beat to show, then go back to the list
        setTimeout(() => navigate("/placements"), 700);
      // } else {
      //   resetForm();
      // }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
        console.error("Placement submit error:", err.response?.data || err);
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

  if (recordLoading) {
    return (
      <section className="mx-auto w-full max-w-2xl p-4 sm:p-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          Loading placement...
        </div>
      </section>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          navigate("/placements");
        }}
        className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        <ArrowLeft size={16} />
        Back to Placements
      </button>
      <section className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditMode ? "Edit Placement" : "Add Placement"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode
                ? "Update this student's placement record."
                : "Add a student's placement record with photos and work samples."}
            </p>
          </div>

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
                    {deptLoading
                      ? "Loading departments..."
                      : "Select department"}
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
                  value={fields.isActive}
                  onChange={handleFieldChange}
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
                  Student photo{" "}
                  {isEditMode && (
                    <span className="font-normal text-gray-400">
                      (leave empty to keep current)
                    </span>
                  )}
                </label>
                <input
                  id="studentImage"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={handleStudentImage}
                  className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-gray-200"
                />
                {(studentPreview || (isEditMode && editData?.studentImage)) && (
                  <img
                    src={
                      studentPreview || `${BASE_URL}${editData?.studentImage}`
                    }
                    alt="Student preview"
                    className="mt-3 h-24 w-24 rounded-lg border border-gray-200 object-cover"
                  />
                )}
              </div>

              <div>
                <label htmlFor="companyLogo" className={labelClasses}>
                  Company logo{" "}
                  <span className="font-normal text-gray-400">
                    {isEditMode
                      ? "(leave empty to keep current)"
                      : "(optional)"}
                  </span>
                </label>
                <input
                  id="companyLogo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={handleCompanyLogo}
                  className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-gray-200"
                />
                {(logoPreview || (isEditMode && editData?.companyLogo)) && (
                  <img
                    src={logoPreview || `${BASE_URL}${editData?.companyLogo}`}
                    alt="Company logo preview"
                    className="mt-3 h-24 w-24 rounded-lg border border-gray-200 bg-gray-50 object-contain"
                  />
                )}
              </div>
            </div>

            <div>
              <label htmlFor="workImages" className={labelClasses}>
                Work images{" "}
                <span className="font-normal text-gray-400">
                  {isEditMode
                    ? `(uploading new ones removes existing, up to ${MAX_WORK_IMAGES} total)`
                    : `(optional, up to ${MAX_WORK_IMAGES})`}
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

              {/* Existing work images (edit mode, before any new selection) */}
              {isEditMode &&
                workPreviews.length === 0 &&
                editData &&
                editData.workImages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {editData.workImages.map((src) => (
                      <img
                        key={src}
                        src={`${BASE_URL}${src}`}
                        alt="Existing work sample"
                        className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                      />
                    ))}
                  </div>
                )}

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
                Placement {isEditMode ? "updated" : "created"} successfully.
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/placements")}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {submitting
                  ? "Saving..."
                  : isEditMode
                    ? "Update placement"
                    : "Save placement"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
