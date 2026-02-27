import {Router} from "express";
import {loginUser, logoutUser, refreshAccessToken, registerUser} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").patch(verifyJWT, logoutUser);
router.route("/refreshAccessToken").patch(refreshAccessToken);

export default router;