# ============================================================
#   EASY RENTALS — CAR RENTAL & DRIVER MANAGEMENT SYSTEM
#   COMPLETE 100% PROJECT DESCRIPTION
# ============================================================

---

## WHAT IS THIS PROJECT?

**Easy Rentals** is a full-stack web application that works like a private marketplace for cars and drivers.
Think of it like "Ola" or "Zoomcar" — but built completely from scratch by the developer.

On this platform:
- A **Driver** (vehicle owner) can list their car on the website, set their own price, and wait for customers to book it.
- A **Customer** can search for available cars near their location, choose the type of ride they want, fill in their details, and book instantly.
- The system then **automatically sends an SMS** to both the driver and the customer, and gives the driver exactly **5 minutes** to either Accept or Reject the booking.
- If the driver does not respond in 5 minutes, the booking is **automatically rejected** and the customer is freed to book another vehicle.

The project is **100% free to use** for both drivers and customers. There are no hidden charges.

---

## WHY WAS THIS PROJECT BUILT? (MOTIVATION & PURPOSE)

Traditional car rental systems in India have several major problems:

1. **No automation** — Customers call a travel agent, who then calls the driver, who may or may not pick up the phone. This wastes hours.
2. **High agent commissions** — Travel agents charge 20–30% from the driver's earnings just to forward a booking.
3. **No transparency** — Customers never see the actual driver's details, license, or experience before booking.
4. **Stale bookings** — A driver can go offline without rejecting a booking, leaving the customer waiting forever.
5. **Poor location search** — Simple systems fail if a driver registers in "Salt Lake, Kolkata" but the customer searches for just "Kolkata".

**Easy Rentals solves all of these problems:**
- Zero commission — driver and customer connect directly.
- 5-minute timeout engine — no booking ever stays "pending" forever.
- Full transparency — driver name, license, Aadhaar (partially), phone, and experience are shown before booking.
- Smart location matching — "Kolkata" will match "Salt Lake, Kolkata" automatically.
- Instant SMS alerts to both parties at every step.

---

## WHO CAN USE THIS WEBSITE? (TARGET USERS)

The website has exactly **two types of users**:

### 1. Customer
- Someone who needs a car for a Cab ride, a Trip, or an Event.
- Registers on the website, searches for cars in their area, and books.
- Receives an SMS when the driver accepts or rejects.

### 2. Driver (Vehicle Owner)
- Someone who owns a car and wants to earn money by listing it for rent.
- Registers, lists their car with a photo and pricing, and gets notifications when someone books.
- Has 5 minutes to Accept or Reject each booking request.

---

## WHAT ARE THE 3 TYPES OF BOOKINGS?

The entire system is built around **3 purposes** for renting a car:

| Purpose | What It Means | Pricing | Driver Required? |
|---------|--------------|---------|-----------------|
| **Cab** | Short point-to-point city ride (like Ola/Uber) | ₹ per KM | Always Yes |
| **Trip** | Multi-day outstation or leisure travel | ₹ per Day | Customer Chooses (With or Without Driver) |
| **Event** | Wedding, corporate event, special occasion | ₹ per Day | Customer Chooses (With or Without Driver) |

**For Cab bookings:** The website automatically calculates the distance between Pickup and Drop using a live routing API (OSRM), and shows the **Total Estimated Fare** on the vehicle card before booking.

**For Trip/Event without a driver (Self-Drive):** The customer must provide their **Driving License number** as proof before the booking is accepted.

---

## COMPLETE FLOW OF THE WEBSITE (PAGE BY PAGE)

---

### PAGE 1 — Home Page (`/`)
- The very first page when you open the website.
- It simply redirects users to the Role Selection page.
- Has a dark gradient background with a car image overlay.

---

### PAGE 2 — Role Selection (`/role-selection`)
- After landing, the user sees **two beautiful cards**:
  - **Customer Card** (Blue) — with options: Browse vehicles, Manage bookings, Track pickup & drop.
  - **Driver Card** (Purple) — with options: Register vehicles, Set pricing & availability, View all bookings.
