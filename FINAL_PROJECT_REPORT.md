# COMPREHENSIVE PROJECT REPORT
## CAR RENTAL & DRIVER MANAGEMENT SYSTEM (EASY RENTALS)

---

## 1. Introduction

### 1.1. Project Overview — Easy Rentals Car Rental System
Easy Rentals is an enterprise-grade full-stack web application designed for seamless vehicle rental and driver orchestration. It acts as a direct matchmaking platform between customers seeking transportation (cabs, multi-day trips, or events) and verified drivers looking to list their vehicles.

### 1.2. Motivation and Background
In the modern sharing economy, on-demand transportation has transitioned from a luxury to a daily utility. Traditional rental setups rely heavily on manual telephone bookings, physical paperwork, and uncoordinated schedules. This results in severe delays, lack of transparency, and booking deadlocks. The motivation behind Easy Rentals is to digitize, automate, and secure this lifecycle, empowering independent vehicle owners while providing customers with a transparent, upfront booking experience.

### 1.3. Key Objectives
- **Direct Matchmaking:** Eliminate intermediary agency fees by connecting drivers and customers directly.
- **Dynamic Booking Engine:** Support multiple rental scenarios including point-to-point Cabs, long-distance Trips, and Event vehicles.
- **Ultra-Fast Resolution:** Implement a strict 5-minute automated timeout on all booking requests to prevent deadlocks.
- **Robust Security:** Mandate identity verification (Aadhaar & License) and secure API routes using JSON Web Tokens (JWT).

### 1.4. Target Users
- **Customers:** Individuals seeking reliable, transparent, and instantly bookable vehicles for short or long durations, with or without a driver.
- **Drivers/Fleet Owners:** Vehicle owners who wish to independently list their cars, set personalized pricing, and directly accept or reject rides.

### 1.5. Core Features
- Role-based Dashboard (Customer vs. Driver)
- Intelligent Location Searching with overlap parsing
- Real-time 5-minute Booking Countdown Engine
- Automated Fast2SMS text notifications
- Automated 24-hour sensitive data sanitization (GDPR compliant)

---

## 2. Problem Definition

### 2.1. Challenges in Traditional Vehicle Rentals
1. **Inefficient Booking Loops:** A customer makes a request, but the driver goes offline, leaving the request pending indefinitely.
2. **Security Gaps:** Self-drive bookings are often processed without collecting valid digital identity proofs beforehand.
3. **Poor Location Matching:** Standard string equality algorithms fail if a customer searches "Kolkata" and the driver registered in "Salt Lake, Kolkata."
4. **Lack of Communication:** No automated SMS notifications to confirm or reject bookings, leading to user anxiety.

### 2.2. Goal of the Project
The goal is to develop a hyper-responsive platform that eradicates these bottlenecks. By leveraging a decoupled Next.js frontend and an Express backend with an automated timeout engine, the system ensures that no booking remains stagnant for more than 5 minutes.

### 2.3. Scope and Limitations
**Scope:** Covers user authentication, vehicle fleet CRUD management, location-based searching, booking orchestration, and SMS dispatching.
**Limitations:** The current version relies on external SMS gateways which have strict API rate limits. Additionally, live GPS tracking of the vehicle is not yet integrated.

---

## 3. System Architecture

### 3.1. Frontend Architecture (Next.js + React + Tailwind CSS)
The client application is built using **Next.js 15+** and **React 19**. It utilizes Client-Side Rendering (CSR) for real-time dashboards and seamless routing. **Tailwind CSS** provides utility-first styling for responsive layouts. Middlewares intercept routes to enforce strict client-side role isolation.

### 3.2. Backend Architecture (Node.js + MongoDB)
The backend is a monolithic REST API powered by **Node.js** and **Express.js**. It exposes endpoints for Authentication, Vehicles, and Bookings. **MongoDB** is utilized as the primary NoSQL document store, accessed via the **Mongoose ODM** to enforce schema validation and referential integrity.

### 3.3. Data Flow and API Communication
1. The Next.js client dispatches JSON payloads to the Express API.
2. Express middlewares validate the payload and extract JWTs.
3. The API interacts with MongoDB to fetch or mutate documents.
4. If a booking is created or updated, the API triggers a side-effect request to the Fast2SMS gateway.
5. JSON responses are relayed back to the Next.js client for DOM updates.

