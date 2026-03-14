# BookMySeat

BookMySeat is a backend system for a high-concurrency movie ticket booking platform. It is designed to reduce double booking issues during simultaneous seat selection by using seat locking, lock expiry, atomic seat updates, and payment verification.

This backend supports authentication, admin-side movie/theatre/show management, user-side booking flow, Razorpay test payment integration, booking history, and admin booking management.

---

## Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Protected routes using middleware
- Role-based access control for admin routes

### Admin Management
- Create, update, delete, and fetch movies
- Create, update, delete, and fetch theatres
- Create, update, delete, and fetch shows
- Automatic seat generation when a show is created

### User Booking Flow
- Fetch available movies
- Fetch shows for a selected movie
- Fetch seat layout for a selected show
- Lock selected seats temporarily
- Prevent booking of already locked/booked seats
- Release expired seat locks automatically
- Create Razorpay payment order
- Verify payment and confirm booking
- View booking history

### Concurrency Handling
- Atomic seat locking to reduce race conditions
- Lock expiry support
- Background cleanup job for expired locks
- Booking confirmation only after valid payment verification

### Admin Booking Management
- Fetch movies for which bookings exist
- Fetch theatres for a selected movie
- Fetch shows for a selected movie and theatre
- Fetch bookings for a selected show

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication and Security:** JWT, argon2
- **Payment Gateway:** Razorpay Test Mode
- **Background Job:** node-cron

---

## Project Structure

```bash
backend/
│── config/         # External service configuration (e.g. Razorpay)
│── controllers/    # Route handler logic
│── database/       # DB connection setup
│── middlewares/    # Auth, admin checks, error handling, etc.
│── models/         # Mongoose schemas/models
│── routes/         # Route definitions
│── utils/          # Helper classes/functions/services
│── app.js          # Express app configuration
│── index.js        # Server entry point
│── constants.js    # Shared constants
