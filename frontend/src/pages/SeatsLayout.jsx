import React, { useEffect, useState } from "react";
import api from "../services/axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

function SeatsLayout() {
  const { showId } = useParams();
  const locationData = useLocation();
  //   const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  //   useEffect(() => {
  //     if (!isAuthenticated) {
  //       navigate("/login");
  //     }
  //   }, [isAuthenticated, navigate]);

  const {
    price = 0,
    theatreName = "",
    location = "",
    time = "",
    movieName = "",
  } = locationData.state || {};

  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Fetch seats
  const fetchSeats = async () => {
    try {
      const res = await api.get(`/user/shows/${showId}/seat-layout`);
      setSeats(res.data.data);
    } catch (error) {
      console.log("Error while fetching seats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [showId]);

  // Format time
  const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group seats by row
  const groupedSeats = seats.reduce((acc, seat) => {
    const row = seat.seatNumber[0];
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  // Sort seats
  Object.keys(groupedSeats).forEach((row) => {
    groupedSeats[row].sort((a, b) => {
      const numA = parseInt(a.seatNumber.slice(1));
      const numB = parseInt(b.seatNumber.slice(1));
      return numA - numB;
    });
  });

  // Toggle seat
  const toggleSeat = (seat) => {
    if (seat.status === "BOOKED") return;

    const exists = selectedSeats.find((s) => s._id === seat._id);

    //remove seat
    if (exists) {
      setSelectedSeats((prev) => prev.filter((s) => s._id !== seat._id));
    }
    //add seat with limit 10
    else {
      if (selectedSeats.length >= 10) {
        alert("Maximum 10 seats allowed");
        return;
      }
      setSelectedSeats((prev) => [...prev, seat]);
    }
  };

  const totalPrice = selectedSeats.length * price;

  const handleProceed = async()=>{
    try {
      await api.post("/user/seats/lock", {
        showId,
        seats: selectedSeats.map((s)=>s._id)
      })

      const res = await api.post("/user/booking-session", {
        showId,
        seats: selectedSeats.map((s)=>s._id)
      });

      const sessionId = res.data.data._id;
      // console.log(res.data.data)

      navigate("/checkout", {
        state:{
          sessionId,
          selectedSeats,
          movieName,
          theatreName,
          location,
          time,
          totalPrice,
          showId
        }
      })

    } catch (error) {
      alert("Some seats are no longer available");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading seats...
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 py-4 px-3 sm:py-6 sm:px-4">
    {/* HEADER */}
    <div className="max-w-4xl mx-auto mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
      {movieName && (
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
          {movieName}
        </h2>
      )}

      <p className="text-sm font-medium text-gray-800">{theatreName}</p>
      <p className="text-xs text-gray-500 mb-2">{location}</p>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
        <span className="text-sm text-gray-600">
          ⏰ {formatTime(time)}
        </span>

        <span className="text-sm font-semibold text-green-600">
          ₹{price} / seat
        </span>
      </div>
    </div>

    {/* SCREEN */}
    <div className="max-w-4xl mx-auto mb-6 sm:mb-10 text-center">
      <div className="h-2 sm:h-3 bg-gray-300 rounded-full mb-2"></div>
      <p className="text-xs sm:text-sm text-gray-500 tracking-wide">
        SCREEN THIS WAY
      </p>
    </div>

    {/* SEATS */}
    <div className="max-w-4xl mx-auto space-y-3 overflow-x-auto pb-4">
      {Object.entries(groupedSeats).map(([row, seats]) => (
        <div key={row} className="flex items-center gap-2 sm:gap-4 min-w-max">
          {/* Row Label */}
          <div className="w-5 sm:w-6 text-xs sm:text-sm font-semibold text-gray-600">
            {row}
          </div>

          {/* Seats */}
          <div className="flex gap-1.5 sm:gap-2 flex-nowrap">
            {seats.map((seat, index) => {
              const isSelected = selectedSeats.find(
                (s) => s._id === seat._id
              );

              return (
                <React.Fragment key={seat._id}>
                  {index === Math.ceil(seats.length / 2) && (
                    <div className="w-3 sm:w-6" />
                  )}

                  <button
                    onClick={() => toggleSeat(seat)}
                    disabled={
                      seat.status === "BOOKED" ||
                      seat.status === "LOCKED"
                    }
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-md text-[10px] sm:text-xs font-medium transition
                      ${
                        seat.status === "BOOKED"
                          ? "bg-gray-300 cursor-not-allowed"
                          : seat.status === "LOCKED"
                          ? "bg-yellow-200 text-yellow-800 cursor-not-allowed"
                          : isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                  >
                    {seat.seatNumber.slice(1)}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ))}
    </div>

    {/* LEGEND */}
    <div className="max-w-4xl mx-auto mt-6 sm:mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border rounded"></div>
        Available
      </div>

      <div className="flex items-center gap-2">
        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
        Selected
      </div>

      <div className="flex items-center gap-2">
        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
        BOOKED
      </div>
    </div>

    {/* BOTTOM BAR */}
    {selectedSeats.length > 0 && (
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        <div className="text-center sm:text-left">
          <p className="text-xs sm:text-sm text-gray-600">
            {selectedSeats.length} seats selected
          </p>
          <p className="font-semibold text-base sm:text-lg">
            ₹{totalPrice}
          </p>
        </div>

        <button
          onClick={() => handleProceed()}
          className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium"
        >
          Proceed
        </button>
      </div>
    )}
  </div>
);
}

export default SeatsLayout;
