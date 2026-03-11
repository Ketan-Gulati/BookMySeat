import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.midleware.js";
import {
  createMovie,
  deleteMovie,
  getMovies,
  updateMovie,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  getTheatres,
  createShow,
  updateShow,
  deleteShow,
  getShows,
  getBookingMovies,
  getBookingTheatres,
  getBookingShows,
  getShowBookings
} from "../controllers/admin.controllers.js";

const router = Router();

//movie management
router
  .route("/movies")
  .post(verifyJWT, verifyAdmin, upload.single("coverImage"), createMovie);
router
  .route("/movies/:movieId")
  .patch(verifyJWT, verifyAdmin, upload.single("coverImage"), updateMovie);
router.route("/movies/:movieId").delete(verifyJWT, verifyAdmin, deleteMovie);
router.route("/movies").get(verifyJWT, verifyAdmin, getMovies);

//theatre management
router.route("/theatres").post(verifyJWT, verifyAdmin, createTheatre)
router.route("/theatres/:theatreId").patch(verifyJWT, verifyAdmin, updateTheatre)
router.route("/theatres/:theatreId").delete(verifyJWT, verifyAdmin, deleteTheatre)
router.route("/theatres").get(verifyJWT, verifyAdmin, getTheatres)

//show management
router.route("/shows").post(verifyJWT, verifyAdmin, createShow)
router.route("/shows/:showId").patch(verifyJWT, verifyAdmin, updateShow)
router.route("/shows/:showId").delete(verifyJWT, verifyAdmin, deleteShow)
router.route("/shows").get(verifyJWT, verifyAdmin, getShows)

//booking management
router.route("/bookings/movies").get(verifyJWT, verifyAdmin, getBookingMovies)
router.route("/bookings/theatres/:movieId").get(verifyJWT, verifyAdmin, getBookingTheatres)
router.route("/bookings/shows?movieId=&theatreId=").get(verifyJWT, verifyAdmin, getBookingShows)
router.route("/bookings/shows/:showId").get(verifyJWT, verifyAdmin, getShowBookings)

export default router;