### 3.4. Authentication System (Email + JWT)
User authentication is completely stateless. Upon successful login (verified via Bcrypt hashed passwords), the Express server generates a **JSON Web Token (JWT)**. This token is stored in HTTP cookies and `localStorage`, and is attached as a Bearer token to all subsequent protected API requests.

---

## 4. Feasibility Study

### 4.1. Technical Feasibility
The development team utilizes the MERN stack (augmented with Next.js), which boasts a massive open-source community, comprehensive documentation, and robust stability. The technical requirements to host and scale this architecture via serverless platforms (like Vercel) are fully met.

### 4.2. Operational Feasibility
The UI is engineered for maximum simplicity. Customers interact with intuitive booking cards, and drivers utilize one-click "Accept" or "Reject" buttons. The 5-minute automated expiry handles non-responsive drivers gracefully without requiring manual intervention, making it highly feasible for non-technical users.

### 4.3. Economic Feasibility
The platform incurs near-zero capital investment. It leverages open-source frameworks, MongoDB Atlas (Free M0 Tier), and Vercel's free Hobby hosting. The only variable cost is the Fast2SMS API credits, which cost fractions of a Rupee per transaction.

### 4.4. System Analysis
Using Agile Iterative Development, the system was analyzed to ensure high concurrency handling. The Node.js event loop perfectly accommodates the rapid, non-blocking asynchronous requests generated by the frontend polling mechanism during active booking countdowns.

---

## 5. Technical Specifications

### 5.1. Frontend Technologies (Next.js, Tailwind, React Hooks)
- `page.tsx` & `layout.tsx`: Core modular components for page structuring.
- `middleware.ts`: Next.js Edge middleware to block unauthorized dashboard access based on cookie role parsing.
- React Hooks (`useState`, `useEffect`): Manage dynamic countdowns, modal overlays, and asynchronous fetch states.

### 5.2. Backend Technologies (Express, Mongoose)
- `server.js`: The central Express application bootstrapping CORS, body-parsers, and route mounting.
- `db.js`: Implements a globally cached MongoDB connection promise to prevent connection exhaustion in serverless environments.
- `routes/*.js`: Dedicated modular routers handling specific REST resource paths.

### 5.3. Database Design (User, Vehicle, Booking)
- **User Schema:** Stores `name`, `email`, `password` (hashed), and `role`.
- **Vehicle Schema:** Stores `driverId`, `carName`, `price`, `location`, `purpose`, and `photo` (Base64).
- **Booking Schema:** Links `customerId` and `vehicleId`. Stores critical payload data such as `pickupLocation`, `expiresAt`, `status`, and sensitive temporary credentials (`customerAadhar`, `customerLicense`).

### 5.4. Security Implementation (JWT, Bcrypt)
- Passwords are salted and hashed over 12 rounds using **BcryptJS**.
- **JWT** payloads are cryptographically signed. The `protect` middleware rejects tampered tokens.
- Role-Based Access Control (RBAC) is enforced using a `restrictTo` higher-order function, ensuring Customers cannot execute Driver routes.

### 5.5. Responsive UI/UX Design
Tailwind CSS provides fluid layout scaling. Dashboards utilize grid architectures (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) to collapse elegantly on mobile devices. Micro-animations and gradient backdrops provide a premium application feel.

---

## 6. System Implementation and Features

### 6.1. User Authentication & Profile Creation
Users register with standard details and select a permanent role (Customer or Driver). Pre-flight checks ensure no duplicate emails exist in the database.

### 6.2. Vehicle Listing and Searching
Drivers upload vehicle details including a Base64 encoded photograph. Customers utilize an intelligent search bar that queries MongoDB. The backend splits queries into word matrices, allowing overlapping substring matches (e.g., finding "Salt Lake, Kolkata" when searching for "Kolkata").

### 6.3. Booking Progress Tracking (Timeout Engine)
When a booking is requested, it is tagged as `pending` and assigned an `expiresAt` timestamp exactly 5 minutes in the future. If the driver does not respond, a frontend polling event triggers the `/api/bookings/expire` endpoint, forcibly transitioning the status to `rejected`.

### 6.4. Dashboard & Real-time Updates (Fast2SMS)
Every transition state (Creation, Acceptance, Rejection, Timeout) executes the `sendSMS` utility function. This formats a custom message and dispatches it through the Fast2SMS API, guaranteeing both parties are instantly informed.

