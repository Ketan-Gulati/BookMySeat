import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/axios";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [disabled, setDisabled] = useState(false);

  const {
    sessionId = "",
    selectedSeats = [],
    totalPrice = 0,
    movieName = "",
    theatreName = "",
    location: theatreLocation = "",
    time = "",
    showId = "",
  } = location.state || {};

  const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleConfirmPayment = async () => {
    setDisabled(true);
    try {
      // 1. Create Order
      const res = await api.post("/payments/create-order", {
        sessionId,
      });

      const { orderId, amount, currency } = res.data.data;

      // 2. Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount,
        currency,
        order_id: orderId,
        //runs after payment done
        handler: async function (response) {
          console.log("Res", response);
          try {
            const res = await api.post("/payments/verify", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            const booking = res.data.data;

            navigate("/booking-success", {
              state: {
                selectedSeats,
                movieName,
                theatreName,
                theatreLocation,
                time,
                totalPrice,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              },
            });
          } catch (err) {
            alert("Payment verification failed");
          } finally {
            setDisabled(false);
          }
        },

        name: movieName,
        description: "Movie Ticket Booking",

        prefill: {
          name: "User",
          email: "user@example.com",
        },

        theme: {
          color: "#ef4444",
        },
      };

      // 3. Open Razorpay
      const rzp = new window.Razorpay(options);

      // 4. Handle failure
      rzp.on("payment.failed", function () {
        alert("Payment Failed");
        setDisabled(false);
      });

      rzp.open();
    } catch (error) {
      console.log(error);
      alert("Something went wrong while initiating payment");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-5 text-gray-900">
          Booking Summary
        </h2>

        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-800">{movieName}</h3>

          <p className="text-sm text-gray-600">
            {theatreName} • {theatreLocation}
          </p>

          <p className="text-sm text-gray-500 mt-1">⏰ {formatTime(time)}</p>
        </div>

        <hr className="my-4" />

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

        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-semibold">Total Amount</span>
          <span className="text-xl font-bold text-green-600">
            ₹{totalPrice}
          </span>
        </div>

        <button
          onClick={handleConfirmPayment}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition"
          disabled={disabled}
        >
          Confirm & Pay
        </button>
      </div>
    </div>
  );
}

export default Checkout;
