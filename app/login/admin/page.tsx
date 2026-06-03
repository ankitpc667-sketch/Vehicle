"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAuthCookies } from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { email, password }
        : { name, email, password, role: "driver" };

      const res = await api.post(endpoint, body);
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Something went wrong");
        return;
      }

      // Check role matches
      if (isLogin && data.user.role !== "driver") {
        setError("This account is not registered as a driver. Please use the customer login.");
        return;
      }

      setAuthCookies(data.token, "driver", data.user);
      router.push("/driver-dashboard");
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background car image */}
      <div className="absolute inset-0 z-0">
        <img src="/Car.png" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0c29ee 0%, #302b63ee 50%, #24243eee 100%)" }}></div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}></div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Top gradient banner */}
          <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

          <div className="p-8">
            {/* Icon + Title */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.038A2.968 2.968 0 0015 9.506V7.506A2.968 2.968 0 0013.038 6H11V5a1 1 0 00-1-1H3zM14.586 8.372a.997.997 0 01.32.628H11V8h2.038a.97.97 0 011.548.372z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isLogin ? "Login as Driver" : "Register as Driver"}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {isLogin ? "Welcome back! Sign in to manage your fleet." : "Register and start earning today."}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-200 hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Please wait...
                  </span>
                ) : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                {isLogin ? "New driver? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(""); }}
                  className="text-purple-600 font-semibold hover:underline"
                >
                  {isLogin ? "Register" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <p className="text-center mt-5 text-sm">
          <button onClick={() => router.push("/role-selection")} className="text-indigo-300 hover:underline font-medium">
            ← Back to role selection
          </button>
        </p>
      </div>
    </div>
  );
}
