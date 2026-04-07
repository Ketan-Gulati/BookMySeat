import React from "react";
import { useLocation } from "react-router-dom";

function Checkout() {
  const location = useLocation();

  const {
    selectedSeats = [],
    totalPrice = 0,
    movieName = "",
    theatreName = "",
    location: theatreLocation = "",
    time = "",
  } = location.state || {};

  // Format time
  const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">

        {/* HEADER */}
        <h2 className="text-2xl font-semibold mb-5 text-gray-900">
          Booking Summary
        </h2>

        {/* MOVIE DETAILS */}
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-800">
            {movieName}
          </h3>

          <p className="text-sm text-gray-600">
            {theatreName} • {theatreLocation}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            ⏰ {formatTime(time)}
          </p>
        </div>

        <hr className="my-4" />

        {/* SEATS */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">Selected Seats</p>

          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSeats.map((seat) => (
              <span
                key={seat._id}
                className="px-2 py-1 bg-gray-200 rounded text-xs font-medium"
              >
                {seat.seatNumber}
              </span>
            ))}
          </div>
        </div>

        {/* PRICE DETAILS */}
        <div className="space-y-2 text-sm text-gray-700">

          <div className="flex justify-between">
            <span>Number of seats</span>
            <span>{selectedSeats.length}</span>
          </div>

        </div>

        <hr className="my-4" />

        {/* TOTAL */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-semibold">Total Amount</span>
          <span className="text-xl font-bold text-green-600">
            ₹{totalPrice}
          </span>
        </div>

        {/* BUTTON */}
        <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition">
          Confirm & Pay
        </button>

      </div>
    </div>
  );
}

export default Checkout;