"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function shouldHide(booking: any): boolean {
  const now = Date.now();
  const bookingDate = new Date(booking.bookingDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);
  const updatedAt = booking.updatedAt ? new Date(booking.updatedAt).getTime() : 0;
  const hrs24 = 24 * 60 * 60 * 1000;
  if (booking.status === "confirmed" || booking.status === "rejected") {
    return updatedAt > 0 && (now - updatedAt) > hrs24;
  }
  if (bookingDate.getTime() === today.getTime()) {
    return (now - new Date(booking.bookingDate).getTime()) > hrs24;
  }
  return false;
}

export default function MyBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusPopup, setStatusPopup] = useState<{ status: string; carName: string } | null>(null);
  const prevStatusRef = useRef<Record<string, string>>({});
  const initialLoadRef = useRef(true);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "customer" && role !== "driver") {
      router.push("/role-selection");
      return;
    }
    loadBookings();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(loadBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadBookings = async () => {
    try {
      const res = await api.get("/api/bookings");
      const data = await res.json();
      if (data.success) {
        const filtered = data.bookings.filter(
          (b: any) => b.status !== "cancelled" && !shouldHide(b)
        );

        // Only detect status changes after initial load
        if (!initialLoadRef.current) {
          filtered.forEach((b: any) => {
            const prev = prevStatusRef.current[b._id];
            if (prev === "pending" && (b.status === "confirmed" || b.status === "rejected")) {
              setStatusPopup({ status: b.status, carName: b.vehicleId?.carName || "your vehicle" });
            }
          });
        }

        const newMap: Record<string, string> = {};
        filtered.forEach((b: any) => { newMap[b._id] = b.status; });
        prevStatusRef.current = newMap;
        initialLoadRef.current = false;
        setBookings(filtered);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await api.delete(`/api/bookings/${bookingId}`);
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        alert(data.message);
      }
    } catch {
      alert("Network error.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-10">
      <div className="absolute inset-0 z-0">
        <img src="/Car.png" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0c29ee 0%, #302b63ee 50%, #24243eee 100%)" }}></div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}></div>
      </div>

      {/* Driver Response Popup */}
      {statusPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className={`p-6 ${statusPopup.status === "confirmed" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
              <div className="text-center">
                <div className="text-5xl mb-3">{statusPopup.status === "confirmed" ? "🎉" : "😔"}</div>
                <h3 className="text-2xl font-extrabold text-white">
                  {statusPopup.status === "confirmed" ? "Booking Confirmed!" : "Booking Rejected"}
                </h3>
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-700 mb-6">
                {statusPopup.status === "confirmed"
                  ? `Your booking for ${statusPopup.carName} has been confirmed by the driver. Have a great ride!`
                  : `The driver has rejected your booking for ${statusPopup.carName}. Please find another vehicle.`}
              </p>
              <button
                onClick={() => setStatusPopup(null)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:scale-105 transition-all shadow-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-white">My Bookings</h1>
          <button
            onClick={() => router.push("/book-car")}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Book Your Vehicle
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">{error}</div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No bookings yet</p>
            <button
              onClick={() => router.push("/book-car")}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-all"
            >
              Book a Car Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const vehicle = booking.vehicleId;
              return (
                <div key={booking._id} className={`bg-white p-6 rounded-2xl shadow-lg border-l-4 ${booking.status === "confirmed" ? "border-green-500" :
                    booking.status === "rejected" ? "border-red-500" :
                      booking.status === "pending" && booking.expiresAt && new Date(booking.expiresAt) < new Date() ? "border-orange-400" :
                        "border-yellow-400"
                  }`}>
                  <div className="flex gap-6">
                    {vehicle?.photo && (
                      <div className="w-48 h-32 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={vehicle.photo} alt={vehicle.carName} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">{vehicle?.carName || "Vehicle"}</h3>
                          <p className="text-gray-600">{vehicle?.carNo}</p>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                            booking.status === "pending" && booking.expiresAt && new Date(booking.expiresAt) < new Date() ? "bg-orange-100 text-orange-700" :
                              booking.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                booking.status === "rejected" ? "bg-red-100 text-red-600" :
                                  "bg-gray-100 text-gray-500"
                          }`}>
                          {booking.status === "pending" && booking.expiresAt && new Date(booking.expiresAt) < new Date() ? "⏰ Expired" :
                            booking.status === "pending" ? "⏳ Waiting for Driver" :
                              booking.status === "confirmed" ? "✅ Accepted by Driver" :
                                booking.status === "rejected" ? "❌ Rejected by Driver" :
                                  booking.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Driver response message */}
                      {booking.status === "confirmed" && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
                          🎉 The driver has accepted your booking. Get ready for your ride!
                        </div>
                      )}
                      {booking.status === "rejected" && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                          😔 The driver has rejected this booking. Please book another vehicle.
                        </div>
                      )}
                      {booking.status === "pending" && booking.expiresAt && new Date(booking.expiresAt) < new Date() && (
                        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm font-medium">
                          ⏰ Driver did not respond within time. Please find another vehicle.
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div><p className="text-sm text-gray-500">Purpose</p><p className="font-semibold capitalize">{booking.purpose}</p></div>
                        <div><p className="text-sm text-gray-500">Booking Date</p><p className="font-semibold">{booking.bookingDate}</p></div>
                        <div><p className="text-sm text-gray-500">Driver Option</p><p className="font-semibold capitalize">{booking.withDriver?.replace("-", " ") || "With Driver"}</p></div>
                      </div>

                      {booking.withDriver === "without-driver" ? (
                        <div className="border-t pt-4 mb-4">
                          <h4 className="font-bold mb-2 text-blue-600">Pickup your vehicle from</h4>
                          <p className="text-sm font-semibold text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-100 italic">
                            {vehicle?.location || "Location not specified"}
                          </p>
                        </div>
                      ) : (
                        <div className="border-t pt-4 mb-4">
                          <h4 className="font-bold mb-2">Driver Details</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p><strong>Name:</strong> {vehicle?.driverName}</p>
                            <p><strong>Phone:</strong> {vehicle?.phone}</p>
                            <p><strong>License:</strong> {vehicle?.license}</p>
                            <p><strong>Experience:</strong> {vehicle?.experience} years</p>
                          </div>
                        </div>
                      )}

                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 transition-all duration-300"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
