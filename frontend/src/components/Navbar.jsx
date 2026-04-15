import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/auth.slice";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  //auth state to use for admin login
  const isAdmin = user?.role == "ADMIN" ? true : false;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* MAIN NAVBAR */}
      <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center text-xl md:text-2xl font-semibold"
          >
            <span>Book</span>
            <span className="bg-red-500 text-white px-1.5 mx-1 rounded-md">
              My
            </span>
            <span>Seat</span>
          </div>

          {/* SEARCH */}
          <div className="flex-1 max-w-2xl mx-6 hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 rounded-full bg-gray-100 focus:ring-2 focus:ring-red-400 outline-none"
            />
          </div>

          {/* RIGHT */}
          <div className="relative flex items-center gap-5">
            {/* Location */}
            <div className="hidden sm:flex text-sm text-gray-600">📍 Delhi</div>

            {/* admin dashboard button */}
            {isAdmin && (
              <button
                onClick={() => navigate("/admin-dashboard")}
                className="bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-gray-800 transition"
              >
                Dashboard
              </button>
            )}

            {/* AUTH */}
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-full"></div>
            ) : user ? (
              <div className="relative">
                {/* Trigger */}
                <div
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-sm font-medium">
                    Hi, {user.fullName}
                  </span>
                </div>

                {/* Dropdown */}
                {open && (
                  <div className="absolute right-0 mt-3 w-64 bg-white shadow-lg rounded-xl border p-4 z-50">
                    <p className="text-sm font-semibold text-gray-800">
                      {user.fullName}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">{user.email}</p>

                    <p className="text-xs text-gray-400 mt-1">
                      @{user.userName}
                    </p>

                    <hr className="my-3" />

                    {/* access user bookings */}
                    <button
                      onClick={() => {
                        navigate("/my-bookings");
                        setOpen(false);
                      }}
                      className="w-full text-left text-gray-700 font-medium hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      My Bookings
                    </button>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-red-500 font-medium hover:bg-red-50 px-2 py-1 rounded mt-2"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-red-500 text-white px-4 py-2 rounded-full cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
