// components/LoginPopup.jsx
import { useNavigate } from "react-router-dom";

export default function LoginPopup() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">

      {/* Background Blur + Fade */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-[90%] max-w-md text-center animate-scaleIn">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100">
            <svg
              className="w-7 h-7 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 11c1.656 0 3-1.567 3-3.5S13.656 4 12 4 9 5.567 9 7.5 10.344 11 12 11z" />
              <path d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2">
          Login Required
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500 mb-6">
          Please login to continue your booking experience
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">

          <button
            onClick={() => navigate("/login")}
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:scale-[1.02] hover:bg-gray-900 transition-all duration-200"
          >
            Continue to Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-full border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200"
          >
            Create Account
          </button>

        </div>

      </div>
    </div>
  );
}