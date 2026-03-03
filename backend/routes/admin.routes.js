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
  getTheatres
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


export default router;
