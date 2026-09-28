import { useEffect, useState } from "react";
import { Plus, X, ImagePlus, Loader2, ArrowLeft } from "lucide-react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router";
import BASE_URL from "../../api";

interface EventFormData {
  date: string;
  displayDate: string;
  title: string;
  tagline: string;
  location: string;
}

const EMPTY_FORM: EventFormData = {
  date: "",
  displayDate: "",
  title: "",
  tagline: "",
  location: "Chennai",
};

export default function EventsForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [formData, setFormData] =
    useState<EventFormData>(EMPTY_FORM);

  const [highlights, setHighlights] = useState<string[]>([""]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removeImages, setRemoveImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const IMAGE_BASE_URL = BASE_URL;

  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${BASE_URL}/api/events/get/${id}`
        );

        const event = res.data.data;

        setFormData({
          date: event.date ?? "",
          displayDate: event.displayDate ?? "",
          title: event.title ?? "",
          tagline: event.tagline ?? "",
          location: event.location ?? "",
        });

        setHighlights(
          Array.isArray(event.highlights) &&
            event.highlights.length > 0
            ? event.highlights
            : [""]
        );

        setExistingImages(
          Array.isArray(event.images) ? event.images : []
        );
      } catch (err) {
        console.error("Failed to fetch event:", err);
        setError("Unable to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addHighlight = () => {
    setHighlights((prev) => [...prev, ""]);
  };

  const updateHighlight = (
    index: number,
    value: string
  ) => {
    setHighlights((prev) =>
      prev.map((item, i) =>
        i === index ? value : item
      )
    );
  };

  const removeHighlight = (index: number) => {
    setHighlights((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      return updated.length > 0 ? updated : [""];
    });
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      setError("Only image files are allowed.");
      e.target.value = "";
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (oversizedFile) {
      setError("Each image must be less than 5MB.");
      e.target.value = "";
      return;
    }

    if (files.length > 5) {
      setError("You can select a maximum of 5 images at once.");
      e.target.value = "";
      return;
    }

    // Add selected files
    setNewImages((prev) => {
      const combined = [...prev, ...files];

      // Prevent more than 5 new images
      if (combined.length > 5) {
        setError("Maximum 5 new images can be selected.");
        return combined.slice(0, 5);
      }

      setError("");
      return combined;
    });

    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleRemoveExistingImage = (image: string) => {
    setExistingImages((prev) =>
      prev.filter((item) => item !== image)
    );

    setRemoveImages((prev) => [...prev, image]);
  };

  const restoreExistingImage = (image: string) => {
    setExistingImages((prev) => [...prev, image]);

    setRemoveImages((prev) =>
      prev.filter((item) => item !== image)
    );
  };

  const buildPayload = () => {
    const payload = new FormData();

    const cleanedHighlights = highlights
      .map((item) => item.trim())
      .filter(Boolean);

    payload.append("date", formData.date);
    payload.append("displayDate", formData.displayDate);
    payload.append("title", formData.title);
    payload.append("tagline", formData.tagline);
    payload.append("location", formData.location);

    payload.append(
      "highlights",
      JSON.stringify(cleanedHighlights)
    );

    // Existing images to remove
    payload.append(
      "removeImages",
      JSON.stringify(removeImages)
    );

    // New images
    newImages.forEach((file) => {
      payload.append("images", file);
    });

    return payload;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (
      !formData.title.trim() ||
      !formData.date ||
      !formData.tagline.trim() ||
      !formData.location.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    const cleanedHighlights = highlights
      .map((item) => item.trim())
      .filter(Boolean);

    if (cleanedHighlights.length === 0) {
      setError("Please add at least one highlight.");
      return;
    }

    // Create requires at least one image
    if (!isEditMode && newImages.length === 0) {
      setError("Please select at least one image.");
      return;
    }
    if (
      isEditMode &&
      existingImages.length === 0 &&
      newImages.length === 0
    ) {
      setError("At least one event image is required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload();

      if (isEditMode && id) {
        await axios.put(
          `${BASE_URL}/api/events/update/${id}`,
          payload
        );

        alert("Event updated successfully!");
      } else {
        await axios.post(
          `${BASE_URL}/api/events/create`,
          payload
        );

        alert("Event created successfully!");
      }

      navigate("/events");
    } catch (err: any) {
      console.error("Event submission error:", err);

      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-500" />
        <span className="ml-2 text-gray-500">
          Loading event...
        </span>
      </div>
    );
  }

  const getImageUrl = (image: string) => {
    if (image.startsWith("http")) return image;

    return `${IMAGE_BASE_URL}/${image.replace(/^\/+/, "")}`;
  };


  return (
    <section className="w-full max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="flex gap-4 items-center text-2xl font-semibold text-gray-800">
            <Link
              to="/events"
              className="p-2 rounded-full bg-black text-white"
            >
              {" "}
              <ArrowLeft size={16} />{" "}
            </Link>{" "}
            {isEditMode ? "Update Event" : "Create New Event"}

          </h1>
        </div>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* HEADER */}
        {/* <div className="px-6 sm:px-8 py-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? "Edit Event" : "Create New Event"}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {isEditMode
              ? "Update event details and manage images."
              : "Add a new event with highlights and images."}
          </p>
        </div> */}

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 space-y-5"
        >

          {/* ERROR */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* EVENT TITLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name of the Event *
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="How to Shoot Romantic Scenes"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* TAGLINE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description / Tagline *
            </label>

            <textarea
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              rows={4}
              placeholder="Write a short description about the event..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm resize-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* HIGHLIGHTS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Highlights *
            </label>

            <div className="space-y-3">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) =>
                      updateHighlight(index, e.target.value)
                    }
                    placeholder={`Highlight ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={addHighlight}
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
                      title="Add highlight"
                    >
                      <Plus size={18} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                      title="Remove highlight"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DATE + DISPLAY DATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Date <span className="text-gray-400 italic"> ( optional )</span>
              </label>

              <input
                type="text"
                name="displayDate"
                value={formData.displayDate}
                onChange={handleChange}
                placeholder="04 SEP 2026"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>

          {/* LOCATION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Chennai"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Event Images *
            </label>

            {/* Upload Box */}
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition">
              <ImagePlus size={32} className="text-gray-400" />

              <p className="text-sm font-medium text-gray-700">
                Click to upload images
              </p>

              <p className="text-xs text-gray-500">
                PNG, JPG, WEBP · Maximum 5MB per image
              </p>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* EXISTING IMAGES */}
            {isEditMode && existingImages.length > 0 && (
              <div className="mt-5">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Existing Images
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative group rounded-xl overflow-hidden border border-gray-200"
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveExistingImage(image)
                        }
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition"
                        title="Remove image"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REMOVED IMAGES */}
            {removeImages.length > 0 && (
              <div className="mt-5">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Removed Images
                </h4>

                <div className="space-y-2">
                  {removeImages.map((image) => (
                    <div
                      key={image}
                      className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm text-gray-500"
                    >
                      <span className="truncate mr-3">
                        {image.split("/").pop()}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          restoreExistingImage(image)
                        }
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEW IMAGES */}
            {newImages.length > 0 && (
              <div className="mt-5">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  New Images
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {newImages.map((file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${index}`}
                      className="relative group rounded-xl overflow-hidden border border-gray-200"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition"
                        title="Remove image"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && (
              <Loader2 size={18} className="animate-spin" />
            )}

            {submitting
              ? isEditMode
                ? "Updating Event..."
                : "Creating Event..."
              : isEditMode
                ? "Update Event"
                : "Create Event"}
          </button>

        </form>
      </div>
    </section>
  );
}