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
    window.scrollTo(0,0);
  }, [movieId]);

  // safe date handler
  const getDateObj = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  };

  // formatters
  const formatShowTime = (date) => {
    const d = getDateObj(date);
    if (!d) return "--";

    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShowDate = (date) => {
    const d = getDateObj(date);
    if (!d) return "--";

    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // smart label
  const getSmartLabel = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();

    if (d.toDateString() === today.toDateString()) return "Today";

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return formatShowDate(d);
  };

  // group by date
  const groupShowsByDate = (shows) => {
    const grouped = {};

    shows.forEach((show) => {
      const d = getDateObj(show.time);
      if (!d) return;

      const key = d.toDateString();

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(show);
    });

    return grouped;

    
  };

  return (
  <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:pt-20">
    {/* BACKDROP */}
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    />

    {/* MODAL */}
    <div className="relative bg-white w-full sm:w-[90%] max-w-4xl rounded-t-xl sm:rounded-xl shadow-2xl p-4 sm:p-6 pt-6 sm:pt-8 z-10 max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 sm:mb-6 border-b pb-3">
        <h2 className="text-base sm:text-xl font-semibold text-gray-900">
          Select Show
        </h2>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-black text-base sm:text-lg cursor-pointer"
        >
          ✖
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading shows...</p>
        </div>
      ) : shows.length === 0 ? (
        <p className="text-gray-500 text-center py-10 text-sm sm:text-base">
          No shows available
        </p>
      ) : (
        <div className="space-y-4 sm:space-y-6 max-h-[65vh] overflow-y-auto pr-1 sm:pr-2">
          {shows.map((theatre) => {
            const grouped = groupShowsByDate(theatre.shows);

            return (
              <div
                key={theatre.theatreId}
                className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition"
              >
                {/* Theatre Info */}
                <div className="mb-3 sm:mb-4">
                  <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">
                    {theatre.theatreName.toUpperCase()}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500">
                    {theatre.location}
                  </p>
                </div>

                {/* GROUPED SHOWS */}
                {Object.entries(grouped).map(
                  ([dateKey, showsForDate], idx) => (
                    <div key={dateKey} className="mb-3 sm:mb-4">

                      {/* DATE */}
                      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        {getSmartLabel(dateKey)}
                      </p>

                      {/* TIMES */}
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {showsForDate.map((show) => (
                          <button
                            key={show.showId}
                            className="border border-green-400 text-green-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-green-50 active:scale-95 transition cursor-pointer flex flex-col items-center min-w-[70px] sm:min-w-[90px]"
                            onClick={() =>
                              navigate(`/shows/${show.showId}`, {
                                state: {
                                  price: show.price,
                                  theatreName: theatre.theatreName,
                                  location: theatre.location,
                                  time: show.time,
                                  movieName,
                                },
                              })
                            }
                          >
                            <span>{formatShowTime(show.time)}</span>
                            <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                              ₹{show.price}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* DIVIDER */}
                      {idx !== Object.entries(grouped).length - 1 && (
                        <hr className="my-3 sm:my-4 border-gray-200" />
                      )}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
}

export default Shows;