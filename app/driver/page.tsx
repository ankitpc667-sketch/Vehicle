"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AddVehicle() {
  const router = useRouter();
  const [driverName, setDriverName] = useState("");
  const [carName, setCarName] = useState("");
  const [carNo, setCarNo] = useState("");
  const [aadharNo, setAadharNo] = useState("");
  const [license, setLicense] = useState("");
  const [experience, setExperience] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [price, setPrice] = useState("");
  const [carPhoto, setCarPhoto] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [withDriver, setWithDriver] = useState(true);

  // Auth guard
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "driver") {
      router.push("/role-selection");
    }
    // Pre-fill driver name from logged-in user
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setDriverName(user.name || "");
    }
  }, [router]);

  // Load driver's own vehicles for preview
  const [myVehicles, setMyVehicles] = useState<any[]>([]);
  useEffect(() => {
    const fetchMyVehicles = async () => {
      try {
        const res = await api.get('/api/vehicles/my');
        const data = await res.json();
        if (data.success) setMyVehicles(data.vehicles);
      } catch (e) {
        console.error('Failed to load my vehicles', e);
      }
    };
    fetchMyVehicles();
  }, []);

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
      if (location.trim().length >= 3 && showLocationSuggestions) {
        fetchLocations(location).then(setLocationSuggestions);
      } else {
        setLocationSuggestions([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [location, showLocationSuggestions]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCarPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        carName,
        carNo,
        price,
        location,
        photo: photoPreview,
        withDriver,
        purpose,
        ...(withDriver
          ? { driverName, aadharNo, license, experience, phone }
          : {}),
      };

      const res = await api.post("/api/vehicles", payload);

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to add vehicle");
        return;
      }

      router.push("/my-vehicles");
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4">
      <div className="absolute inset-0 z-0">
        <img src="/Car.png" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0c29ee 0%, #302b63ee 50%, #24243eee 100%)" }}></div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}></div>
      </div>
      <div className="relative z-10 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-4xl">
          

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">Car Name</label>
                <input
                  type="text"
                  value={carName}
                  onChange={(e) => setCarName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g., Toyota Camry"
                  required
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-2 text-gray-700">Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => {
                    const newPurpose = e.target.value;
                    setPurpose(newPurpose);
                    // Reset withDriver to true if it's cab, otherwise let user choose if trip/event
                    if (newPurpose === "cab") {
                      setWithDriver(true);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="cab">Cab</option>
                  <option value="trip">Trip</option>
                  <option value="events">Event</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-2 text-gray-700">Car Number</label>
                <input
                  type="text"
                  value={carNo}
                  onChange={(e) => setCarNo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g., MH12AB1234"
                  required
                />
              </div>

              {(purpose === "trip" || purpose === "events") && (
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Driver Option</label>
                  <select
                    value={withDriver ? "with-driver" : "without-driver"}
                    onChange={(e) => setWithDriver(e.target.value === "with-driver")}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  >
                    <option value="with-driver">With Driver</option>
                    <option value="without-driver">Without Driver</option>
                  </select>
                </div>
              )}


              <div className={withDriver ? "md:col-span-1" : "md:col-span-2"}>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Price ({withDriver && purpose === "cab" ? "₹/km" : "₹/day"})
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder={withDriver && purpose === "cab" ? "Enter price per km" : "Enter price per day"}
                  min="0"
                  required
                />
              </div>

              {withDriver && (
                <div className="md:col-span-2 mt-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Driver & Identification Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Driver Name</label>
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g., Ramesh Kumar"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        maxLength={10}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Aadhar Number</label>
                      <input
                        type="text"
                        value={aadharNo}
                        onChange={(e) => setAadharNo(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="12 digit Aadhar"
                        maxLength={12}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">License Number</label>
                      <input
                        type="text"
                        value={license}
                        onChange={(e) => setLicense(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Experience (Years)</label>
                      <input
                        type="number"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="md:col-span-2 relative">
                <label className="block text-sm font-medium mb-2 text-gray-700">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowLocationSuggestions(false), 200)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Enter your location (min 3 chars)"
                  required
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-100 rounded-xl shadow-2xl mt-2 max-h-48 overflow-y-auto">
                    {locationSuggestions.map((loc, index) => (
                      <div
                        key={index}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setLocation(loc.display_name);
                          setShowLocationSuggestions(false);
                        }}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                      >
                        {loc.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vehicle Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Vehicle preview"
                  className="mt-2 w-full h-40 object-contain rounded-lg bg-gray-100"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Adding Vehicle..." : "Add Vehicle"}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
