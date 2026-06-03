"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function DriverDashboard() {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [newBookingPopup, setNewBookingPopup] = useState<any | null>(null);
  const popupShownRef = useRef(false);

  useEffect(() => {
    checkPendingBookings();
    const interval = setInterval(checkPendingBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkPendingBookings = async () => {
    try {
      const res = await api.get("/api/bookings/driver");
      const data = await res.json();
      if (data.success) {
        // Only consider truly pending (not expired) bookings
        const pending = data.bookings.filter((b: any) =>
          b.status === "pending" && new Date(b.expiresAt) > new Date()
        );
        setPendingCount(pending.length);

        if (pending.length > 0 && !popupShownRef.current) {
          // Get seen IDs from localStorage
          const seen: string[] = JSON.parse(localStorage.getItem("driverSeenBookings") || "[]");
          const unseen = pending.find((b: any) => !seen.includes(b._id));
          if (unseen) {
            popupShownRef.current = true;
            setNewBookingPopup(unseen);
            // Save as seen
            localStorage.setItem("driverSeenBookings", JSON.stringify([...seen, unseen._id]));
          }
        }

        // Clean up seen list — remove IDs no longer in bookings at all
        const allIds = data.bookings.map((b: any) => b._id);
        const seen: string[] = JSON.parse(localStorage.getItem("driverSeenBookings") || "[]");
        localStorage.setItem("driverSeenBookings", JSON.stringify(seen.filter((id) => allIds.includes(id))));
      }
    } catch { }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center pt-24 p-10">
      <div className="absolute inset-0 z-0">
        <img src="/Car.png" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0c29ee 0%, #302b63ee 50%, #24243eee 100%)" }}></div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}></div>
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }}></div>
      </div>

      {/* New Booking Popup */}
      {newBookingPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">🔔</div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">New Booking Request!</h3>
                  <p className="text-blue-100 text-sm">A customer wants to book your vehicle</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-blue-50 rounded-xl p-4 text-sm space-y-2">
                <p><strong>Vehicle:</strong> {newBookingPopup.vehicleId?.carName || "—"}</p>
                <p><strong>Customer:</strong> {newBookingPopup.customerName || newBookingPopup.customerId?.name || "—"}</p>
                <p><strong>Date:</strong> {newBookingPopup.bookingDate}</p>
                <p><strong>Purpose:</strong> {newBookingPopup.purpose}</p>
                {newBookingPopup.pickupLocation && <p><strong>From:</strong> {newBookingPopup.pickupLocation}</p>}
                {newBookingPopup.dropLocation && <p><strong>To:</strong> {newBookingPopup.dropLocation}</p>}
              </div>
              <p className="text-orange-600 font-semibold text-sm text-center">⏱ You have 5 minutes to respond!</p>
              <button
                onClick={() => { setNewBookingPopup(null); router.push("/driver-bookings"); }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
              >
                Go to View Bookings →
              </button>
              <button
                onClick={() => setNewBookingPopup(null)}
                className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-6xl w-full mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Driver Dashboard
          </h1>
          <p className="text-gray-300 text-lg">Manage your vehicles and grow your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div
            onClick={() => router.push("/driver")}
            className="cursor-pointer bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-blue-100 hover:scale-105 active:scale-95"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-5 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Add Vehicle</h2>
            <p className="text-gray-600 text-center">Register your car for rental and start earning</p>
          </div>

          <div
            onClick={() => router.push("/my-vehicles")}
            className="cursor-pointer bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-purple-100 hover:scale-105 active:scale-95"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-5 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">My Vehicles</h2>
            <p className="text-gray-600 text-center">View and manage your registered cars</p>
          </div>

          <div
            onClick={() => router.push("/driver-bookings")}
            className="cursor-pointer bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-green-100 hover:scale-105 active:scale-95 relative"
          >
            {pendingCount > 0 && (
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
                {pendingCount}
              </div>
            )}
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-5 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">View Bookings</h2>
            <p className="text-gray-600 text-center">See all bookings made for your vehicles</p>
          </div>
        </div>
      </div>
    </div>
  );
}
