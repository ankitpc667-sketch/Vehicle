"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export default function BookCar() {
  const router = useRouter();
  const [purpose, setPurpose] = useState("");
  const [withDriver, setWithDriver] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userLicense, setUserLicense] = useState("");
  const [userAadhar, setUserAadhar] = useState("");

  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropSuggestions, setShowDropSuggestions] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<any[]>([]);
  const [pickupCoords, setPickupCoords] = useState<{ lat: string; lon: string } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: string; lon: string } | null>(null);

  // is this a "without driver" self-drive booking?
  const isSelfDrive =
    (purpose === "trip" || purpose === "events") && withDriver === "without-driver";

  // Auth guard — only customers
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "customer") {
      router.push("/role-selection");
    }
  }, [router]);

  const fetchLocations = async (query: string) => {
    if (!query || query.trim().length < 3) return [];
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
      );
      return await res.json();
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pickupLocation.trim().length >= 3 && showPickupSuggestions) {
        fetchLocations(pickupLocation).then(setPickupSuggestions);
      } else {
        setPickupSuggestions([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [pickupLocation, showPickupSuggestions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dropLocation.trim().length >= 3 && showDropSuggestions) {
        fetchLocations(dropLocation).then(setDropSuggestions);
      } else {
        setDropSuggestions([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [dropLocation, showDropSuggestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // For cab/with-driver trips: require pickup/drop coords
    if (!isSelfDrive) {
      if (pickupLocation.trim().toLowerCase() === dropLocation.trim().toLowerCase()) {
        alert("Pickup and Drop locations cannot be the same!");
        return;
      }
      if (!pickupCoords || !dropCoords) {
        alert("Please select valid coordinates from the suggestions for both Pickup and Drop locations.");
        return;
      }
    }

    localStorage.setItem(
      "searchData",
      JSON.stringify({
        purpose,
        pickupLocation: pickupLocation,
        pickupCoords: pickupCoords,
        dropLocation: isSelfDrive ? "" : dropLocation,
        dropCoords: isSelfDrive ? null : dropCoords,
        bookingDate,
        pickupTime: isSelfDrive ? "" : pickupTime,
        withDriver: purpose === "trip" || purpose === "events" ? withDriver : "",
        userName,
        userPhone,
        userLicense: isSelfDrive ? userLicense : "",
        userAadhar: userAadhar,
      })
    );

    router.push("/available-vehicles");
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-10">
      <div className="absolute inset-0 z-0">
        <img src="/Car.png" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0c29ee 0%, #302b63ee 50%, #24243eee 100%)" }}></div>
      </div>
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-10 blur-3xl" style={{ background: "radial-gradient(ellipse, #3b82f6 0%, transparent 70%)" }}></div>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-white">Book Your Car</h1>
          <button
            onClick={() => router.push("/my-bookings")}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            My Bookings
          </button>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Row 1: Purpose + Driver Option */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => { setPurpose(e.target.value); setWithDriver(""); }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="cab">Cab</option>
                  <option value="trip">Trip</option>
                  <option value="events">Event</option>
                </select>
              </div>

              {(purpose === "trip" || purpose === "events") && (
                <div>
                  <label className="block text-sm font-medium mb-2">Driver Option</label>
                  <select
                    value={withDriver}
                    onChange={(e) => { setWithDriver(e.target.value); }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Option</option>
                    <option value="with-driver">With Driver</option>
                    <option value="without-driver">Without Driver</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Booking Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Customer Details — always shown */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  Your Details
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="+91XXXXXXXXXX"
                    required
                  />
                </div>
                {isSelfDrive && (
                  <div>
                    <label className="block text-sm font-medium mb-2">License Number</label>
                    <input
                      type="text"
                      value={userLicense}
                      onChange={(e) => setUserLicense(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter license number"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Aadhaar Number</label>
                  <input
                    type="text"
                    value={userAadhar}
                    onChange={(e) => setUserAadhar(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="12-digit Aadhaar"
                    maxLength={12}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pickup Location - Always Shown */}
              <div className={`relative ${isSelfDrive ? "md:col-span-3" : "md:col-span-1"}`}>
                <label className="block text-sm font-medium mb-2">Pickup Location</label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => {
                    setPickupLocation(e.target.value);
                    setPickupCoords(null);
                    setShowPickupSuggestions(true);
                  }}
                  onFocus={() => setShowPickupSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter pickup location (min 3 chars)"
                  required
                />
                {showPickupSuggestions && pickupSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {pickupSuggestions.map((loc, index) => (
                      <div
                        key={index}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setPickupLocation(loc.display_name);
                          setPickupCoords({ lat: loc.lat, lon: loc.lon });
                          setShowPickupSuggestions(false);
                        }}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                      >
                        {loc.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drop Location - Hidden for Self Drive */}
              {!isSelfDrive && (
                <div className="relative">
                  <label className="block text-sm font-medium mb-2">Drop Location</label>
                  <input
                    type="text"
                    value={dropLocation}
                    onChange={(e) => {
                      setDropLocation(e.target.value);
                      setDropCoords(null);
                      setShowDropSuggestions(true);
                    }}
                    onFocus={() => setShowDropSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowDropSuggestions(false), 200)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter drop location (min 3 chars)"
                    required={!isSelfDrive}
                  />
                  {showDropSuggestions && dropSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {dropSuggestions.map((loc, index) => (
                        <div
                          key={index}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setDropLocation(loc.display_name);
                            setDropCoords({ lat: loc.lat, lon: loc.lon });
                            setShowDropSuggestions(false);
                          }}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                        >
                          {loc.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pickup Time - Hidden for Self Drive */}
              {!isSelfDrive && (
                <div>
                  <label className="block text-sm font-medium mb-2">Pickup Time</label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required={!isSelfDrive}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="w-11/12 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Search Available Vehicles
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
