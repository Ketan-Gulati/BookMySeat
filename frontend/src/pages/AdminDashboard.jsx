import { useEffect, useState } from "react";
import api from "../services/axios";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [tab, setTab] = useState("movies");

  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);

  const [form, setForm] = useState({});
  const [editData, setEditData] = useState(null);
  const [editType, setEditType] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // ---------------- FETCH ----------------
  const fetchAll = async () => {
    const [m, t, s] = await Promise.all([
      api.get("/admin/movies"),
      api.get("/admin/theatres"),
      api.get("/admin/shows"),
    ]);

    setMovies(m.data.data);
    setTheatres(t.data.data);
    setShows(s.data.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ---------------- DELETE ----------------
  const handleDelete = async (type, id) => {
    await api.delete(`/admin/${type}/${id}`);
    toast.success("Deleted");
    fetchAll();
  };

  // ---------------- EDIT PREFILL ----------------
  useEffect(() => {
    if (!editData) return;

    if (editType === "shows") {
      setForm({
        movie: editData.movie?._id || "",
        theatre: editData.theatre?._id || "",
        language: editData.language || "",
        showDateTime: editData.showDateTime || "",
        price: editData.price || "",
        totalSeats: editData.totalSeats || "",
      });
    } else {
      setForm(editData);
    }
  }, [editData]);

  // ---------------- UPDATE ----------------
  const handleUpdate = async () => {
    try {
      if (editType === "movies") {
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("duration", form.duration);
        fd.append("genre", form.genre);
        fd.append("description", form.description);
        fd.append("rating", form.rating);

        if (form.coverImage instanceof File) {
          fd.append("coverImage", form.coverImage);
        }

        await api.patch(`/admin/movies/${editData._id}`, fd);
      }

      if (editType === "theatres") {
        await api.patch(`/admin/theatres/${editData._id}`, form);
      }

      if (editType === "shows") {
        await api.patch(`/admin/shows/${editData._id}`, form);
      }

      toast.success("Updated");
      setIsEditOpen(false);
      fetchAll();
    } catch {
      toast.error("Update failed");
    }
  };

  // ---------------- CREATE ----------------
  const handleCreate = async () => {
    try {
      if (tab === "movies") {
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("duration", form.duration);
        fd.append("genre", form.genre);
        fd.append("description", form.description);
        fd.append("rating", form.rating);
        fd.append("coverImage", form.coverImage);

        await api.post("/admin/movies", fd);
      }

      if (tab === "theatres") {
        await api.post("/admin/theatres", form);
      }

      if (tab === "shows") {
        await api.post("/admin/shows", form);
      }

      toast.success("Created");
      setIsCreateOpen(false);
      setForm({});
      fetchAll();
    } catch {
      toast.error("Create failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white p-6">
        <h1 className="text-xl font-bold mb-6">BookMySeat</h1>

        <button onClick={() => setTab("movies")} className="block mb-3">Movies</button>
        <button onClick={() => setTab("theatres")} className="block mb-3">Theatres</button>
        <button onClick={() => setTab("shows")}>Shows</button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">

        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold capitalize">{tab}</h2>

          <button
            onClick={() => {
              setForm({});
              setIsCreateOpen(true);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            + Add
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-4 space-y-4">

          {tab === "movies" &&
            movies.map((m) => (
              <Row
                key={m._id}
                title={m.title}
                subtitle={m.genre}
                onEdit={() => {
                  setEditType("movies");
                  setEditData(m);
                  setIsEditOpen(true);
                }}
                onDelete={() => handleDelete("movies", m._id)}
              />
            ))}

          {tab === "theatres" &&
            theatres.map((t) => (
              <Row
                key={t._id}
                title={t.theatreName}
                subtitle={t.location}
                onEdit={() => {
                  setEditType("theatres");
                  setEditData(t);
                  setIsEditOpen(true);
                }}
                onDelete={() => handleDelete("theatres", t._id)}
              />
            ))}

          {tab === "shows" &&
            shows.map((s) => (
              <Row
                key={s._id}
                title={s.movie?.title}
                subtitle={`${s.theatre?.theatreName} • ₹${s.price}`}
                onEdit={() => {
                  setEditType("shows");
                  setEditData(s);
                  setIsEditOpen(true);
                }}
                onDelete={() => handleDelete("shows", s._id)}
              />
            ))}
        </div>
      </div>

      {/* MODAL */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white w-96 p-6 rounded-xl space-y-4">

            <h2 className="text-lg font-semibold">
              {isEditOpen ? "Update" : "Create"}
            </h2>

            {renderForm(tab, editType, form, setForm, movies, theatres)}

            <button
              onClick={isEditOpen ? handleUpdate : handleCreate}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              {isEditOpen ? "Update" : "Create"}
            </button>

            <button
              onClick={() => {
                setIsCreateOpen(false);
                setIsEditOpen(false);
              }}
              className="w-full text-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- COMPONENTS ----------------

function Row({ title, subtitle, onEdit, onDelete }) {
  return (
    <div className="flex justify-between items-center border-b pb-3">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      <div className="space-x-3">
        <button onClick={onEdit} className="text-blue-500">Edit</button>
        <button onClick={onDelete} className="text-red-500">Delete</button>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <p className="text-sm font-medium">{children}</p>;
}

function Input({ value, set }) {
  return (
    <input
      value={value || ""}
      onChange={(e) => set(e.target.value)}
      className="w-full border p-2 rounded"
    />
  );
}

// ---------------- FORM ----------------

function renderForm(tab, editType, form, setForm, movies, theatres) {
  const type = editType || tab;

  if (type === "movies") {
    return (
      <>
        <Label>Title</Label>
        <Input value={form.title} set={v => setForm({ ...form, title: v })} />

        <Label>Duration</Label>
        <Input value={form.duration} set={v => setForm({ ...form, duration: v })} />

        <Label>Genre</Label>
        <Input value={form.genre} set={v => setForm({ ...form, genre: v })} />

        <Label>Rating</Label>
        <Input value={form.rating} set={v => setForm({ ...form, rating: v })} />

        <Label>Description</Label>
        <textarea
          className="w-full border p-2 rounded"
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Label>Cover Image</Label>
        <input type="file" onChange={(e) =>
          setForm({ ...form, coverImage: e.target.files[0] })
        } />
      </>
    );
  }

  if (type === "theatres") {
    return (
      <>
        <Label>Name</Label>
        <Input value={form.theatreName} set={v => setForm({ ...form, theatreName: v })} />

        <Label>Location</Label>
        <Input value={form.location} set={v => setForm({ ...form, location: v })} />
      </>
    );
  }

  if (type === "shows") {
    return (
      <>
        <Label>Movie</Label>
        <select
          value={form.movie || ""}
          onChange={(e) => setForm({ ...form, movie: e.target.value })}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Movie</option>
          {movies.map(m => (
            <option key={m._id} value={m._id}>{m.title}</option>
          ))}
        </select>

        <Label>Theatre</Label>
        <select
          value={form.theatre || ""}
          onChange={(e) => setForm({ ...form, theatre: e.target.value })}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Theatre</option>
          {theatres.map(t => (
            <option key={t._id} value={t._id}>{t.theatreName}</option>
          ))}
        </select>

        <Label>Language</Label>
        <Input value={form.language} set={v => setForm({ ...form, language: v })} />

        <Label>Date & Time</Label>
        <input
          type="datetime-local"
          value={form.showDateTime?.slice(0, 16) || ""}
          onChange={(e) => setForm({ ...form, showDateTime: e.target.value })}
          className="w-full border p-2 rounded"
        />

        <Label>Price</Label>
        <Input value={form.price} set={v => setForm({ ...form, price: v })} />

        <Label>Total Seats</Label>
        <Input value={form.totalSeats} set={v => setForm({ ...form, totalSeats: v })} />
      </>
    );
  }
}