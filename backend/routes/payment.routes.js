import { Router } from "express";
import {
  confirmPayment,
  createPaymentOrder,
} from "../controllers/payment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-order").post(verifyJWT, createPaymentOrder);
router.route("/verify").post(verifyJWT, confirmPayment);

export default router;
