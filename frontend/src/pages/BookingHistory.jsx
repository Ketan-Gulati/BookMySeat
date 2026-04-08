import React, { useEffect, useState } from "react";
import api from "../services/axios";

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/user/booking-history");
      setBookings(res.data.data);
    } catch (error) {
      console.log("Error while getting user bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No bookings yet 🎬
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">

      {/* Heading */}
      <h1 className="text-2xl font-semibold mb-6">
        My Bookings
      </h1>

      {/* Booking Cards */}
      <div className="space-y-5">

        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition"
          >

            {/* Movie Name */}
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {booking.show?.movie?.title || "Movie"}
            </h2>

            {/* Theatre + Time */}
            <p className="text-sm text-gray-600">
              {booking.show?.theatre?.theatreName} •{" "}
              {booking.show?.theatre?.location}
            </p>

            <p className="text-sm text-gray-500 mb-2">
              ⏰ {formatDate(booking.show?.showDateTime)}
            </p>

            {/* Seats */}
            <div className="flex flex-wrap gap-2 mb-3">
              {booking.seats.map((seat) => (
                <span
                  key={seat._id}
                  className="px-2 py-1 bg-gray-200 rounded text-xs font-medium"
                >
                  {seat.seatNumber}
                </span>
              ))}
            </div>

            {/* Bottom Row */}
            <div className="flex justify-between items-center">

              {/* Amount */}
              <p className="text-sm font-medium text-gray-800">
                ₹{booking.totalAmount}
              </p>

              {/* Status */}
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium
                  ${
                    booking.paymentStatus === "SUCCESS"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }
                `}
              >
                {booking.paymentStatus}
              </span>

            </div>

            {/* Booking Time */}
            <p className="text-xs text-gray-400 mt-3">
              Booked on {formatDate(booking.createdAt)}
            </p>

          </div>
        ))}

      </div>
    </div>
  );
}

export default BookingHistory;