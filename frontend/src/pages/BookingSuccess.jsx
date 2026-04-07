import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    selectedSeats = [],
    movieName = "",
    theatreName = "",
    theatreLocation = "",
    time = "",
    totalPrice = 0,
    paymentId = "",
    orderId = "",
  } = location.state || {};

  const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="bg-white max-w-md w-full rounded-xl shadow-lg p-6 text-center">

        {/* SUCCESS ICON */}
        <div className="text-green-500 text-5xl mb-4">✅</div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Booking Confirmed!
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Your tickets have been successfully booked 🎉
        </p>

        {/* MOVIE DETAILS */}
        <div className="text-left space-y-2 mb-5">
          <p className="font-semibold text-gray-800">{movieName}</p>
          <p className="text-sm text-gray-600">
            {theatreName} • {theatreLocation}
          </p>
          <p className="text-sm text-gray-500">
            ⏰ {formatTime(time)}
          </p>
        </div>

        <hr className="my-4" />

        {/* SEATS */}
        <div className="text-left mb-4">
          <p className="text-sm text-gray-500">Seats</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSeats.map((seat) => (
              <span
                key={seat._id}
                className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium"
              >
                {seat.seatNumber}
              </span>
            ))}
          </div>
        </div>

        {/* TOTAL */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700 font-medium">Total Paid</span>
          <span className="text-green-600 font-bold text-lg">
            ₹{totalPrice}
          </span>
        </div>

        {/* PAYMENT INFO */}
        <div className="text-xs text-gray-400 mb-6 text-left">
          <p>Payment ID: {paymentId}</p>
          <p>Order ID: {orderId}</p>
        </div>

        {/* BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium"
        >
          Go to Home
        </button>

      </div>
    </div>
  );
}

export default BookingSuccess;