- Clicking either card takes the user to the respective **Login/Register** page.
- This is NOT a permanent role assignment — it just directs them to the right login form.

---

### PAGE 3 — Customer Login & Register (`/login/user`)
- New customers can **Register** with:
  - Full Name
  - Email Address
  - Password
- Returning customers can **Login** with their email and password.
- On successful login, the system stores a **JWT token** and the user's **role** in the browser (localStorage + cookie).
- The user is then redirected to the Customer Dashboard.

---

### PAGE 4 — Driver Login & Register (`/login/admin`)
- Same as the customer login page but for drivers.
- New drivers register with Name, Email, and Password.
- On login, the system marks their role as `"driver"` and redirects to the Driver Dashboard.

---

### PAGE 5 — Customer Dashboard (`/customer-dashboard`)
- A clean dashboard with 2 large clickable cards:
  1. **Book Your Vehicle** → Goes to the Book Car search form.
  2. **My Bookings** → Goes to the customer's booking history.
- Has a beautiful dark purple/indigo gradient background with glowing orb effects.

---

### PAGE 6 — Book a Car (`/book-car`)
This is the **main search form** for customers. It contains:

**Section A — Trip Details:**
- **Purpose** (Cab / Trip / Event) — dropdown
- **Driver Option** (With Driver / Without Driver) — shown only for Trip or Event
- **Booking Date** — date picker

**Section B — Your Details:**
- Full Name
- Phone Number
- Driving License Number (only required for Self-Drive trips)
- Aadhaar Number (always required for identity verification)

**Section C — Location Fields:**
- **Pickup Location** — text box with **live autocomplete suggestions** powered by OpenStreetMap. As the customer types 3+ characters, a dropdown appears with real Indian address suggestions. The customer clicks one to select it, which also captures the GPS coordinates (latitude/longitude).
- **Drop Location** — same as above. Hidden for Self-Drive bookings.
- **Pickup Time** — time picker. Hidden for Self-Drive bookings.

**Form Validation:**
- Pickup and Drop cannot be the same location.
- GPS coordinates must be selected from the suggestions (not manually typed) for Cab and With-Driver bookings.

On clicking **"Search Available Vehicles"**, all the form data is saved to `localStorage` and the user is taken to the Available Vehicles page.

---

### PAGE 7 — Available Vehicles (`/available-vehicles`)
This page shows all cars that match the customer's search criteria.

**At the top:** A summary card shows the customer's search details (Date, Purpose, Pickup, Drop).

**Sort Feature:** Customer can sort vehicles by price (Low to High or High to Low).

**Vehicle Cards:** Each car is shown as a card with:
- Car photo
- Car name and plate number
- Price (₹/km for Cabs, ₹/day for Trips/Events)
- Purpose type
- "Petrol Excluded" badge for Trips/Events
- Driver details (Name, Phone, License, Experience) for with-driver bookings
- "Self Drive Only" badge for without-driver vehicles
- **For Cab bookings only:** Live distance calculation (using OSRM routing API) + **Total Estimated Fare** = Distance × Price per KM

**Book Now Button:** Customer clicks this → booking is created instantly → customer is taken to "My Bookings".

---

### PAGE 8 — My Bookings (`/my-bookings`)
Shows the customer's full booking history with real-time status updates.

**Each booking card shows:**
- Car name
- Date and time
- Pickup & Drop location
- Purpose
- Current Status:
  - 🟡 **Pending** — Waiting for driver to respond. Shows a live countdown timer.
  - 🟢 **Confirmed** — Driver accepted. Ride is locked in.
  - 🔴 **Rejected** — Driver rejected or 5-minute timer expired.
  - ⚫ **Cancelled** — Customer cancelled the booking.
- **Cancel Button** — Customer can cancel a pending booking before the driver responds.

