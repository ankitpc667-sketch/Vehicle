"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function MyVehicles() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "driver") {
      router.push("/role-selection");
      return;
    }
    loadVehicles();
  }, [router]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/vehicles/my");
      const data = await res.json();
      if (data.success) {
        setVehicles(data.vehicles);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      const res = await api.delete(`/api/vehicles/${id}`);
      const data = await res.json();
      if (data.success) {
        setVehicles((prev) => prev.filter((v) => v._id !== id));
      } else {
        alert(data.message);
      }
    } catch {
      alert("Network error.");
    }
  };

  const handleEdit = (vehicle: any) => {
    setEditIndex(vehicle._id);
    setEditData({ ...vehicle });
  };

  const handleSave = async () => {
    try {
      const res = await api.put(`/api/vehicles/${editIndex}`, editData);
      const data = await res.json();
      if (data.success) {
        setVehicles((prev) =>
          prev.map((v) => (v._id === editIndex ? data.vehicle : v))
        );
        setEditIndex(null);
      } else {
        alert(data.message);
      }
    } catch {
      alert("Network error.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your vehicles...</p>
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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}></div>
      </div>
      {/* Header */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl mb-6">
        <div className="max-w-full mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Vehicles</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and view all your registered vehicles</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/driver-dashboard")}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-full mx-auto px-8 py-8">
        {vehicles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No vehicles added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-gray-100 flex flex-col h-full">
                {editIndex === vehicle._id ? (
                  <div className="flex flex-col h-full">
                    <div className="space-y-3 flex-grow">
                      {[
                        { label: "Car Name", field: "carName" },
                        { label: "Car Number", field: "carNo" },
                        ...(editData.withDriver !== false
                          ? [
                            { label: "Driver Name", field: "driverName" },
                            { label: "Phone Number", field: "phone" },
                            { label: "Aadhar Number", field: "aadharNo" },
                            { label: "License Number", field: "license" },
                          ]
                          : []),
                      ].map(({ label, field }) => (
                        <div key={field}>
                          <label className="block text-sm font-medium mb-1">{label}</label>
                          <input
                            type="text"
                            value={editData[field] || ""}
                            onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      ))}
                      {editData.withDriver !== false && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Experience (Years)</label>
                          <input
                            type="number"
                            value={editData.experience}
                            onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-1">Purpose</label>
                        <select
                          value={editData.purpose}
                          onChange={(e) => setEditData({ ...editData, purpose: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="cab">Cab</option>
                          <option value="trip">Trip</option>
                          <option value="events">Event</option>
                        </select>
                      </div>
                      {(editData.purpose === "trip" || editData.purpose === "events") && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Driver Option</label>
                          <select
                            value={editData.withDriver === false || editData.withDriver === "false" ? "without-driver" : "with-driver"}
                            onChange={(e) => setEditData({ ...editData, withDriver: e.target.value === "with-driver" })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="with-driver">With Driver</option>
                            <option value="without-driver">Without Driver</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-1">Price ({editData.purpose === "cab" ? "₹/km" : "₹/day"})</label>
                        <input
                          type="number"
                          value={editData.price}
                          onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                      <button onClick={handleSave} className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:scale-105 transition-all duration-300">
                        Save
                      </button>
                      <button onClick={() => setEditIndex(null)} className="flex-1 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 hover:scale-105 transition-all duration-300">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex-grow">
                      {vehicle.photo && (
                        <img src={vehicle.photo} alt={vehicle.carName} className="w-full h-48 object-cover rounded-xl mb-4" />
                      )}
                      <h3 className="text-2xl font-bold mb-2 text-gray-800">{vehicle.carName}</h3>
                      <p className="text-gray-500 mb-4 font-medium">{vehicle.carNo}</p>
                      <div className="space-y-2 text-sm text-gray-600 mb-5 bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2"><span><strong>Driver:</strong> {vehicle.withDriver === false ? "Without Driver" : (vehicle.driverName || "Not Specified")}</span></div>


                        {vehicle.withDriver !== false && (
                          <>
                            <div className="flex items-center gap-2"><span><strong>Phone:</strong> {vehicle.phone}</span></div>
                            <div className="flex items-center gap-2"><span><strong>License:</strong> {vehicle.license}</span></div>
                            <div className="flex items-center gap-2"><span><strong>Experience:</strong> {vehicle.experience} years</span></div>
                          </>
                        )}

                        <div className="flex items-center gap-2"><span><strong>Purpose:</strong> {vehicle.purpose === "cab" ? "Cab" : vehicle.purpose === "trip" ? "Trip" : "Event"}</span></div>
                        <div className="flex items-center gap-2"><span><strong>Price:</strong> ₹{vehicle.price}{vehicle.purpose === "cab" ? "/km" : "/day"}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => handleEdit(vehicle)} className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all duration-300">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(vehicle._id)} className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 transition-all duration-300">
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
