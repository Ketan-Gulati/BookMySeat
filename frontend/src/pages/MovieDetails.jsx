import { useEffect, useState } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import api from "../services/axios";
import { formatDuration } from "../utils/formatDuration.js";
import Shows from "./Shows.jsx";

export default function MovieDetails() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  const fetchMovie = async () => {
    try {
      const res = await api.get(`/user/movies/${movieId}`);
      setMovie(res.data.data);
    } catch (err) {
      console.log("Error fetching movie:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovie();
  }, [movieId]);

  if (loading || !movie) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/*HERO SECTION */}
      <div
        className="relative h-120 bg-cover bg-center"
        style={{ backgroundImage: `url(${movie.coverImage})` }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70"></div>

        {/* Content */}
        <div className="relative max-w-6xl mx-auto flex items-center h-full px-6 gap-8">
          {/* Poster */}
          <img
            src={movie.coverImage}
            alt={movie.title}
            className="w-64 h-96 object-cover rounded-xl shadow-2xl"
          />

          {/* Info */}
          <div className="text-white space-y-4">
            {/* Title */}
            <h1 className="text-4xl font-bold">{movie.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <span className="bg-white/10 px-3 py-1 rounded-lg text-sm backdrop-blur">
                ⭐ {movie.rating}/5
              </span>
            </div>

            {/* Meta */}
            <div className="text-gray-300 text-sm flex gap-3 flex-wrap">
              <span>{formatDuration(movie.duration)}</span>
              <span>•</span>
              <span>{movie.genre}</span>
            </div>

            {/* Button */}
            <button
              onClick={() => setShowPopup(true)}
              className="mt-4 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-medium transition transform hover:scale-105"
            >
              Book Tickets
            </button>

            {/*Popup UI */}
            {showPopup && (
                <Shows onClose={()=> setShowPopup(false)} movieName = {movie.title}/>
            )}

          </div>
        </div>
      </div>

      {/*ABOUT SECTION */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-4">About the movie</h2>

        <p className="text-gray-700 leading-relaxed max-w-3xl">
          {movie.description}
        </p>
      </div>
      <Outlet />
    </div>
  );
}