**5-Minute Countdown Timer:** For every pending booking, the page shows a live ticking countdown. If it reaches 00:00, the system automatically expires the booking.

---

### PAGE 9 — Driver Dashboard (`/driver-dashboard`)
This is the main control panel for drivers. It has 3 large cards:

1. **Add Vehicle** → Goes to the Add Vehicle form.
2. **My Vehicles** → Shows all the driver's listed vehicles.
3. **View Bookings** → Shows all bookings for their vehicles.

**Live Notification Badge:** The "View Bookings" card shows a **red pulsing badge** with the number of new pending bookings. This number updates every **10 seconds** automatically.

**New Booking Popup:** When a new booking arrives, a beautiful modal popup appears automatically on the dashboard with:
- Vehicle name
- Customer name
- Booking date and purpose
- Pickup and Drop location
- Warning: "You have 5 minutes to respond!"
- A button to go directly to View Bookings.

---

### PAGE 10 — Add Vehicle / Edit Vehicle (`/driver`)
The form where drivers list their car. Contains:

**Vehicle Details:**
- Car Name (e.g., Hyundai i20)
- Purpose (Cab / Trip / Event)
- Car Number (plate number)
- Driver Option (With Driver / Without Driver) — for Trip/Event only
- Price (₹/km for Cab, ₹/day for Trip/Event)

**Driver & ID Details (only shown for "With Driver" option):**
- Driver Name (auto-filled from login name)
- Phone Number
- Aadhar Number
- Driving License Number
- Experience (in years)

**Location:** 
- Text box with live OpenStreetMap autocomplete suggestions (same as the booking form).
- This is the area where the vehicle is available for pickup.

**Vehicle Photo:**
- Image upload (any image file)
- Shows a preview after upload

On submit, the vehicle is saved to the database and immediately becomes searchable by customers.

---

### PAGE 11 — My Vehicles (`/my-vehicles`)
Shows all vehicles that the driver has listed. Each card shows:
- Car photo
- Car name, plate number
- Purpose
- Price
- Location
- Driver details (if applicable)
- **Delete Button** — permanently removes the vehicle.

---

### PAGE 12 — Driver Bookings (`/driver-bookings`)
Shows all bookings that have been made for the driver's vehicles. This is the most important page for drivers.

**Each booking card shows:**
- Customer name, phone, Aadhaar number
- Customer Driving License (for self-drive bookings)
- Pickup and Drop location
- Booking date and time
- Live countdown timer for pending bookings
- Current status

**Driver Actions (only for Pending bookings within 5 minutes):**
- ✅ **Accept Button** — Confirms the booking. Sends SMS to customer.
- ❌ **Reject Button** — Rejects the booking. Sends SMS to customer.

After 5 minutes, the buttons disappear and the booking is automatically marked as "Rejected".

---

## COMPLETE SMS NOTIFICATION SYSTEM

At every important event, **both the driver and the customer receive an SMS** via the Fast2SMS gateway:

| Event | SMS to Customer | SMS to Driver |
|-------|----------------|---------------|
| Booking Created | "Your booking is pending. Driver has 5 min to respond." | "New booking request! Accept/Reject in 5 mins." |
| Driver Accepts | "Great news! Your booking is confirmed." | — |
| Driver Rejects | "Sorry, driver rejected your booking." | — |
| 5-Min Timeout | "Driver didn't respond. Booking auto-rejected." | — |
| Customer Cancels | — | "Customer cancelled the booking." |

---

## COMPLETE LIST OF ALL TECHNOLOGIES USED

---

### FRONTEND (What the user sees in the browser)

