import React, { useEffect, useState } from "react";
import api from "../services/axios";
import { useNavigate, useParams } from "react-router-dom";

function Shows({ onClose, movieName }) {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShows = async () => {
    try {
      const res = await api.get(`/user/movies/${movieId}/shows`);
      setShows(res.data.data);
    } catch (error) {
      console.log("Error fetching shows:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, [movieId]);

  // Format time nicely
  const formatTime = (iso) => {
    const date = new Date(iso);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white w-[90%] max-w-4xl rounded-xl shadow-2xl p-6 pt-8 z-10 max-h-[80vh] overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-900">Select Show</h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-lg cursor-pointer"
          >
            ✖
          </button>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-50 gap-3">
            {/* Spinner */}
            <div className="w-8 h-8 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>

            {/* Text */}
            <p className="text-sm text-gray-500">Loading shows...</p>
          </div>
        ) : shows.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No shows available</p>
        ) : (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {shows.map((theatre) => (
              <div
                key={theatre.theatreId}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                {/* Theatre Info */}
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {theatre.theatreName.toUpperCase()}
                  </h3>
                  <p className="text-xs text-gray-500">{theatre.location}</p>
                </div>

                {/* Show Timings */}
                <div className="flex flex-wrap gap-3">
                  {theatre.shows.map((show) => (
                    <button
                      key={show.showId}
                      className="border border-green-400 text-green-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-50 hover:scale-105 active:scale-95 transition cursor-pointer"
                      onClick={() =>
                        navigate(`/shows/${show.showId}`, {
                          state: { price: show.price, theatreName: theatre.theatreName , theatreLocation: theatre.location, time: show.time, movieName : movieName },
                        })
                      }
                    >
                      <div className="flex flex-col items-center">
                        <span>{formatTime(show.time)}</span>
                        <span className="text-xs text-gray-500 mt-1">
                          ₹{show.price}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shows;
