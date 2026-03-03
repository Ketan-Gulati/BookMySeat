import { Router } from "express";
import {
  getMovies,
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
router.route("/movies").get(verifyJWT, getMovies);

export default router;
