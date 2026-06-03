"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

function Hero() {
  const router = useRouter();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/car 3.png" alt="Car Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Support Info - Top Right */}
      <div className="absolute top-6 right-6 lg:right-20 z-20 flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl transition-all hover:bg-black/70">
        <div className="flex items-center gap-2 text-white">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          <span className="font-semibold tracking-wide text-sm md:text-base">+91 98765 43210</span>
        </div>
        <div className="w-px h-6 bg-white/30 hidden sm:block"></div>
        <div className="flex items-center gap-2 text-white">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          <span className="font-semibold tracking-wide text-sm md:text-base">support@rentals.in</span>
        </div>
      </div>

      <div className="relative flex items-center justify-between min-h-screen px-10 md:px-20 gap-10 md:gap-20">
        {/* TEXT SECTION */}
        <div className="space-y-8 max-w-2xl z-10 animate-fade-in-left">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-slate-100 via-white to-slate-100 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(255,255,255,0.4)]">
              Easy rentals.
            </span>
            <br />
            <span className="bg-gradient-to-r from-slate-100 via-white to-slate-100 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(255,255,255,0.4)]">
              Endless journey.
            </span>
          </h1>

          <p className="text-xl text-gray-100 leading-relaxed">
            Experience seamless car rentals with our premium fleet.
            <br className="hidden md:block" />
            Fast booking, zero hassle, unforgettable journeys.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push("/role-selection")}
              className="px-10 py-4 font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ background: "#22D3EE", color: "#0F172A", boxShadow: "0 4px 24px rgba(34,211,238,0.35)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#06B6D4")}
              onMouseLeave={e => (e.currentTarget.style.background = "#22D3EE")}
            >
              Get Started →
            </button>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-3 gap-4 pt-8 animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-base font-bold text-gray-800 mb-1">Easy Booking</p>
              <p className="text-xs text-gray-600">Quick & Simple</p>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-base font-bold text-gray-800 mb-1">Best Prices</p>
              <p className="text-xs text-gray-600">Affordable Rates</p>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-base font-bold text-gray-800 mb-1">Verified Drivers</p>
              <p className="text-xs text-gray-600">Safe & Reliable</p>
            </div>
          </div>

          {/* About Us Button */}
          <div className="pt-2">
            <button
              onClick={() => setShowAbout(true)}
              className="px-8 py-3 font-semibold rounded-full transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
              style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
            >
              About Us
            </button>
          </div>
        </div>
      </div>

      {/* About Us Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-t-3xl relative">
              <button
                onClick={() => setShowAbout(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
              >
                ✕
              </button>
              <h2 className="text-3xl font-extrabold text-white mb-2">About Us</h2>
              <p className="text-blue-100 text-sm">Your trusted car rental platform across India</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Who We Are */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Who We Are</h3>
                <p className="text-gray-600 leading-relaxed">
                  We are a modern car rental platform built to connect customers with verified drivers across India. Whether you need a quick cab ride, a vehicle for a trip, or a car for a special event, we make the entire process seamless — from booking to confirmation — all in one place.
                </p>
              </div>

              {/* What We Offer */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">What We Offer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
                      title: "Cab Service",
                      desc: "Book a cab for point-to-point travel. Real-time distance and fare calculation using live route data."
                    },
                    {
                      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>,
                      title: "Trip Rentals",
                      desc: "Plan your trips with or without a driver. Choose a vehicle that fits your group and budget."
                    },
                    {
                      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>,
                      title: "Event Vehicles",
                      desc: "Need a car for a wedding, function or special occasion? We have vehicles available for all events."
                    },
                    {
                      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>,
                      title: "Self Drive",
                      desc: "Drive yourself with our self-drive option. Submit your license and Aadhaar for a verified booking."
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-blue-50 rounded-2xl">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">{item.icon}</div>
                      <div>
                        <p className="font-bold text-gray-800 mb-1">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
                <div className="space-y-3">
                  {[
                    { step: "1", text: "Customer selects purpose (Cab / Trip / Event), date, and enters their details." },
                    { step: "2", text: "Browse available verified vehicles filtered by purpose and driver preference." },
                    { step: "3", text: "Click Book Now — a booking request is sent to the driver instantly." },
                    { step: "4", text: "Driver receives the request and has 5 minutes to Accept or Reject." },
                    { step: "5", text: "Customer is notified of the driver's decision via SMS and can track status in My Bookings." },
                    { step: "6", text: "If the driver doesn't respond within 5 minutes, the booking is automatically rejected and the customer is notified to find another vehicle." },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 items-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <p className="text-gray-600 text-sm pt-1">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* For Drivers */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">For Drivers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: "Register Vehicle", desc: "Add your car with details, photo, pricing and location." },
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>, title: "Manage Fleet", desc: "Edit or delete your vehicles anytime from My Vehicles." },
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: "Accept Bookings", desc: "View incoming booking requests and accept or reject within 5 minutes." },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-purple-50 rounded-2xl text-center">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mx-auto mb-2">{item.icon}</div>
                      <p className="font-bold text-gray-800 text-sm mb-1">{item.title}</p>
                      <p className="text-xs text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Choose Us */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose Us</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>, label: "Verified Drivers" },
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: "5-Min Confirmation" },
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: "Transparent Pricing" },
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>, label: "Flexible Booking" },
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>, label: "Aadhaar Verified" },
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>, label: "Multiple Purposes" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mb-2">{item.icon}</div>
                      <span className="text-xs font-semibold text-gray-700 text-center">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAbout(false)}
                  className="px-10 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:scale-105 transition-all shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hero;