| Technology | What It Does in This Project | Cost |
|-----------|------------------------------|------|
| **Next.js 15** | The main React framework. Handles page routing, middleware, and server-side features. | Free |
| **React 19** | Builds the interactive UI components. Manages form states, loading spinners, countdowns. | Free |
| **TypeScript** | Makes JavaScript code safer by adding type checking. Catches bugs before they happen. | Free |
| **Tailwind CSS** | Styles every single element — colors, spacing, gradients, animations, responsive layouts. | Free |
| **OpenStreetMap (Nominatim API)** | Powers the location autocomplete suggestions in all search/booking forms. | Free |
| **OSRM Routing API** | Calculates the real driving distance (in km) between two GPS coordinates for Cab fare estimation. | Free |

---

### BACKEND (The server that powers the website)

| Technology | What It Does in This Project | Cost |
|-----------|------------------------------|------|
| **Node.js** | The runtime that runs the backend server code. | Free |
| **Express.js** | The web framework that creates all the API routes (/api/auth, /api/vehicles, /api/bookings). | Free |
| **MongoDB** | The database that stores all users, vehicles, and bookings. | Free (Atlas M0 Tier) |
| **Mongoose** | The library that connects Node.js to MongoDB and enforces data schemas. | Free |
| **BcryptJS** | Hashes and salts passwords before saving them. Nobody — not even the developer — can read stored passwords. | Free |
| **JSON Web Token (JWT)** | Creates secure login tokens. Every API request must carry this token to prove the user is logged in. | Free |
| **CORS** | Allows the frontend (on Vercel) to communicate with the backend (on a different Vercel URL). | Free |
| **dotenv** | Loads secret keys (MongoDB URL, JWT secret, Fast2SMS key) from a hidden .env file. | Free |
| **Fast2SMS API** | Sends real transactional SMS messages to Indian phone numbers (+91). | Free credits → Paid wallet |

---

### DEPLOYMENT & HOSTING

| Platform | What It Hosts | Cost |
|---------|--------------|------|
| **Vercel** | Hosts the Next.js frontend. Auto-deploys whenever code is pushed. | Free (Hobby Plan) |
| **Vercel** | Also hosts the Express.js backend as serverless functions. | Free (Hobby Plan) |
| **MongoDB Atlas** | Cloud database hosting. The M0 Sandbox tier is free forever up to 512MB. | Free |

---

### DEVELOPMENT TOOLS (Used to build, not part of the final product)

| Tool | Purpose |
|------|---------|
| **Visual Studio Code** | The code editor used to write all the code. |
| **Postman** | Used to test backend API routes before connecting the frontend. |
| **Git** | Version control to save code history. |
| **npm** | Node Package Manager — installs all the libraries. |
| **Vercel CLI** | Command-line tool to deploy the project to Vercel directly from the terminal. |

---

## DATABASE STRUCTURE (What Data is Stored)

The MongoDB database has 3 collections (like tables):

### Collection 1: `users`
Stores every registered user (both customers and drivers).

| Field | Type | Example Value |
|-------|------|--------------|
| _id | Auto ID | 665abc123... |
| name | Text | "Uddip Das" |
| email | Text (Unique) | "uddip@gmail.com" |
| password | Hashed Text | "$2b$12$xyz..." |
| role | Text | "customer" or "driver" |
| createdAt | Date | 2026-06-01T10:00:00Z |

### Collection 2: `vehicles`
Stores every car listed by a driver.

| Field | Type | Example Value |
|-------|------|--------------|
| _id | Auto ID | 665def456... |
| driverId | User ID | Links to the driver's user account |
| carName | Text | "Hyundai i20" |
| carNo | Text | "WB12AB1234" |
| purpose | Text | "cab", "trip", or "events" |
| price | Number | 12 (₹/km) or 2000 (₹/day) |
| location | Text | "Salt Lake, Kolkata" |
| photo | Base64 Image | Full image stored as text |
| withDriver | True/False | true |
| driverName | Text | "Ankit Das" |
| phone | Text | "9876543210" |
| aadharNo | Text | "123456789012" |
| license | Text | "WB0120220001234" |
| experience | Number | 5 (years) |

### Collection 3: `bookings`
Stores every booking request made by customers.

