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
    window.scrollTo(0, 0);  //Every time user opens movie page,starts from top
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
    {/* HERO SECTION */}
    <div
      className="relative h-[70vh] sm:h-[80vh] md:h-[85vh] bg-cover bg-center"
      style={{ backgroundImage: `url(${movie.coverImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-start h-full px-4 sm:px-6 gap-6 md:gap-8 text-center md:text-left">
        
        {/* Poster */}
        <img
          src={movie.coverImage}
          alt={movie.title}
          className="w-40 h-60 sm:w-52 sm:h-80 md:w-64 md:h-96 object-cover rounded-xl shadow-2xl"
        />

        {/* Info */}
        <div className="text-white space-y-3 sm:space-y-4">
          
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            {movie.title}
          </h1>

          {/* Rating */}
          <div className="flex justify-center md:justify-start items-center gap-3">
            <span className="bg-white/10 px-3 py-1 rounded-lg text-xs sm:text-sm backdrop-blur">
              ⭐ {movie.rating}/5
            </span>
          </div>

          {/* Meta */}
          <div className="text-gray-300 text-xs sm:text-sm flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
            <span>{formatDuration(movie.duration)}</span>
            <span>•</span>
            <span>{movie.genre}</span>
          </div>

          {/* Button */}
          <button
            onClick={() => setShowPopup(true)}
            className="mt-3 sm:mt-4 bg-red-500 hover:bg-red-600 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition transform hover:scale-105 w-full sm:w-auto"
          >
            Book Tickets
          </button>

          {/* Popup */}
          {showPopup && (
            <Shows
              onClose={() => setShowPopup(false)}
              movieName={movie.title}
            />
          )}
        </div>
      </div>
    </div>

    {/* ABOUT SECTION */}
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
        About the movie
      </h2>

      <p className="text-gray-700 leading-relaxed text-sm sm:text-base max-w-3xl">
        {movie.description}
      </p>
    </div>

    <Outlet />
  </div>
);
}
