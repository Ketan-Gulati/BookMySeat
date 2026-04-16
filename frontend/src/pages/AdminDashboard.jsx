import { useEffect, useState, useCallback, useRef } from "react";
import api from "../services/axios";
import { useSelector } from "react-redux";

// ─── API helpers ──────────────────────────────────────────────────────────────
const createMovie   = (data)      => api.post("/admin/movies", data);
const updateMovie   = (id, data)  => api.patch(`/admin/movies/${id}`, data);
const deleteMovie   = (id)        => api.delete(`/admin/movies/${id}`);

const createTheatre = (data)      => api.post("/admin/theatres", data);
const updateTheatre = (id, data)  => api.patch(`/admin/theatres/${id}`, data);
const deleteTheatre = (id)        => api.delete(`/admin/theatres/${id}`);

const createShow    = (data)      => api.post("/admin/shows", { ...data, showDateTime: new Date(data.showDateTime).toISOString() });
const updateShow    = (id, data)  => api.patch(`/admin/shows/${id}`, { ...data, showDateTime: new Date(data.showDateTime).toISOString() });
const deleteShow    = (id)        => api.delete(`/admin/shows/${id}`);

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (iso) => {
  if (!iso) return { date: "—", time: "—" };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
};

const toLocalDatetime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const statusColor = (s = "") => {
  const v = s.toUpperCase();
  if (v === "SUCCESS" || v === "PAID") return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (v === "PENDING") return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-rose-600 bg-rose-50 border-rose-200";
};

// ─── skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 space-y-3 shadow-sm">
      <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
    </div>
  );
}

// ─── icon buttons ─────────────────────────────────────────────────────────────
function EditBtn({ onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title="Edit"
      className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-500 hover:text-indigo-700 border border-indigo-100 transition-all flex-shrink-0"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
  );
}

function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title="Delete"
      className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-400 hover:text-rose-600 border border-rose-100 transition-all flex-shrink-0"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
      </svg>
    </button>
  );
}

// ─── modal backdrop ───────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <h2 className="font-bold text-gray-900 text-base">{title}</h2>
      <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">✕</button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition placeholder:text-gray-300";

