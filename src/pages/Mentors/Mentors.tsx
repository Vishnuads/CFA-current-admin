import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

interface Mentor {
  _id: string;
  name: string;
  role: string;
  desc: string;
  course: Department;
  image: string;
  type: "Mentor" | "Advisory Board";
}

interface Department {
  _id: string;
  name: string;
  slug: string;
}

const BASE_URL = "http://localhost:3000";

export default function Mentors() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);

  const [courses, setCourses] = useState<Department[]>([]);

  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    desc: "",
    course: "",
    type: "",
    image: null as File | null,
  });

  const [typeFilter, setTypeFilter] = useState<
    "All" | "Mentor" | "Advisory Board"
  >("All");

  // GET ALL MENTORS
  const fetchMentors = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/api/mentors/get`);

      setMentors(res.data.data || res.data);
    } catch (error) {
      console.error("Failed to fetch mentors", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/departments/get`);
      setCourses(res.data.data);
    } catch (err) {
      console.log("Error : ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
    fetchDepartments();
  }, []);

  // INPUT CHANGE
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "type" && value === "Advisory Board" ? { course: "" } : {}),
    }));
  };

  // IMAGE CHANGE
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  // ADD / UPDATE
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // if (formData.type === "Mentor" && !formData.course) {
    //   alert("Please select a department");
    //   return;
    // }

    if (!formData.type) {
      alert("Please select a type");
      return;
    }

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("role", formData.role);
      data.append("desc", formData.desc);
      data.append("type", formData.type);

      if (formData.image) {
        data.append("image", formData.image);
      }

      if (formData.course) {
        data.append("course", formData.course);
      }

      if (selectedMentor) {
        // UPDATE
        await axios.put(
          `${BASE_URL}/api/mentors/update/${selectedMentor._id}`,
          data,
        );
      } else {
        // CREATE
        await axios.post(`${BASE_URL}/api/mentors/create`, data);
      }

      setShowForm(false);
      setSelectedMentor(null);

      setFormData({
        name: "",
        role: "",
        desc: "",
        course: "",
        type: "",
        image: null,
      });

      fetchMentors();
    } catch (error) {
      console.error("Failed to save mentor", error);
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this mentor?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}/api/mentors/delete/${id}`);

      fetchMentors();
    } catch (error) {
      console.error("Failed to delete mentor", error);
    }
  };

  // EDIT
  const handleEdit = (mentor: Mentor) => {
    setSelectedMentor(mentor);

    setFormData({
      name: mentor.name,
      role: mentor.role,
      desc: mentor.desc,
      course:
        typeof mentor.course === "string"
          ? mentor.course
          : mentor.course?._id || "",
      type: mentor.type,
      image: null,
    });

    setShowForm(true);
  };

  // ADD
  const handleAdd = () => {
    setSelectedMentor(null);

    setFormData({
      name: "",
      role: "",
      desc: "",
      course: "",
      type: "",
      image: null,
    });

    setShowForm(true);
  };

  // VIEW
  const handleView = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowView(true);
  };

  // Filter
  const filteredMentors = mentors.filter((mentor) => {
    if (typeFilter === "All") return true;
    return mentor.type === typeFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mentors</h1>

          <p className="mt-1 text-sm text-gray-500">Manage all mentors</p>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter("All")}
              className={`rounded-lg px-4 py-2 text-sm ${
                typeFilter === "All"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setTypeFilter("Mentor")}
              className={`rounded-lg px-4 py-2 text-sm ${
                typeFilter === "Mentor"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700"
              }`}
            >
              Mentors
            </button>

            <button
              onClick={() => setTypeFilter("Advisory Board")}
              className={`rounded-lg px-4 py-2 text-sm ${
                typeFilter === "Advisory Board"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700"
              }`}
            >
              Advisory Board
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={18} />
            Add Mentor
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="py-20 text-center text-gray-500">
          Loading mentors...
        </div>
      )}

      {/* EMPTY */}
      {!loading && mentors.length === 0 && (
        <div className="rounded-xl border bg-white py-20 text-center">
          <p className="text-gray-500">No results found.</p>
        </div>
      )}

      {/* GRID */}
      {!loading && filteredMentors.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor._id}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* IMAGE */}
              <div className="relative h-72 w-full overflow-hidden bg-gray-100">
                <img
                  src={`${BASE_URL}/${mentor.image}`}
                  alt={mentor.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* DARK GRADIENT */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* MENTOR INFO */}
                <div className="absolute bottom-4 left-4 group-hover:opacity-0 opacity-100 right-4">
                  <h2 className="text-sm font-semibold text-white">
                    {mentor.name}
                  </h2>

                  {/* <p className="mt-1 text-sm text-white/80">{mentor.role}</p> */}
                </div>

                {/* ACTIONS */}
                <div className=" absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 translate-y-2 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 ">
                  {/* VIEW */}
                  <button
                    onClick={() => handleView(mentor)}
                    className=" flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-gray-900"
                  >
                    <Eye size={16} />
                    View
                  </button>

                  {/* EDIT */}
                  <button
                    onClick={() => handleEdit(mentor)}
                    className="rounded-lg bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white hover:text-gray-900 "
                    title="Edit mentor"
                  >
                    <Pencil size={16} />
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(mentor._id)}
                    className=" rounded-lg bg-red-500/80 p-2.5 text-white transition hover:bg-red-600"
                    title="Delete mentor"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {selectedMentor ? "Edit Mentor" : "Add Mentor"}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* NAME */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 text-gray-500 block text-sm font-medium">
                    Name*
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border text-sm border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                    placeholder="Enter mentor name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="type"
                    className="mb-1 text-gray-500 block text-sm font-medium"
                  >
                    Type*
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-lg border text-sm border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                  >
                    <option value="">-</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Advisory Board">Advisory Board</option>
                  </select>
                </div>
              </div>

              {/* ROLE */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-gray-500 text-sm font-medium">
                    Role*
                  </label>

                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg text-sm border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                    placeholder="Enter mentor role"
                  />
                </div>
                <div>
                  <label
                    htmlFor="course"
                    className="mb-1 text-gray-500 block text-sm font-medium"
                  >
                    Department
                  </label>
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    disabled={formData.type === "Advisory Board"}
                    // required={formData.type === "Mentor"}
                    className="w-full rounded-lg border text-sm border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                  >
                    <option value="-">
                      {formData.type === "Advisory Board"
                        ? "Not applicable"
                        : "Select department"}
                    </option>
                    {courses.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-1 block text-gray-500 text-sm font-medium">
                  Description{" "}
                  <span className="text-gray-400 text-xs">
                    {" "}
                    (optional for Board Director)
                  </span>
                </label>

                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  rows={4}
                  className="w-full resize-none rounded-lg border text-sm border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                  placeholder="Enter mentor description"
                />
              </div>

              {/* IMAGE */}
              <div>
                <label className="mb-1 block text-gray-500 text-sm font-medium">
                  Mentor Image*
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-lg border text-gray-500  border-gray-300 px-3 py-2.5  text-sm"
                  required={!selectedMentor}
                />

                {selectedMentor && (
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to keep the current image.
                  </p>
                )}
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border px-4 py-2.5 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  {selectedMentor
                    ? "Update Mentor / Board Director"
                    : "Add Mentor / Board Director"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showView && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg grid grid-cols-2 gap-5 p-5 overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* IMAGE */}
            <div className="h-72 bg-gray-100">
              <img
                src={`${BASE_URL}/${selectedMentor.image}`}
                alt={selectedMentor.name}
                className="h-full w-full object-cover rounded-2xl"
              />
            </div>

            <div className="">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {selectedMentor.name}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-orange-500">
                    {selectedMentor.role}
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-500">
                    {selectedMentor.course?.name || "-"}
                  </p>
                </div>

                <button
                  onClick={() => setShowView(false)}
                  className="text-xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900">About</h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {selectedMentor.desc}
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowView(false);
                    handleEdit(selectedMentor);
                  }}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  onClick={() => {
                    setShowView(false);
                    handleDelete(selectedMentor._id);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
