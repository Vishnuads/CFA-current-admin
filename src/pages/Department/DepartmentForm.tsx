import { useState } from "react";
import BASE_URL from "../../api";
import axios from "axios";

interface DepartmentFormData {
  name: string;
  slug: string;
  order: number;
}

interface DepartmentFormProps {
  close: () => void;
  onSuccess?: () => void;
}

const initialState: DepartmentFormData = {
  name: "",
  slug: "",
  order: 0,
};

export default function DepartmentForm({
  close,
  onSuccess,
}: DepartmentFormProps) {
  const [formData, setFormData] = useState<DepartmentFormData>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetMessages = () => {
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();

    if (!formData.name.trim()) {
      setError("Department name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/departments/create`,
        formData,
      );
      console.log(res.data);

      setSuccess(true);
      setFormData(initialState);

      onSuccess?.();
        setTimeout(() => close(), 700);
      alert("Course added successfully !");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Add Department
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create a department students can be placed under.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-gray-900"
            >
              Department name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Direction"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="mb-1.5 block text-sm font-medium text-gray-900"
            >
              Slug{" "}
              {/* <span className="font-normal text-gray-400">
              (optional)
            </span> */}
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g. direction"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <div>
            <label
              htmlFor="order"
              className="mb-1.5 block text-sm font-medium text-gray-900"
            >
              Display order
            </label>
            <input
              id="order"
              name="order"
              type="number"
              value={formData.order}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-gray-100 px-3.5 py-2.5 text-sm text-gray-900">
              Department created successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitting ? "Saving..." : "Save department"}
          </button>
        </form>
      </div>
    </div>
  );
}
