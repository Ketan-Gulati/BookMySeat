// components/Loading.jsx
export default function Loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
      
      <div className="flex flex-col items-center gap-6">

        {/* Animated Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-300"></div>
          <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
        </div>

        {/* Text with pulse */}
        <p className="text-gray-700 text-lg font-semibold animate-pulse">
          Loading your experience...
        </p>

      </div>
    </div>
  );
}