| Field | Type | Example Value |
|-------|------|--------------|
| _id | Auto ID | 665ghi789... |
| customerId | User ID | Links to customer's account |
| vehicleId | Vehicle ID | Links to the booked vehicle |
| purpose | Text | "cab", "trip", "events" |
| pickupLocation | Text | "Park Street, Kolkata" |
| dropLocation | Text | "Howrah Station, Kolkata" |
| pickupCoords | Object | { lat: "22.55", lon: "88.35" } |
| dropCoords | Object | { lat: "22.58", lon: "88.31" } |
| bookingDate | Text | "2026-06-15" |
| pickupTime | Text | "10:30" |
| withDriver | Text | "with-driver" |
| status | Text | "pending", "confirmed", "rejected", "cancelled" |
| customerName | Text | "Rohit Sharma" |
| customerPhone | Text | "9123456789" |
| customerAadhar | Text | "987654321012" |
| customerLicense | Text | "DL0120220001" |
| driverPhone | Text | "9876543210" |
| expiresAt | Date | 5 minutes after booking created |
| createdAt | Date | Exact time booking was placed |

---

## SECURITY FEATURES

1. **Password Hashing** — Passwords are never stored as plain text. BcryptJS runs 12 rounds of hashing. Even if the database is stolen, passwords cannot be read.

2. **JWT Authentication** — Every API request must include a valid JWT token. The server checks this before processing any request.

3. **Role-Based Access Control (RBAC):**
   - A customer CANNOT access driver routes (add vehicle, view driver bookings).
   - A driver CANNOT create bookings or access customer pages.
   - Next.js middleware blocks wrong-role access at the browser level too.

4. **5-Minute Booking Expiry** — The `expiresAt` timestamp is set server-side (not by the browser), so it cannot be faked.

5. **24-Hour Data Purge** — After a booking is completed/rejected/cancelled for more than 24 hours, all sensitive data (Aadhaar, license, phone, coordinates) is permanently deleted from the database automatically.

6. **CORS Policy** — Only the official frontend URL is allowed to make requests to the backend API.

---

## THE 5-MINUTE BOOKING ENGINE (HOW IT WORKS)

This is the most unique feature of the system. Here is the exact sequence:

```
Step 1: Customer clicks "Book Now"
        ↓
Step 2: Backend creates booking with status = "pending"
        expiresAt = current time + 5 minutes
        ↓
Step 3: Backend immediately sends SMS to both Customer and Driver
        ↓
Step 4: Driver's dashboard polls the API every 10 seconds
        If a new pending booking exists → popup appears on screen
        ↓
Step 5 (Option A): Driver clicks "Accept" within 5 minutes
        → status = "confirmed"
        → SMS sent to customer: "Booking Confirmed!"
        ↓
Step 5 (Option B): Driver clicks "Reject" within 5 minutes
        → status = "rejected"
        → SMS sent to customer: "Booking Rejected"
        ↓
Step 5 (Option C): 5 minutes pass with no response
        → Customer's "My Bookings" page calls /api/bookings/expire
        → All expired pending bookings → status = "rejected"
        → SMS sent to customer: "Auto-rejected, driver didn't respond"
```

---

## SMART LOCATION MATCHING ALGORITHM

Normal systems do exact string matching. This fails when:
- Driver registers: "Salt Lake, Kolkata, West Bengal"
- Customer searches: "Kolkata"
- Result: NO MATCH ❌ (wrong!)

**Easy Rentals uses a two-step matching algorithm:**

**Step 1 — Substring Check:**
Does "Salt Lake, Kolkata, West Bengal" contain "Kolkata"? → YES ✅

**Step 2 — Word Overlap Check:**
If substring fails, split both into words:
- Query words: ["kolkata"]
- Vehicle words: ["salt", "lake", "kolkata", "west", "bengal"]
- Common words: ["kolkata"] → Match found ✅

Common filler words like "of", "the", "in", "at" are filtered out before matching so they don't cause false positives.

---