### 6.5. LocalStorage & Backend Synchronization
To maintain rapid client-side performance, transient user preferences and active search queries are cached in browser `localStorage`. This prevents redundant API requests when a user navigates between the Search and Available Vehicles pages.

---

## 7. User Manual

### 7.1. Getting Started (Home, Role Selection)
1. Navigate to the homepage.
2. Click **Login / Register**.
3. Upon first login, select your designated role (Customer or Driver). Note: This choice is permanent for your account.

### 7.2. Creating & Viewing Vehicle Listings
- **Drivers:** Navigate to the "Add Vehicle" tab. Fill out the car details, define your pricing model, upload an image, and submit. The vehicle immediately becomes searchable.
- **Customers:** Use the unified search bar on the "Book Car" page to input your required location and travel purpose.

### 7.3. Booking Flow (Customer Details, Location Select)
- **Customers:** Click on an available vehicle. Fill out the booking form, uploading your Aadhaar/License if opting for Self-Drive. Utilize the dropdown suggestions (powered by OpenStreetMap) to set precise pickup/drop locations. Submit the booking.

### 7.4. Tracking Bookings & Logout
- **Drivers:** A 5-minute countdown will appear on your dashboard. Click **Accept** or **Reject** before time expires.
- **Customers:** Navigate to "My Bookings" to see live status updates. 
- Click the **Logout** button on the navigation bar to clear session tokens and exit safely.

---

## 8. Project Tools and Technology

### 8.1. Hardware & Software Requirements

#### 8.1.1. Minimal Software Requirements
- **OS:** Windows 10/11, macOS, or Linux
- **Runtime:** Node.js v18.x LTS or higher
- **Database:** MongoDB Community Server or MongoDB Atlas
- **Browser:** Google Chrome or Mozilla Firefox

#### 8.1.2. Minimal Hardware Requirements
- **Processor:** Dual Core CPU (Intel i3 / Ryzen 3 or higher)
- **Memory:** 8 GB RAM
- **Storage:** 20 GB Free SSD Space

### 8.2. Development Stack
- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM

### 8.3. Third-Party Integrations
- **Fast2SMS API:** For transactional SMS delivery to Indian mobile numbers.
- **OpenStreetMap Nominatim API:** For dynamic geocoding and location auto-suggestions.
- **Vercel:** Serverless cloud provider utilized for automated frontend deployment.

---

## 9. Testing, Maintenance & Future Works

### 9.1. Testing Approach
- **Unit Testing:** Individual Express routes were tested using Postman to validate edge cases (e.g., negative prices, invalid tokens).
- **Integration Testing:** The flow between the Next.js frontend and Express backend was validated, ensuring cross-origin resource sharing (CORS) policies functioned correctly.
- **Functional Testing:** The 5-minute expiry engine was heavily tested to ensure it accurately transitioned states and fired the correct SMS payloads without race conditions.

### 9.2. System Maintenance
To ensure database performance and user privacy, an automated database cleanup algorithm (`cleanupOldBookings`) runs perpetually. It seeks out completed, rejected, or cancelled bookings that are older than 24 hours and purges them completely from the system, erasing temporary coordinate and License/Aadhaar data.

### 9.3. Conclusion
The Easy Rentals Car Rental & Driver Management System successfully achieves its goal of decentralizing and automating vehicle rentals. By bridging direct connections between customers and drivers under a strict 5-minute SLA timeout, the application solves major industry inefficiencies while maintaining strict data privacy protocols.

### 9.4. Future Enhancements
- **Live GPS Tracking:** Integrating WebSockets (Socket.io) to transmit live coordinates of active rides.
- **Payment Gateway:** Integration of Razorpay/Stripe to process digital payments and hold booking security deposits.
- **Driver Rating System:** A comprehensive post-ride feedback matrix to rank drivers and filter out poorly performing vehicles.

---

## Bibliography
1. React Documentation: https://react.dev
2. Next.js Documentation: https://nextjs.org/docs
3. Express.js API Reference: https://expressjs.com
4. MongoDB & Mongoose Guides: https://mongoosejs.com
5. Fast2SMS Documentation: https://docs.fast2sms.com

## Software Package
The complete compiled source code including both the `car-rental-frontend` and `car-rental-backend` directories, alongside deployment configurations (`.vercel`), package lockfiles, and environment templates, has been delivered as the final software package.
