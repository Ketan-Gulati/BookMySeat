import { Router } from "express";
import {
  bookingHistory,
  // confirmBooking,
  getMovieDesc,
  getMovies,
  getShowsByMovieId,
  getShowSeats,
  lockSeats,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").patch(verifyJWT, logoutUser);
router.route("/refreshAccessToken").patch(refreshAccessToken);
//movie routes
router.route("/movies").get(getMovies);
router.route("/movies/:movieId").get(getMovieDesc);
router.route("/movies/:movieId/shows").get(getShowsByMovieId);

//seat and seat locking
router.route("/shows/:showId/seat-layout").get(verifyJWT, getShowSeats);
router.route("/seats/lock").post(verifyJWT, lockSeats)

/* //confirm booking
router.route("/booking/confirm").post(verifyJWT, confirmBooking) */

//booking history
router.route("/booking-history").get(verifyJWT, bookingHistory)

export default router;