// ─── confirm delete dialog ────────────────────────────────────────────────────
function ConfirmDelete({ label, onConfirm, onCancel, loading }) {
  return (
    <Modal onClose={onCancel}>
      <ModalHeader title="Confirm Delete" onClose={onCancel} />
      <div className="px-6 py-5 space-y-4">
        <p className="text-sm text-gray-600">Are you sure you want to delete <span className="font-semibold text-gray-900">"{label}"</span>? This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition disabled:opacity-60"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── MOVIE MODAL ──────────────────────────────────────────────────────────────
const MOVIE_DEFAULTS = { title: "", genre: "", duration: "", rating: "", coverImage: "" };

function MovieModal({ movie, onClose, onSaved }) {
  const [form, setForm] = useState(movie ? {
    title: movie.title || "",
    genre: movie.genre || "",
    duration: movie.duration || "",
    rating: movie.rating || "",
    coverImage: movie.coverImage || "",
  } : { ...MOVIE_DEFAULTS });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    try {
      if (movie) {
        await updateMovie(movie._id, form);
      } else {
        await createMovie(form);
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
    setSaving(false);
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={movie ? "Edit Movie" : "Add Movie"} onClose={onClose} />
      <div className="px-6 py-5 space-y-4">
        {error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
        <Field label="Title"><input className={inputCls} value={form.title} onChange={set("title")} placeholder="Movie title" /></Field>
        <Field label="Genre"><input className={inputCls} value={form.genre} onChange={set("genre")} placeholder="e.g. Action, Drama" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration (min)"><input type="number" className={inputCls} value={form.duration} onChange={set("duration")} placeholder="200" /></Field>
          <Field label="Rating"><input type="number" step="0.1" className={inputCls} value={form.rating} onChange={set("rating")} placeholder="4.5" /></Field>
        </div>
        <Field label="Cover Image URL"><input className={inputCls} value={form.coverImage} onChange={set("coverImage")} placeholder="https://..." /></Field>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2 text-sm rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition disabled:opacity-60">
            {saving ? "Saving…" : movie ? "Save Changes" : "Add Movie"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── THEATRE MODAL ────────────────────────────────────────────────────────────
function TheatreModal({ theatre, onClose, onSaved }) {
  const [form, setForm] = useState({ theatreName: theatre?.theatreName || "", location: theatre?.location || "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.theatreName.trim()) { setError("Theatre name is required"); return; }
    setSaving(true); setError("");
    try {
      if (theatre) await updateTheatre(theatre._id, form);
      else await createTheatre(form);
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
    setSaving(false);
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={theatre ? "Edit Theatre" : "Add Theatre"} onClose={onClose} />
      <div className="px-6 py-5 space-y-4">
        {error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
        <Field label="Theatre Name"><input className={inputCls} value={form.theatreName} onChange={set("theatreName")} placeholder="e.g. PVR Cinemas" /></Field>
        <Field label="Location"><input className={inputCls} value={form.location} onChange={set("location")} placeholder="e.g. Connaught Place, Delhi" /></Field>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-60">
            {saving ? "Saving…" : theatre ? "Save Changes" : "Add Theatre"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── SHOW MODAL ───────────────────────────────────────────────────────────────
function ShowModal({ show, allMovies, allTheatres, onClose, onSaved }) {
  const [form, setForm] = useState({
    movie:        show?.movie?._id || show?.movie || "",
    theatre:      show?.theatre?._id || show?.theatre || "",
    showDateTime: show?.showDateTime ? toLocalDatetime(show.showDateTime) : "",
    language:     show?.language || "",
    price:        show?.price || "",
    totalSeats:   show?.totalSeats || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.movie || !form.theatre || !form.showDateTime) { setError("Movie, Theatre, and Date/Time are required"); return; }
    setSaving(true); setError("");
    try {
      if (show) await updateShow(show._id, form);
      else await createShow(form);
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
    setSaving(false);
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={show ? "Edit Show" : "Add Show"} onClose={onClose} />
      <div className="px-6 py-5 space-y-4">
        {error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
        <Field label="Movie">
          <select className={inputCls} value={form.movie} onChange={set("movie")}>
            <option value="">Select movie…</option>
            {allMovies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
          </select>
        </Field>
        <Field label="Theatre">
          <select className={inputCls} value={form.theatre} onChange={set("theatre")}>
            <option value="">Select theatre…</option>
            {allTheatres.map((t) => <option key={t._id} value={t._id}>{t.theatreName} – {t.location}</option>)}
          </select>
        </Field>
        <Field label="Date & Time"><input type="datetime-local" className={inputCls} value={form.showDateTime} onChange={set("showDateTime")} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Language"><input className={inputCls} value={form.language} onChange={set("language")} placeholder="Hindi" /></Field>
          <Field label="Price (₹)"><input type="number" className={inputCls} value={form.price} onChange={set("price")} placeholder="500" /></Field>
          <Field label="Seats"><input type="number" className={inputCls} value={form.totalSeats} onChange={set("totalSeats")} placeholder="200" /></Field>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition disabled:opacity-60">
            {saving ? "Saving…" : show ? "Save Changes" : "Add Show"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── column panel ─────────────────────────────────────────────────────────────
function Panel({ title, count, icon, children, loading }) {
  return (
    <div className="flex flex-col bg-[#f9fafb] rounded-2xl border border-gray-200 overflow-hidden h-full">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="font-semibold text-gray-800 text-sm tracking-tight">{title}</span>
        </div>
        {count != null && (
          <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{count}</span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {loading ? <><SkeletonCard /><SkeletonCard /><SkeletonCard /></> : children}
      </div>
    </div>
  );
}

function EmptyCol({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      <div className="text-3xl mb-2 opacity-20">{icon}</div>
      <p className="text-xs text-gray-400 font-medium">{text}</p>
    </div>
  );
}

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center gap-4 relative overflow-hidden hover:shadow-md transition-shadow">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent }} />
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: accent + "18" }}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</div>
        {loading
          ? <div className="animate-pulse h-7 w-16 bg-gray-100 rounded-lg mt-1" />
          : <div className="text-2xl font-extrabold text-gray-900 tracking-tight mt-0.5">{value ?? "—"}</div>
        }
      </div>
    </div>
  );
}

// ─── sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦"  },
  { id: "movies",    label: "Movies",    icon: "🎬" },
  { id: "theatres",  label: "Theatres",  icon: "🏛"  },
  { id: "shows",     label: "Shows",     icon: "🎟"  },
  { id: "bookings",  label: "Bookings",  icon: "📋" },
];

function Sidebar({ active, onNavigate, counts }) {
  const { user } = useSelector((state) => state.auth);
  const initials = user?.userName?.slice(0, 2).toUpperCase() || "AD";
  return (
    <aside className="w-[210px] flex-shrink-0 bg-[#0d0f14] text-white flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <div className="font-extrabold text-[17px] tracking-tight">
          Book<span className="bg-rose-600 text-white rounded px-1 mx-0.5">My</span>Seat
        </div>
        <div className="text-[10px] text-gray-500 tracking-widest uppercase mt-1">Admin Panel</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest px-2 pb-1.5">Navigation</div>
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left
              ${active === n.id ? "bg-rose-600/20 text-rose-400" : "text-gray-400 hover:bg-white/[0.05] hover:text-white"}`}
          >
            <span className="text-base w-5 text-center">{n.icon}</span>
            <span className="flex-1">{n.label}</span>
            {counts[n.id] != null && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                ${active === n.id ? "bg-rose-500/30 text-rose-300" : "bg-white/[0.06] text-gray-500"}`}>
                {counts[n.id]}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-white/[0.07]">
        <div className="flex items-center gap-2.5 bg-white/[0.05] rounded-xl p-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.userName}</div>
            <div className="text-[10px] text-rose-400 font-medium">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── topbar ───────────────────────────────────────────────────────────────────
const PAGE_META = {
  dashboard: { title: "Dashboard",        sub: "Platform overview"                             },
  movies:    { title: "Movies",           sub: "All movies on the platform"                    },
  theatres:  { title: "Theatres",         sub: "Registered theatre listings"                   },
  shows:     { title: "Shows",            sub: "Scheduled shows across theatres"               },
  bookings:  { title: "Booking Explorer", sub: "Drill down: movie → theatre → show → bookings" },
};

function Topbar({ page, search, onSearch, onRefresh }) {
  const meta = PAGE_META[page] || {};
  const { user } = useSelector((state) => state.auth);
  const initials = user?.userName?.slice(0, 2).toUpperCase() || "AD";
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={`Search ${meta.title?.toLowerCase()}…`}
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-sm"
        >
          ↻ Refresh
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-[10px] font-bold text-white">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.userName}</span>
        </div>
      </div>
    </header>
  );
}

// ─── PAGE: DASHBOARD ──────────────────────────────────────────────────────────
function PageDashboard({ stats, loading, onNavigate }) {
  const { user } = useSelector((state) => state.auth);
  const cards = [
    { id: "movies",   icon: "🎬", label: "Total Movies",    value: stats.movies,   accent: "#e8363d" },
    { id: "theatres", icon: "🏛",  label: "Theatres",        value: stats.theatres, accent: "#6366f1" },
    { id: "shows",    icon: "🎟",  label: "Shows",           value: stats.shows,    accent: "#f59e0b" },
    { id: "bookings", icon: "📋", label: "Explore Bookings", value: null,           accent: "#22c55e" },
  ];
  const tiles = [
    { id: "movies",   icon: "🎬", label: "Manage Movies",   desc: "Browse, create, edit and delete movies",      accent: "#e8363d" },
    { id: "theatres", icon: "🏛",  label: "Manage Theatres", desc: "View and manage registered theatre listings", accent: "#6366f1" },
    { id: "shows",    icon: "🎟",  label: "View Shows",      desc: "Browse, schedule and manage all shows",       accent: "#f59e0b" },
    { id: "bookings", icon: "📋", label: "Booking Explorer", desc: "Drill into bookings by movie & show",         accent: "#22c55e" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Welcome back, {user?.userName} 👋</h1>
        <p className="text-xs text-gray-400 mt-0.5">Here's a snapshot of your platform.</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((c) => (
          <button key={c.id} onClick={() => onNavigate(c.id)} className="text-left">
            <StatCard {...c} loading={loading} />
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {tiles.map((t) => (
          <button key={t.id} onClick={() => onNavigate(t.id)}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-left hover:shadow-md hover:border-gray-300 transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: t.accent + "18" }}>{t.icon}</div>
              <span className="font-semibold text-gray-800 text-sm">{t.label}</span>
              <span className="ml-auto text-gray-300 group-hover:text-gray-500 text-lg">→</span>
            </div>
            <p className="text-xs text-gray-400">{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PAGE: MOVIES ─────────────────────────────────────────────────────────────
function PageMovies({ items, loading, search, onRefresh }) {
  const [modal, setModal]   = useState(null); // null | { mode: "create"|"edit"|"delete", item? }

  const filtered = items.filter((m) => m.title?.toLowerCase().includes(search.toLowerCase()));

  const handleSaved = () => { setModal(null); onRefresh(); };

  const handleDelete = async (item) => {
    setModal({ mode: "deleting", item });
    try { await deleteMovie(item._id); onRefresh(); } catch { /* ignore */ }
    setModal(null);
  };

  return (
    <div className="space-y-4">
      {modal?.mode === "create" && <MovieModal onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.mode === "edit"   && <MovieModal movie={modal.item} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.mode === "delete" && (
        <ConfirmDelete
          label={modal.item?.title}
          loading={modal.mode === "deleting"}
          onConfirm={() => handleDelete(modal.item)}
          onCancel={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Movies</h1>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
        >
          <span className="text-base leading-none">+</span> Add Movie
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-200 rounded-full w-1/3" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-3 opacity-10">🎭</div>
            <p className="text-sm font-medium text-gray-400">No movies found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Movie", "Genre", "Duration", "Rating", "Actions"].map((c) => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item, i) => (
                  <tr key={item._id || i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                          {item.coverImage ? <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" /> : "🎞"}
                        </div>
                        <div className="font-semibold text-gray-800 text-sm">{item.title}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-violet-50 text-violet-600 border border-violet-100 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        {item.genre || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{item.duration ? `${item.duration} min` : "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        ⭐ {item.rating || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <EditBtn onClick={() => setModal({ mode: "edit", item })} />
                        <DeleteBtn onClick={() => setModal({ mode: "delete", item })} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE: THEATRES ───────────────────────────────────────────────────────────
function PageTheatres({ items, loading, search, onRefresh }) {
  const [modal, setModal] = useState(null);

  const filtered = items.filter((t) =>
    t.theatreName?.toLowerCase().includes(search.toLowerCase()) ||
    t.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaved = () => { setModal(null); onRefresh(); };

  const handleDelete = async (item) => {
    setModal({ mode: "deleting", item });
    try { await deleteTheatre(item._id); onRefresh(); } catch { /* ignore */ }
    setModal(null);
  };

  return (
    <div className="space-y-4">
      {modal?.mode === "create" && <TheatreModal onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.mode === "edit"   && <TheatreModal theatre={modal.item} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.mode === "delete" && (
        <ConfirmDelete
          label={modal.item?.theatreName}
          loading={modal.mode === "deleting"}
          onConfirm={() => handleDelete(modal.item)}
          onCancel={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Theatres</h1>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
        >
          <span className="text-base leading-none">+</span> Add Theatre
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-200 rounded-full w-1/3" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-3 opacity-10">🏛</div>
            <p className="text-sm font-medium text-gray-400">No theatres found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Theatre", "Location", "Actions"].map((c) => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item, i) => (
                  <tr key={item._id || i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-base flex-shrink-0">🏛</div>
                        <div className="font-semibold text-gray-800 text-sm">{item.theatreName}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">📍 {item.location}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <EditBtn onClick={() => setModal({ mode: "edit", item })} />
                        <DeleteBtn onClick={() => setModal({ mode: "delete", item })} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE: SHOWS ──────────────────────────────────────────────────────────────
function PageShows({ items, allMovies, allTheatres, loading, search, onRefresh }) {
  const [modal, setModal] = useState(null);

  const filtered = items.filter((s) =>
    s.movie?.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.theatre?.theatreName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaved = () => { setModal(null); onRefresh(); };

  const handleDelete = async (item) => {
    setModal({ mode: "deleting", item });
    try { await deleteShow(item._id); onRefresh(); } catch { /* ignore */ }
    setModal(null);
  };

  return (
    <div className="space-y-4">
      {modal?.mode === "create" && <ShowModal allMovies={allMovies} allTheatres={allTheatres} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.mode === "edit"   && <ShowModal show={modal.item} allMovies={allMovies} allTheatres={allTheatres} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.mode === "delete" && (
        <ConfirmDelete
          label={`${modal.item?.movie?.title} @ ${fmt(modal.item?.showDateTime).time}`}
          loading={modal.mode === "deleting"}
          onConfirm={() => handleDelete(modal.item)}
          onCancel={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Shows</h1>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
        >
          <span className="text-base leading-none">+</span> Add Show
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-200 rounded-full w-1/3" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-3 opacity-10">🎭</div>
            <p className="text-sm font-medium text-gray-400">No shows found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Movie", "Theatre", "Date & Time", "Language", "Price", "Seats", "Actions"].map((c) => (
                    <th key={c} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item, i) => {
                  const { date, time } = fmt(item.showDateTime);
                  return (
                    <tr key={item._id || i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-sm text-gray-800">{item.movie?.title || "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{item.theatre?.theatreName || "—"}</td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-semibold text-gray-800">{date}</div>
                        <div className="text-xs text-gray-400">{time}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          {item.language || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          ₹{item.price || 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{item.totalSeats || "—"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <EditBtn onClick={() => setModal({ mode: "edit", item })} />
                          <DeleteBtn onClick={() => setModal({ mode: "delete", item })} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE: BOOKINGS EXPLORER ──────────────────────────────────────────────────
function PageBookings({
  movies, theatres, shows, bookings,
  selMovie, selTheatre, selShow,
  onMovieClick, onTheatreClick, onShowClick,
  loadingMovies, loadingTheatres, loadingShows, loadingBookings,
  search,
}) {
  const selMovieObj   = movies.find((m) => m._id === selMovie);
  const selTheatreObj = theatres.find((t) => t._id === selTheatre);
  const selShowObj    = shows.find((s) => s._id === selShow);

  const filteredMovies = movies.filter((m) => m.title?.toLowerCase().includes(search.toLowerCase()));

  const totalRevenue = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const totalSeats   = bookings.reduce((s, b) => s + (b.seats?.length || 0), 0);

  const steps = [
    { label: "Movie",   done: !!selMovie,   value: selMovieObj?.title },
    { label: "Theatre", done: !!selTheatre, value: selTheatreObj?.theatreName },
    { label: "Show",    done: !!selShow,    value: selShowObj ? fmt(selShowObj.showDateTime).time : null },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Booking Explorer</h1>
        <p className="text-xs text-gray-400 mt-0.5">Select a movie → theatre → show to view bookings</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all
              ${s.done ? "bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-200" : "bg-white text-gray-400 border-gray-200"}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
                ${s.done ? "bg-white/20" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span>
              {s.done && s.value ? s.value : s.label}
            </div>
            {i < steps.length - 1 && <span className="text-gray-300 text-xs font-bold">›</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4" style={{ height: "340px" }}>
        <Panel title="Movies" icon="🎬" count={filteredMovies.length} loading={loadingMovies}>
          {filteredMovies.length === 0
            ? <EmptyCol icon="🎬" text="No movies found" />
            : filteredMovies.map((m) => (
              <button key={m._id} onClick={() => onMovieClick(m._id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 group
                  ${selMovie === m._id ? "bg-rose-600 border-rose-600 shadow-md shadow-rose-200" : "bg-white border-gray-100 hover:border-rose-300 hover:shadow-sm"}`}>
                <div className={`w-10 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden
                  ${selMovie === m._id ? "bg-white/20" : "bg-gray-50 border border-gray-100"}`}>
                  {m.coverImage ? <img src={m.coverImage} alt={m.title} className="w-full h-full object-cover rounded-lg" /> : "🎞"}
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold truncate ${selMovie === m._id ? "text-white" : "text-gray-800"}`}>{m.title}</div>
                  <div className={`text-[11px] mt-0.5 ${selMovie === m._id ? "text-rose-200" : "text-gray-400"}`}>Tap to view theatres</div>
                </div>
                <span className={`ml-auto text-xs ${selMovie === m._id ? "text-white/60" : "text-gray-300 group-hover:text-rose-400"}`}>›</span>
              </button>
            ))
          }
        </Panel>

        <Panel title="Theatres" icon="🏛" count={theatres.length} loading={loadingTheatres}>
          {!selMovie ? <EmptyCol icon="🏛" text="← Select a movie first" />
            : theatres.length === 0 ? <EmptyCol icon="🏛" text="No theatres for this movie" />
            : theatres.map((t) => (
              <button key={t._id} onClick={() => onTheatreClick(t._id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150 group
                  ${selTheatre === t._id ? "bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100" : "bg-white border-gray-100 hover:border-indigo-300 hover:shadow-sm"}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0
                  ${selTheatre === t._id ? "bg-white/20" : "bg-indigo-50"}`}>🏛</div>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold truncate ${selTheatre === t._id ? "text-white" : "text-gray-800"}`}>{t.theatreName}</div>
                  <div className={`text-[11px] mt-0.5 ${selTheatre === t._id ? "text-indigo-200" : "text-gray-400"}`}>📍 {t.location}</div>
                </div>
                <span className={`ml-auto text-xs mt-0.5 ${selTheatre === t._id ? "text-white/60" : "text-gray-300 group-hover:text-indigo-400"}`}>›</span>
              </button>
            ))
          }
        </Panel>

        <Panel title="Shows" icon="🎟" count={shows.length} loading={loadingShows}>
          {!selTheatre ? <EmptyCol icon="🎟" text="← Select a theatre first" />
            : shows.length === 0 ? <EmptyCol icon="🎟" text="No shows for this theatre" />
            : shows.map((s) => {
                const { date, time } = fmt(s.showDateTime);
                return (
                  <button key={s._id} onClick={() => onShowClick(s._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 group
                      ${selShow === s._id ? "bg-amber-500 border-amber-500 shadow-md shadow-amber-100" : "bg-white border-gray-100 hover:border-amber-300 hover:shadow-sm"}`}>
                    <div className={`flex-shrink-0 flex flex-col items-center justify-center w-11 h-11 rounded-lg text-center
                      ${selShow === s._id ? "bg-white/20" : "bg-amber-50"}`}>
                      <div className={`text-[10px] font-bold ${selShow === s._id ? "text-white/70" : "text-amber-500"}`}>{date?.split(" ")[1]}</div>
                      <div className={`text-sm font-extrabold leading-tight ${selShow === s._id ? "text-white" : "text-gray-800"}`}>{date?.split(" ")[0]}</div>
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-semibold ${selShow === s._id ? "text-white" : "text-gray-800"}`}>{time}</div>
                      <div className={`text-[11px] mt-0.5 ${selShow === s._id ? "text-amber-100" : "text-gray-400"}`}>₹{s.price}</div>
                    </div>
                    <span className={`ml-auto text-xs ${selShow === s._id ? "text-white/60" : "text-gray-300 group-hover:text-amber-400"}`}>›</span>
                  </button>
                );
              })
          }
        </Panel>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span>📋</span>
            <div className="font-semibold text-gray-800 text-sm">
              Bookings
              {selShowObj && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  — {selMovieObj?.title} · {selTheatreObj?.theatreName} · {fmt(selShowObj.showDateTime).date} {fmt(selShowObj.showDateTime).time}
                </span>
              )}
            </div>
          </div>
          {bookings.length > 0 && (
            <div className="flex items-center gap-5">
              {[
                { label: "Revenue",  value: `₹${totalRevenue.toLocaleString("en-IN")}` },
                { label: "Seats",    value: totalSeats },
                { label: "Bookings", value: bookings.length },
              ].map((s) => (
                <div key={s.label} className="text-right">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</div>
                  <div className="text-sm font-bold text-gray-800">{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {loadingBookings ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2"><div className="h-3 bg-gray-200 rounded-full w-1/3" /><div className="h-2.5 bg-gray-100 rounded-full w-1/2" /></div>
                <div className="h-6 w-20 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : !selShow ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="text-5xl mb-3 opacity-10">🎟</div>
            <p className="text-sm font-medium text-gray-400">Select a show above to view its bookings</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="text-5xl mb-3 opacity-10">📭</div>
            <p className="text-sm font-medium text-gray-400">No bookings for this show yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Customer", "Seats", "Amount", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b, i) => {
                  const initials = b.user?.fullName?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
                  return (
                    <tr key={b._id || i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-orange-300 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-800">{b.user?.fullName || "—"}</div>
                            <div className="text-xs text-gray-400">{b.user?.email || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {b.seats?.slice(0, 6).map((s) => (
                            <span key={s.seatNumber} className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded">
                              {s.seatNumber}
                            </span>
                          ))}
                          {b.seats?.length > 6 && <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded">+{b.seats.length - 6}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-bold text-gray-800">₹{(b.totalAmount || 0).toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusColor(b.paymentStatus)}`}>
                          {b.paymentStatus || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AdminBookings() {
  const [activePage, setActivePage] = useState("dashboard");
  const [search, setSearch]         = useState("");

  const [allMovies,     setAllMovies]     = useState([]);
  const [allTheatres,   setAllTheatres]   = useState([]);
  const [allShows,      setAllShows]      = useState([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  const [bMovies,   setBMovies]   = useState([]);
  const [bTheatres, setBTheatres] = useState([]);
  const [bShows,    setBShows]    = useState([]);
  const [bookings,  setBookings]  = useState([]);

  const [selMovie,   setSelMovie]   = useState(null);
  const [selTheatre, setSelTheatre] = useState(null);
  const [selShow,    setSelShow]    = useState(null);

  const [loadingBMovies,  setLoadingBMovies]  = useState(false);
  const [loadingTheatres, setLoadingTheatres] = useState(false);
  const [loadingShows,    setLoadingShows]    = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const fetchGlobal = useCallback(async () => {
    setLoadingGlobal(true);
    try {
      const [m, t, s] = await Promise.all([
        api.get("/admin/movies"),
        api.get("/admin/theatres"),
        api.get("/admin/shows"),
      ]);
      setAllMovies(m.data.data   || []);
      setAllTheatres(t.data.data || []);
      setAllShows(s.data.data    || []);
    } catch { /* handle */ }
    setLoadingGlobal(false);
  }, []);

  const fetchBMovies = useCallback(async () => {
    setLoadingBMovies(true);
    try {
      const res = await api.get("/admin/bookings/movies");
      setBMovies(res.data.data || []);
    } catch { /* handle */ }
    setLoadingBMovies(false);
  }, []);

  useEffect(() => { fetchGlobal(); }, [fetchGlobal]);

  useEffect(() => {
    if (activePage === "bookings" && bMovies.length === 0) fetchBMovies();
  }, [activePage]); // eslint-disable-line

  const handleNavigate = (page) => { setActivePage(page); setSearch(""); };

  const handleRefresh = () => {
    fetchGlobal();
    if (activePage === "bookings") fetchBMovies();
  };

  const handleMovieClick = async (movieId) => {
    if (selMovie === movieId) return;
    setSelMovie(movieId); setSelTheatre(null); setSelShow(null);
    setBTheatres([]); setBShows([]); setBookings([]);
    setLoadingTheatres(true);
    try {
      const res = await api.get(`/admin/bookings/theatres/${movieId}`);
      setBTheatres(res.data.data || []);
    } catch { /* handle */ }
    setLoadingTheatres(false);
  };

  const handleTheatreClick = async (theatreId) => {
    if (selTheatre === theatreId) return;
    setSelTheatre(theatreId); setSelShow(null);
    setBShows([]); setBookings([]);
    setLoadingShows(true);
    try {
      const res = await api.get("/admin/bookings/shows", { params: { movieId: selMovie, theatreId } });
      setBShows(res.data.data || []);
    } catch { /* handle */ }
    setLoadingShows(false);
  };

  const handleShowClick = async (showId) => {
    if (selShow === showId) return;
    setSelShow(showId); setBookings([]);
    setLoadingBookings(true);
    try {
      const res = await api.get(`/admin/bookings/shows/${showId}`);
      setBookings(res.data.data || []);
    } catch { /* handle */ }
    setLoadingBookings(false);
  };

  const counts = {
    dashboard: null,
    movies:    allMovies.length   || null,
    theatres:  allTheatres.length || null,
    shows:     allShows.length    || null,
    bookings:  null,
  };

  return (
    <div className="flex h-screen bg-[#f4f5f7] font-sans overflow-hidden">
      <Sidebar active={activePage} onNavigate={handleNavigate} counts={counts} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar page={activePage} search={search} onSearch={setSearch} onRefresh={handleRefresh} />

        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {activePage === "dashboard" && (
            <PageDashboard
              stats={{ movies: allMovies.length, theatres: allTheatres.length, shows: allShows.length }}
              loading={loadingGlobal}
              onNavigate={handleNavigate}
            />
          )}
          {activePage === "movies" && (
            <PageMovies items={allMovies} loading={loadingGlobal} search={search} onRefresh={fetchGlobal} />
          )}
          {activePage === "theatres" && (
            <PageTheatres items={allTheatres} loading={loadingGlobal} search={search} onRefresh={fetchGlobal} />
          )}
          {activePage === "shows" && (
            <PageShows items={allShows} allMovies={allMovies} allTheatres={allTheatres} loading={loadingGlobal} search={search} onRefresh={fetchGlobal} />
          )}
          {activePage === "bookings" && (
            <PageBookings
              movies={bMovies} theatres={bTheatres} shows={bShows} bookings={bookings}
              selMovie={selMovie} selTheatre={selTheatre} selShow={selShow}
              onMovieClick={handleMovieClick}
              onTheatreClick={handleTheatreClick}
              onShowClick={handleShowClick}
              loadingMovies={loadingBMovies}
              loadingTheatres={loadingTheatres}
              loadingShows={loadingShows}
              loadingBookings={loadingBookings}
              search={search}
            />
          )}
        </div>
      </div>
    </div>
  );
}