## LIVE FARE CALCULATION (FOR CAB BOOKINGS)

When a customer books a Cab with specific Pickup and Drop GPS coordinates, the Available Vehicles page automatically:

1. Calls the **OSRM Routing API** (a free, open-source route planner)
2. Sends the Pickup GPS coordinates and Drop GPS coordinates
3. Receives the actual driving distance in meters
4. Converts to kilometres
5. Multiplies by the vehicle's price per km
6. Displays: **"Distance: 12.4 km | Total Fare: ₹148.80"**

This is calculated live for every vehicle on the results page.

---

## COMPLETE FILE STRUCTURE OF THE PROJECT

```
car-rental-application/
│
├── app/                          ← All website pages (Next.js)
│   ├── page.tsx                  ← Home (redirects to /role-selection)
│   ├── role-selection/           ← Choose Customer or Driver
│   ├── login/
│   │   ├── user/                 ← Customer Login & Register
│   │   └── admin/                ← Driver Login & Register
│   ├── customer-dashboard/       ← Customer home screen
│   ├── book-car/                 ← Search form for booking
│   ├── available-vehicles/       ← Results page with vehicle cards
│   ├── my-bookings/              ← Customer's booking history
│   ├── driver-dashboard/         ← Driver home screen
│   ├── driver/                   ← Add/Edit vehicle form
│   ├── my-vehicles/              ← Driver's listed vehicles
│   └── driver-bookings/          ← Driver's incoming bookings
│
├── car-rental-backend/           ← The Express.js API server
│   ├── server.js                 ← Entry point, starts the server
│   ├── db.js                     ← MongoDB connection
│   ├── models/
│   │   ├── User.js               ← User database schema
│   │   ├── Vehicle.js            ← Vehicle database schema
│   │   └── Booking.js            ← Booking database schema
│   ├── routes/
│   │   ├── auth.js               ← /api/auth (register, login)
│   │   ├── vehicles.js           ← /api/vehicles (CRUD)
│   │   └── bookings.js           ← /api/bookings (create, respond, expire)
│   └── middleware/
│       └── auth.js               ← JWT protect + restrictTo functions
│
├── middleware.ts                 ← Next.js route guard (browser-level)
├── lib/
│   └── api.ts                    ← Central API helper (attaches JWT to all requests)
│
├── public/
│   └── Car.png                   ← Background car image used on all pages
│
├── .env.local                    ← Frontend secret config (API URL)
├── car-rental-backend/.env       ← Backend secrets (MongoDB URL, JWT secret, Fast2SMS key)
├── package.json                  ← Frontend dependencies list
└── car-rental-backend/
    └── package.json              ← Backend dependencies list
```

---

## DEPLOYMENT URLS

| Component | Live URL |
|-----------|---------|
| **Frontend (Main Website)** | https://car-rental-frontend-six-pied.vercel.app |
| **Backend API** | Deployed as a separate Vercel project (car-rental-backend) |

---

## SUMMARY — EVERYTHING IN ONE PARAGRAPH

**Easy Rentals** is a full-stack car rental web application built with **Next.js + React (frontend)** and **Node.js + Express + MongoDB (backend)**, deployed on **Vercel** for free. It connects two types of users — **Customers** and **Drivers** — without any middleman. Customers can search for available vehicles by location and purpose (Cab, Trip, or Event), see live fare estimates for cab rides, and book instantly. Drivers list their vehicles with photos and pricing, and get **real-time notifications** with a strict **5-minute window** to Accept or Reject each booking. If they don't respond, the system **automatically rejects** the booking. Both parties receive **SMS notifications** at every step via the Fast2SMS API. All passwords are **bcrypt-hashed**, all routes are protected with **JWT tokens**, users are restricted to their role's pages only, and all sensitive data (Aadhaar, license, coordinates) is **permanently deleted** from the database after 24 hours. The entire system — frontend, backend, and database — runs completely **free of charge** on Vercel and MongoDB Atlas free tiers.
