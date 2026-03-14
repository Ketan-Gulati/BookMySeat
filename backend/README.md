Core Backend Logic

1. Seat Generation

When an admin creates a new show, seats are generated automatically for that show and stored in the seat collection.

2. Seat Locking

When a user selects seats, the backend temporarily locks them for that user for a fixed duration. This prevents another user from booking the same seats during that time.

3. Lock Expiry Cleanup

Expired locked seats are released automatically through a cron job, making them available again.

4. Payment Flow

The backend creates a Razorpay order after verifying that the selected seats are still locked by the current user. After payment, the backend verifies the Razorpay signature and only then:

marks seats as booked

creates a booking record

updates payment status

5. Admin Booking Drill-Down

Admin booking management follows this flow:

get booked movies

get theatres for selected movie

get shows for selected movie + theatre

get bookings for selected show

This allows structured booking inspection instead of showing all bookings in one long list.

API Modules
Auth APIs

POST /user/register — Register user

POST /user/login — Login user

POST /user/logout — Logout user

POST /user/refresh-token — Refresh access token

User APIs

GET /user/movies — Fetch all movies

GET /user/movies/:movieId/shows — Fetch shows for a movie

GET /user/shows/:showId/seats — Fetch seats for a show

POST /user/seats/lock — Lock selected seats

GET /user/bookings/history — Fetch logged-in user's booking history

Payment APIs

POST /payments/create-order — Create Razorpay order for locked seats

POST /payments/verify — Verify payment and confirm booking

Admin Movie APIs

POST /admin/movies — Create movie

PATCH /admin/movies/:movieId — Update movie

DELETE /admin/movies/:movieId — Delete movie

GET /admin/movies — Fetch all movies

Admin Theatre APIs

POST /admin/theatres — Create theatre

PATCH /admin/theatres/:theatreId — Update theatre

DELETE /admin/theatres/:theatreId — Delete theatre

GET /admin/theatres — Fetch all theatres

Admin Show APIs

POST /admin/shows — Create show

PATCH /admin/shows/:showId — Update show

DELETE /admin/shows/:showId — Delete show

GET /admin/shows — Fetch all shows

Admin Booking APIs

GET /admin/bookings/movies — Fetch movies with bookings

GET /admin/bookings/theatres/:movieId — Fetch theatres for selected movie

GET /admin/bookings/shows?movieId=...&theatreId=... — Fetch shows for selected movie and theatre

GET /admin/bookings/shows/:showId — Fetch bookings for selected show

Booking Flow
User-side flow

User logs in

User selects a movie

User views shows for that movie

User selects a show

User views available seats

User locks seats

Backend creates payment order

Payment is completed

Backend verifies payment

Seats are marked as booked

Booking record is created

Payment Verification Flow

The booking is not confirmed immediately after order creation.
Booking is confirmed only after successful Razorpay payment verification.

After successful verification:

payment status is updated

selected seats are changed from LOCKED to BOOKED

lock metadata is cleared

booking document is create
