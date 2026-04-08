import React, { useEffect, useState } from "react";
import api from "../services/axios";
import MovieCard from "../components/MovieCard";
import { useOutletContext } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();
  // console.log(session);

  //track time
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // every 1 sec

    return () => clearInterval(interval);
  }, []);

  const isExpired =
    session?.expiresAt && new Date(session.expiresAt) <= currentTime;

  //calculating time left to show in UI
  const expiryTime = session?.expiresAt ? new Date(session.expiresAt) : null;
  const timeLeft = expiryTime ? expiryTime - currentTime : 0;
  const seconds = Math.max(0, Math.floor(timeLeft / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const fetchMovies = async () => {
    try {
      const res = await api.get("/user/movies");
      setMovies(res.data.data);
    } catch (error) {
      console.log("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const res = await api.get("/user/booking-session/active");
      // console.log(res.data.data);
      setSession(res.data.data);
    } catch (error) {
      console.log("No active session");
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchActiveSession();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* CONTINUE BOOKING bar */}
      {session && !isExpired && (
        <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg mb-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-800">
              Continue your booking
            </p>

            <p className="text-xs text-gray-600">
              {session.show.movie.title} • {session.seats.length} seats
            </p>

            {/* time count-down */}
            <p className="text-xs text-red-500 mt-1">
              Expires in {minutes}m {remainingSeconds}s
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/checkout", {
                state: {
                  selectedSeats: session.seats,
                  movieName: session.show.movie.title,
                  theatreName: session.show.theatre.theatreName,
                  location: session.show.theatre.location,
                  time: session.show.showDateTime,
                  totalPrice: session.show.price * session.seats.length,
                  showId: session.show._id,
                  sessionId: session._id,
                },
              })
            }
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Continue
          </button>
        </div>
      )}

      {/* Heading */}
      <h1 className="text-3xl font-bold mb-8">Now Showing</h1>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default Movies;
