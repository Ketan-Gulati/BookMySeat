import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/movie/${movie._id}`)}
      className="group cursor-pointer"
    >
      {/* CARD CONTAINER */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Poster */}
        <div className="relative">
          <img
            src={movie.coverImage}
            alt={movie.title}
            className="w-full h-72 object-cover"
          />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

          {/* Rating */}
          <div className="absolute top-3 left-3 bg-white text-black text-xs px-2 py-1 rounded-md font-semibold shadow">
            ⭐ {movie.rating || "4.8"}
          </div>
        </div>

        {/* CONTENT BELOW IMAGE */}
        <div className="p-3">
          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
            {movie.title}
          </h3>

          {/* Genre */}
          <p className="text-xs text-gray-500 mt-1">{movie.genre || "Drama"}</p>
        </div>
      </div>
    </div>
  );
}
