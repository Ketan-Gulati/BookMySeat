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

Core Backend Logic

1. Seat Generation

When an admin creates a new show, seats are generated automatically for that show and stored in the seat collection.

2. Seat Locking

When a user selects seats, the backend temporarily locks them for that user for a fixed duration. This prevents another user from booking the same seats during that time.

3. Lock Expiry Cleanup

Expired locked seats are released automatically through a cron job, making them available again.

4. Payment Flow

The backend creates a Razorpay order after verifying that the selected seats are still locked by the current user. After payment, the backend verifies the Razorpay signature and only then:

 • marks seats as booked
 • creates a booking record
 • updates payment status

5. Admin Booking Drill-Down

Admin booking management follows this flow:

 • get booked movies
 • get theatres for selected movie
 • get shows for selected movie + theatre
 • get bookings for selected show

This allows structured booking inspection instead of showing all bookings in one long list.

API Modules

Auth APIs

 • POST /user/register — Register user
 • POST /user/login — Login user
 • POST /user/logout — Logout user
 • POST /user/refresh-token — Refresh access token

User APIs

 • GET /user/movies — Fetch all movies
 • GET /user/movies/:movieId/shows — Fetch shows for a movie
 • GET /user/shows/:showId/seats — Fetch seats for a show
 • POST /user/seats/lock — Lock selected seats
 • GET /user/bookings/history — Fetch logged-in user's booking history

Payment APIs

 • POST /payments/create-order — Create Razorpay order for locked seats
 • POST /payments/confirm — Verify payment and confirm booking

Admin Movie APIs

 • POST /admin/movies — Create movie
 • PATCH /admin/movies/:movieId — Update movie
 • DELETE /admin/movies/:movieId — Delete movie
 • GET /admin/movies — Fetch all movies

Admin Theatre APIs

 • POST /admin/theatres — Create theatre
 • PATCH /admin/theatres/:theatreId — Update theatre
 • DELETE /admin/theatres/:theatreId — Delete theatre
 • GET /admin/theatres — Fetch all theatres

Admin Show APIs

 • POST /admin/shows — Create show
 • PATCH /admin/shows/:showId — Update show
 • DELETE /admin/shows/:showId — Delete show
 • GET /admin/shows — Fetch all shows

Admin Booking APIs

 • GET /admin/bookings/movies — Fetch movies with bookings
 • GET /admin/bookings/theatres/:movieId — Fetch theatres for selected movie
 • GET /admin/bookings/shows?movieId=...&theatreId=... — Fetch shows for selected movie and theatre
 • GET /admin/bookings/shows/:showId — Fetch bookings for selected show

Booking Flow

 1. User-side flow
 2. User logs in
 3. User selects a movie
 4. User views shows for that movie
 5. User selects a show
 6. User views available seats
 7. User locks seats
 8. Backend creates payment order
 10. Payment is completed
 11. Backend verifies payment
 12. Seats are marked as booked
 13. Booking record is created

Payment Verification Flow

The booking is not confirmed immediately after order creation.
Booking is confirmed only after successful Razorpay payment verification.

After successful verification:

 1. payment status is updated
 2. selected seats are changed from LOCKED to BOOKED
 3. lock metadata is cleared
 4. booking document is create

Environment Variables

Create a .env file inside the backend folder and add:

PORT=8000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
RAZORPAY_API_KEY=your_razorpay_key
RAZORPAY_API_SECRET=your_razorpay_secret
CORS_ORIGIN=*

Adjust variable names if your project uses slightly different names.

Installation & Setup
1. Clone the repository
git clone https://github.com/Ketan-Gulati/BookMySeat.git
cd BookMySeat/backend
2. Install dependencies
npm install
3. Add environment variables

Create a .env file inside the backend directory.

4. Start the server
npm run dev

or

npm start
Important Notes

This repository currently contains the backend implementation.

Razorpay is integrated in test mode.

Seat booking safety depends on backend validation, not only frontend disabling.

Expired locked seats are automatically released by a cron job.

The project is designed to demonstrate real-world backend concepts like concurrency-safe booking, atomic updates, and payment verification.

Future Improvements

Frontend integration

Booking cancellation

Refund handling

Admin revenue analytics

Request validation

Rate limiting

Redis-based distributed locking for higher scale

Learning Highlights

This project helped implement and understand:

role-based backend architecture

MongoDB aggregation

atomic updates

concurrency-safe seat locking

cron-based background cleanup

payment gateway integration

secure payment verification flow

Author

Ketan Gulati

GitHub: Ketan-Gulati

LinkedIn: ketan-gulati-9a4233239
