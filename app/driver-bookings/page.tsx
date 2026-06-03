"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// Calculate distance using OSRM
async function calcDistance(pickupCoords: any, dropCoords: any): Promise<number | null> {
  if (!pickupCoords?.lat || !dropCoords?.lat) return null;
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lon},${pickupCoords.lat};${dropCoords.lon},${dropCoords.lat}?overview=false`
    );
    const data = await res.json();
    if (data.routes?.length > 0) return Number((data.routes[0].distance / 1000).toFixed(1));
    return null;
  } catch { return null; }
}

function formatTime(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

function DistanceInfo({ booking }: { booking: any }) {
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (booking.pickupCoords && booking.dropCoords) {
      calcDistance(booking.pickupCoords, booking.dropCoords).then((d) => {
        setDistance(d);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [booking._id]);

  if (!booking.pickupCoords?.lat || !booking.dropCoords?.lat) return null;

  const expectedMins = distance !== null ? distance * 5 : null;

  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      <div className="bg-blue-50 p-3 rounded-xl">
        <p className="text-gray-400 font-medium text-xs mb-1">Total Distance</p>
        <p className="font-bold text-blue-700 text-sm">
          {loading ? "Calculating..." : distance !== null ? `${distance} km` : "N/A"}
        </p>
      </div>
      <div className="bg-purple-50 p-3 rounded-xl">
        <p className="text-gray-400 font-medium text-xs mb-1">Expected Time</p>
        <p className="font-bold text-purple-700 text-sm">
          {loading ? "Calculating..." : expectedMins !== null ? formatTime(expectedMins) : "N/A"}
        </p>
      </div>
    </div>
  );
}

function Countdown({ expiresAt, onExpired }: { expiresAt: string; onExpired: () => void }) {
  const [secs, setSecs] = useState(() => {
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    if (secs <= 0) { onExpired(); return; }
    const t = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) { clearInterval(t); onExpired(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const urgent = secs <= 60;

  return (
    <span className={`font-mono font-bold text-sm ${urgent ? "text-red-600 animate-pulse" : "text-orange-600"}`}>
      ⏱ {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}

// Returns true if booking should be hidden (24hrs after bookingDate for same-day, or 24hrs after updatedAt for responded)
function shouldHide(booking: any): boolean {
  const now = Date.now();
  const bookingDate = new Date(booking.bookingDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);

  const updatedAt = booking.updatedAt ? new Date(booking.updatedAt).getTime() : 0;
  const hrs24 = 24 * 60 * 60 * 1000;

  // If responded (confirmed/rejected), hide after 24hrs from response
  if (booking.status === "confirmed" || booking.status === "rejected") {
    return updatedAt > 0 && (now - updatedAt) > hrs24;
  }
  // If same-day booking, hide after 24hrs from booking date
  if (bookingDate.getTime() === today.getTime()) {
    const bookingDateMs = new Date(booking.bookingDate).getTime();
    return (now - bookingDateMs) > hrs24;
  }
  return false;
}

export default function DriverBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [responding, setResponding] = useState<string | null>(null);
  const [newBookingPopup, setNewBookingPopup] = useState<any | null>(null);
  const prevBookingIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "driver") { router.push("/role-selection"); return; }
    loadBookings();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(loadBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadBookings = async () => {
    try {
      const res = await api.get("/api/bookings/driver");
      const data = await res.json();
      if (data.success) {
        const filtered = data.bookings.filter((b: any) => !shouldHide(b));
        // Detect new pending bookings
        const newPending = filtered.filter(
          (b: any) => b.status === "pending" && !prevBookingIdsRef.current.has(b._id)
        );
        if (newPending.length > 0 && prevBookingIdsRef.current.size > 0) {
          setNewBookingPopup(newPending[0]);
        }
        prevBookingIdsRef.current = new Set(filtered.map((b: any) => b._id));
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

  const handleExpired = useCallback(async () => {
    try {
      await api.post("/api/bookings/expire", {});
      await loadBookings();
    } catch { }
  }, []);

  const handleRespond = async (bookingId: string, action: "accept" | "reject") => {
    setResponding(bookingId);
    try {
      const res = await api.patch(`/api/bookings/${bookingId}/respond`, { action });
      const data = await res.json();
      if (data.success) {
        await loadBookings();
      } else {
        alert(data.message);
        await loadBookings();
      }
    } catch {
      alert("Network error.");
    } finally {
      setResponding(null);
    }
  };

  const statusBadge = (booking: any) => {
    if (booking.status === "pending") {
      const expired = booking.expiresAt && new Date(booking.expiresAt) < new Date();
      if (expired) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">EXPIRED</span>;
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 animate-pulse">⏳ WAITING</span>;
    }
    if (booking.status === "confirmed") return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">✅ ACCEPTED</span>;
    if (booking.status === "rejected") return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">❌ REJECTED</span>;
    if (booking.status === "cancelled") return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">🚫 CANCELLED BY CUSTOMER</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">{booking.status.toUpperCase()}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-6">
      <div className="absolute inset-0 z-0">
        <img src="/Car.png" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0c29ee 0%, #302b63ee 50%, #24243eee 100%)" }}></div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }}></div>
      </div>

      {/* New Booking Popup */}
      {newBookingPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-once">
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
                onClick={() => setNewBookingPopup(null)}
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

      <div className="relative z-10 max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Vehicle Bookings
          </h1>
          <p className="text-gray-300 mt-1">Customers who have booked your vehicles</p>
        </div>
        <button
          onClick={() => router.push("/driver-dashboard")}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full shadow hover:shadow-lg hover:scale-105 transition-all"
        >
          ← Dashboard
        </button>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">{error}</div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto">
        {bookings.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm p-20 rounded-3xl shadow-xl text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-xl text-gray-500">No bookings yet</p>
            <p className="text-sm text-gray-400 mt-2">When customers book your vehicles, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const vehicle = booking.vehicleId;
              const customer = booking.customerId;
              const isPending = booking.status === "pending";
              const isExpired = isPending && booking.expiresAt && new Date(booking.expiresAt) < new Date();

              return (
                <div key={booking._id} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-100">
                  <div className="flex justify-end mb-3">
                    {statusBadge(booking)}
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    {vehicle?.photo && (
                      <img src={vehicle.photo} alt={vehicle?.carName} className="w-full md:w-48 h-32 object-cover rounded-2xl" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{vehicle?.carName || "Vehicle"}</h3>
                          <p className="text-gray-500 text-sm">{vehicle?.carNo}</p>
                        </div>
                        {isPending && !isExpired && booking.expiresAt && (
                          <Countdown expiresAt={booking.expiresAt} onExpired={handleExpired} />
                        )}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl mb-4">
                        <h4 className="font-bold text-blue-800 mb-2">👤 Customer Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p><strong>Name:</strong> {customer?.name || booking.customerName || "—"}</p>
                          <p><strong>Email:</strong> {customer?.email || "—"}</p>
                          {booking.customerPhone && <p><strong>Phone:</strong> {booking.customerPhone}</p>}
                          {booking.customerLicense && <p><strong>License:</strong> {booking.customerLicense}</p>}
                          {booking.customerAadhar && <p><strong>Aadhar:</strong> {booking.customerAadhar}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 mb-4">
                        <div><p className="text-gray-400 font-medium">Purpose</p><p className="font-semibold capitalize">{booking.purpose}</p></div>
                        <div><p className="text-gray-400 font-medium">Date</p><p className="font-semibold">{booking.bookingDate}</p></div>
                        {booking.pickupTime && <div><p className="text-gray-400 font-medium">Pickup Time</p><p className="font-semibold">{booking.pickupTime}</p></div>}
                        {booking.pickupLocation && <div><p className="text-gray-400 font-medium">Pickup</p><p className="font-semibold text-xs leading-snug">{booking.pickupLocation}</p></div>}
                        {booking.dropLocation && <div><p className="text-gray-400 font-medium">Drop</p><p className="font-semibold text-xs leading-snug">{booking.dropLocation}</p></div>}
                        {booking.withDriver && (
                          <div><p className="text-gray-400 font-medium">Driver Option</p><p className="font-semibold capitalize">{booking.withDriver === "with-driver" ? "With Driver" : "Without Driver"}</p></div>
                        )}
                      </div>

                      {/* Distance & Expected Time for cab and trip */}
                      {(booking.purpose === "cab" || booking.purpose === "trip") && (
                        <DistanceInfo booking={booking} />
                      )}

                      {isPending && !isExpired && (
                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={() => handleRespond(booking._id, "accept")}
                            disabled={responding === booking._id}
                            className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {responding === booking._id ? "..." : "✅ Accept"}
                          </button>
                          <button
                            onClick={() => handleRespond(booking._id, "reject")}
                            disabled={responding === booking._id}
                            className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {responding === booking._id ? "..." : "❌ Reject"}
                          </button>
                        </div>
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
