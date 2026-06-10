"use client";

import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center pt-24 p-10">
      <div className="absolute inset-0 z-0">
        <img src="/Car.png" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0c29ee 0%, #302b63ee 50%, #24243eee 100%)" }}></div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}></div>
      </div>
      <div className="relative z-10 max-w-4xl w-full mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-white">Customer Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Book Your Vehicle */}
          <div
            onClick={() => router.push("/book-car")}
            className="cursor-pointer bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95 group"
          >
            {/* Modern car logo */}
            <div className="flex items-center justify-center mb-5">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">Book Your Vehicle</h2>
            <p className="text-gray-500 text-center text-sm">Find and book available cars instantly</p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* My Bookings */}
          <div
            onClick={() => router.push("/my-bookings")}
            className="cursor-pointer bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95 group"
          >
            {/* Modern bookings logo */}
            <div className="flex items-center justify-center mb-5">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">My Bookings</h2>
            <p className="text-gray-500 text-center text-sm">View and manage your ride history</p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-purple-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
