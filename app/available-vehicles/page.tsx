"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AvailableVehicles() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [searchData, setSearchData] = useState<any>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"none" | "min-max" | "max-min">("none");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "customer") {
      router.push("/role-selection");
      return;
    }

    const savedSearchData = localStorage.getItem("searchData");
    if (!savedSearchData) {
      router.push("/book-car");
      return;
    }

    const parsedData = JSON.parse(savedSearchData);
    setSearchData(parsedData);

    if (parsedData.purpose === "cab" && parsedData.pickupCoords && parsedData.dropCoords) {
      setIsCalculating(true);
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${parsedData.pickupCoords.lon},${parsedData.pickupCoords.lat};${parsedData.dropCoords.lon},${parsedData.dropCoords.lat}?overview=false`
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.routes?.length > 0) {
            setCalculatedDistance(Number((data.routes[0].distance / 1000).toFixed(1)));
          } else {
            setCalculatedDistance(0);
          }
        })
        .catch(() => setCalculatedDistance(0))
        .finally(() => setIsCalculating(false));
    }

    const withDriverQuery = (parsedData.purpose !== "cab" && parsedData.withDriver)
      ? `&withDriver=${parsedData.withDriver === "with-driver" ? "true" : "false"}`
      : "";
    const pickupLocQuery = parsedData.pickupLocation
      ? `&pickupLocation=${encodeURIComponent(parsedData.pickupLocation)}`
      : "";

    api.get(`/api/vehicles?purpose=${parsedData.purpose}${withDriverQuery}${pickupLocQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVehicles(data.vehicles);
          setFilteredVehicles(data.vehicles);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (sortOrder === "none") return;
    const sorted = [...filteredVehicles].sort((a, b) => {
      if (sortOrder === "min-max") return a.price - b.price;
      return b.price - a.price;
    });
    setFilteredVehicles(sorted);
  }, [sortOrder]);

  const handleBooking = async (vehicle: any) => {
    setBookingLoading(vehicle._id);
    try {
      const res = await api.post("/api/bookings", {
        vehicleId: vehicle._id,
        purpose: searchData.purpose,
        pickupLocation: searchData.pickupLocation || "",
        dropLocation: searchData.dropLocation || "",
        pickupCoords: searchData.pickupCoords,
        dropCoords: searchData.dropCoords,
        bookingDate: searchData.bookingDate,
        pickupTime: searchData.pickupTime || "",
        withDriver: searchData.withDriver,
        customerName: searchData.userName,
        customerPhone: searchData.userPhone,
        customerLicense: searchData.userLicense,
        customerAadhar: searchData.userAadhar,
      });

      const data = await res.json();
      if (data.success) {
        router.push("/my-bookings");
      } else {
        alert(data.message || "Booking failed.");
      }
    } catch {
      alert("Network error. Is the backend running?");
    } finally {
      setBookingLoading(null);
    }
  };

  const priceLabel = (vehicle: any) => {
    if (vehicle.purpose === "cab") return `₹${vehicle.price}/km`;
    return `₹${vehicle.price}/day`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #e0f2fe 100%)" }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Finding available vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/Car.png" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0c29ee 0%, #302b63ee 50%, #24243eee 100%)" }}></div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}></div>
      </div>

      <div className="relative z-10 p-6 md:p-10 pt-4">
        <div className="max-w-[1600px] mx-auto px-4">

          {/* Search Summary Card */}
          {searchData && (
            <div className="bg-white p-8 rounded-xl shadow-lg mb-10">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Search Result for</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div><p className="text-sm font-bold text-gray-700 mb-1">Date</p><p className="text-gray-600">{searchData.bookingDate}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div><p className="text-sm font-bold text-gray-700 mb-1">Purpose</p><p className="text-gray-600">{searchData.purpose === "cab" ? "Cab" : searchData.purpose === "trip" ? "Trip" : "Event"}</p></div>
                </div>
                {searchData.pickupLocation && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div><p className="text-sm font-bold text-gray-700 mb-1">Pickup</p><p className="text-gray-600 text-sm line-clamp-2">{searchData.pickupLocation}</p></div>
                  </div>
                )}
                {searchData.dropLocation && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div><p className="text-sm font-bold text-gray-700 mb-1">Drop</p><p className="text-gray-600 text-sm line-clamp-2">{searchData.dropLocation}</p></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Header: Title + Sort */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Available Vehicles
              </h1>
              <p className="text-gray-300">Choose your perfect ride!</p>
            </div>

            <div className="flex items-end gap-4">
              <div className="relative w-full md:w-64">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Sort by Price</label>
                <div className="relative group">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full bg-white border-2 border-blue-100 text-gray-700 py-3 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-md hover:shadow-lg transition-all appearance-none text-sm font-medium cursor-pointer"
                  >
                    <option value="none">Default Order</option>
                    <option value="min-max">Price: Min to Max</option>
                    <option value="max-min">Price: Max to Min</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-600 group-hover:scale-110 transition-transform">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm p-20 rounded-2xl shadow-lg text-center">
              <p className="text-xl text-gray-500">No vehicles available for the given pickup location</p>
              <p className="text-sm text-gray-400 mt-2">
                {searchData?.pickupLocation
                  ? `No vehicles found near "${searchData.pickupLocation}". Try a different location.`
                  : "Please try a different purpose or check back later"}
              </p>
              <button onClick={() => router.push("/book-car")} className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-all">
                Back to Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-10">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle._id} className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                  {vehicle.photo && (
                    <div className="relative h-64 bg-slate-50 flex items-center justify-center p-2">
                      <img src={vehicle.photo} alt={vehicle.carName} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{vehicle.carName}</h3>
                        {vehicle.carNo && <p className="text-gray-500 font-medium text-sm mt-1">{vehicle.carNo}</p>}
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-emerald-600 block">{priceLabel(vehicle)}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-gray-600 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <strong>Purpose:</strong> {vehicle.purpose === "cab" ? "Cab" : vehicle.purpose === "trip" ? "Trip" : "Event"}
                        {(vehicle.purpose === "trip" || vehicle.purpose === "events") && (
                          <span className="ml-auto text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 uppercase tracking-tighter shadow-sm">
                            Petrol Excluded
                          </span>
                        )}
                      </p>

                      {searchData.withDriver === "without-driver" ? (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                            </div>
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Location</p>
                          </div>
                          <p className="text-xs font-semibold text-gray-700 italic border-l-2 border-blue-300 pl-3 py-1">
                            {vehicle.location || "Location not specified"}
                          </p>
                        </div>
                      ) : vehicle.withDriver ? (
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-700"><strong>Name:</strong> {vehicle.driverName || "Not Specified"}</span>
                            </div>
                            {vehicle.phone && (
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                  </svg>
                                </div>
                                <span className="text-xs text-gray-700"><strong>Phone:</strong> {vehicle.phone}</span>
                              </div>
                            )}
                            {vehicle.license && (
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <line x1="7" y1="8" x2="17" y2="8" />
                                    <line x1="7" y1="12" x2="17" y2="12" />
                                    <line x1="7" y1="16" x2="12" y2="16" />
                                  </svg>
                                </div>
                                <span className="text-xs text-gray-700"><strong>License:</strong> {vehicle.license}</span>
                              </div>
                            )}
                            {vehicle.experience !== undefined && (
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                </div>
                                <span className="text-xs text-gray-700"><strong>Experience:</strong> {vehicle.experience} Years</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-md mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"></path>
                            </svg>
                          </div>
                          <h4 className="text-emerald-800 font-bold uppercase tracking-widest text-[10px] mb-1">Self Drive Only</h4>
                          <p className="text-emerald-600 text-[10px]">Enjoy the freedom!</p>
                        </div>
                      )}

                      {vehicle.purpose === "cab" && searchData?.pickupLocation && searchData?.dropLocation && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 font-medium text-xs">Distance:</span>
                            <span className="text-gray-900 font-bold text-xs uppercase">
                              {isCalculating ? "Calculating..." : calculatedDistance !== null ? `${calculatedDistance} km` : "N/A"}
                            </span>
                          </div>
                          <div className="w-full h-px bg-blue-200 my-2"></div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-bold text-xs">Total Fare:</span>
                            <span className="text-emerald-600 font-extrabold text-base">
                              {isCalculating ? "..." : calculatedDistance !== null
                                ? `₹${(calculatedDistance * (vehicle.price || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleBooking(vehicle)}
                        disabled={bookingLoading === vehicle._id}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                      >
                        <span>{bookingLoading === vehicle._id ? "Booking..." : "Book Now"}</span>
                        {bookingLoading !== vehicle._id && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
