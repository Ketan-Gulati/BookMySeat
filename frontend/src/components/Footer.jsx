export default function Footer() {
  return (
    <footer className="bg-[#1c1c1c] text-gray-400 mt-16">

      {/* TOP STRIP */}
      <div className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-sm text-center md:text-left">
            List your shows & events on BookMySeat
          </p>

          <button className="bg-red-500 hover:bg-red-600 text-white text-sm px-5 py-2 rounded-md transition">
            Contact Today
          </button>

        </div>
      </div>

      {/* MIDDLE GRID */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">

        {/* Column 1 */}
        <div>
          <h3 className="text-white font-semibold mb-3">Movies</h3>
          <ul className="space-y-2">
            <li className="hover:text-white cursor-pointer">Now Showing</li>
            <li className="hover:text-white cursor-pointer">Coming Soon</li>
            <li className="hover:text-white cursor-pointer">Top Rated</li>
          </ul>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="text-white font-semibold mb-3">Events</h3>
          <ul className="space-y-2">
            <li className="hover:text-white cursor-pointer">Concerts</li>
            <li className="hover:text-white cursor-pointer">Comedy Shows</li>
            <li className="hover:text-white cursor-pointer">Workshops</li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className="text-white font-semibold mb-3">Plays</h3>
          <ul className="space-y-2">
            <li className="hover:text-white cursor-pointer">Theatre</li>
            <li className="hover:text-white cursor-pointer">Drama</li>
            <li className="hover:text-white cursor-pointer">Musicals</li>
          </ul>
        </div>

        {/* Column 4 */}
        <div>
          <h3 className="text-white font-semibold mb-3">Sports</h3>
          <ul className="space-y-2">
            <li className="hover:text-white cursor-pointer">Cricket</li>
            <li className="hover:text-white cursor-pointer">Football</li>
            <li className="hover:text-white cursor-pointer">Badminton</li>
          </ul>
        </div>

      </div>

      {/* SOCIAL + LOGO */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center gap-6">

          {/* Logo */}
          <h2 className="text-white text-xl font-semibold tracking-tight">
            Book<span className="bg-red-500 text-white px-1 rounded">My</span>Seat
          </h2>

          {/* Social Icons */}
          <div className="flex gap-4">

            {["F", "T", "I", "Y"].map((item, i) => (
              <div
                key={i}
                className="w-9 h-9 flex items-center justify-center border border-gray-600 rounded-full hover:bg-red-500 hover:border-red-500 transition cursor-pointer text-sm"
              >
                {item}
              </div>
            ))}

          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-500 text-center max-w-xl">
            Copyright © {new Date().getFullYear()} BookMySeat. All Rights Reserved.
            The content and images used on this site are for demonstration purposes only.
          </p>

        </div>
      </div>

    </footer>
  );
}