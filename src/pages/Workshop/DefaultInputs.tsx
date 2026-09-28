import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import axios from "axios";
import BASE_URL from "../../api";
import { useParams, useNavigate, Link } from "react-router";

interface WorkshopFormData {
  headline: string;
  title: string;
  desc: string;
  fee: string;
  date: string;
  datelabel: string;
  location: string;
  status: string; // "active" | "inactive" – matches your <option> values
}

const EMPTY_FORM: WorkshopFormData = {
  headline: "",
  title: "",
  desc: "",
  fee: "",
  date: "",
  datelabel: "",
  location: "",
  status: "",
};

export default function DefaultInputs() {
  const InputStyle =
    "border w-full px-3 py-2.5 focus:border-blue-200 rounded-lg text-sm border-gray-300";

  const { id } = useParams(); // present only on /edit-workshop/:id
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<WorkshopFormData>(EMPTY_FORM);
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [poster, setPoster] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NEW: loading state for fetching existing workshop in edit mode
  const [loading, setLoading] = useState<boolean>(isEditMode);

  // Fetch existing workshop details when in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchWorkshop = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${BASE_URL}/api/workshops/get/${id}`);
        const data = res.data.getID;

        setFormData({
          headline: data.headline ?? "",
          title: data.title ?? "",
          desc: data.desc ?? "",
          fee: data.fee ?? "",
          date: data.date ? data.date.slice(0, 10) : "", // trims to YYYY-MM-DD for <input type="date">
          datelabel: data.datelabel ?? "",
          location: data.location ?? "",
          status: data.isActive ? "active" : "inactive",
        });

        // points/highlights come back as an array from the server
        if (Array.isArray(data.points) && data.points.length > 0) {
          setHighlights(data.points);
        }
      } catch (err) {
        console.error("Failed to fetch workshop:", err);
        setError("Could not load workshop details.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();
  }, [id, isEditMode]);

  const addHighlight = () => setHighlights((prev) => [...prev, ""]);

  const removeHighlight = (index: number) =>
    setHighlights((prev) => prev.filter((_, i) => i !== index));

  const updateHighlight = (index: number, value: string) =>
    setHighlights((prev) => prev.map((h, i) => (i === index ? value : h)));

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPoster(e.target.files[0]);
    }
  };

  // Shared helper: builds the multipart FormData payload used by both create & update
  const buildPayload = () => {
    const cleanedHighlights = highlights.map((h) => h.trim()).filter(Boolean);

    const payload = new FormData();

    payload.append("headline", formData.headline);
    payload.append("title", formData.title);
    payload.append("desc", formData.desc);
    payload.append("fee", formData.fee);
    payload.append("date", formData.date);
    payload.append("datelabel", formData.datelabel);
    payload.append("location", formData.location);
    payload.append("status", formData.status);

    // Send highlights as JSON
    payload.append("points", JSON.stringify(cleanedHighlights));

    // Only append when a new poster is selected
    if (poster instanceof File) {
      payload.append("poster", poster);
    }

    return payload;
  };

  const createWorkshop = async () => {
    const payload = buildPayload();
    await axios.post(`${BASE_URL}/api/workshops/create`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("Workshop Created!");
  };

  const updateWorkshop = async (workshopId: string) => {
    const payload = buildPayload();
    await axios.put(`${BASE_URL}/api/workshops/update/${workshopId}`, payload);
    alert("Workshop Updated!");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.headline || !formData.title) {
      alert("Fill all the Details");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && id) {
        await updateWorkshop(id);
      } else {
        await createWorkshop();
      }
      navigate("/workshops"); // go back to the table after success
    } catch (err) {
      console.error("error", err);
      setError(
        isEditMode
          ? "Something went wrong while updating the workshop."
          : "Something went wrong while creating the workshop.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Show a simple loading state while fetching the workshop to edit
  if (loading) {
    return (
      <ComponentCard title={isEditMode ? "Edit Workshop" : "New Workshop Form"}>
        <div className="flex items-center justify-center py-10 text-sm text-gray-500">
          Loading workshop details...
        </div>
      </ComponentCard>
    );
  }

  return (
    <>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="flex gap-4 items-center text-2xl font-semibold text-gray-800">
            <Link
              to="/workshops"
              className="p-2 rounded-full bg-black text-white"
            >
              {" "}
              <ArrowLeft size={16} />{" "}
            </Link>{" "}
            {isEditMode ? "Update Workshop" : "Create New Workshop"}

          </h1>
        </div>
      </div>
      <div className="bg-white p-8 rounded-xl border border-gray-200">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              type="text"
              id="headline"
              name="headline"
              placeholder="5 days Intensive..."
              value={formData.headline}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              placeholder="eg: ACTING WORKSHOP"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="desc">Description</Label>
            <Input
              type="text"
              id="desc"
              placeholder="Workshop details in 2 lines"
              name="desc"
              value={formData.desc}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Highlights</label>

            {highlights.map((value, index) => (
              <div
                key={index}
                className="flex items-center justify-between w-full gap-2"
              >
                <input
                  type="text"
                  id={`highlight-${index}`}
                  value={value}
                  onChange={(e) => updateHighlight(index, e.target.value)}
                  placeholder={`Highlight ${index + 1}`}
                  className={InputStyle}
                />
                {index === 0 ? (
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="py-2 px-2 rounded-lg border text-white bg-green-500 hover:bg-green-600"
                  >
                    <Plus className="text-sm" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="py-2 px-2 rounded-lg border text-white bg-red-500 hover:bg-red-600"
                  >
                    <X className="text-sm" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <Label htmlFor="fee">Price</Label>
              <Input
                type="text"
                id="fee"
                placeholder="Fees"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <input
                type="date"
                id="date"
                name="date"
                className={InputStyle}
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="datelabel">Date for Button</Label>
              <input
                type="text"
                id="datelabel"
                placeholder="10 Sep, 2026"
                className={InputStyle}
                name="datelabel"
                value={formData.datelabel}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="poster">Poster</Label>
              <input
                type="file"
                id="poster"
                accept="image/*"
                className={InputStyle}
                onChange={handleFileChange}
              />
              {poster && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {poster.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <input
                type="text"
                id="location"
                placeholder="Chennai"
                className={InputStyle}
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="border w-full px-3 py-2.5 rounded-lg border-gray-300"
            >
              <option value="-">-</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="border w-full bg-blue-500 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {submitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Workshop"
                : "Create New Workshop"}
          </button>
        </form>
      </div>
    </>
  );
}
