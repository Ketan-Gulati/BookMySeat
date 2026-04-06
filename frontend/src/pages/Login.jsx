import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/auth.slice.js";
import { useNavigate } from "react-router-dom";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(loginUser(formData));

    if (result.meta.requestStatus === "fulfilled") {
      navigate("/");
    } else {
      alert("Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-gray-900 to-gray-800">

      {/* Card */}
      <div className="w-[90%] max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-fadeIn">

        {/* Logo / Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          BookMySeat 🎬
        </h1>

        <p className="text-gray-300 text-center mb-6">
          Welcome back! Login to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none border border-white/20 focus:border-white transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none border border-white/20 focus:border-white transition"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.03] hover:bg-gray-200 transition-all duration-200"
          >
            Login
          </button>

        </form>

        {/* Footer */}
        <p className="text-gray-400 text-center mt-6 text-sm">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-white cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;