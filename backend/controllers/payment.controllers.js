import { instance } from "../config/razorpay.js";
import { Payment } from "../models/payments.models.js";
import { Seat } from "../models/seat.models.js";
import { Show } from "../models/show.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";
import { Booking } from "../models/bookings.models.js";
import mongoose from "mongoose";
import { Session } from "../models/session.models.js";

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  //   console.log("Before creating order");

  /* if (!showId) {
    throw new ApiError(400, "ShowId is required");
  }

  if (!Array.isArray(seats)) {
    throw new ApiError(400, "Seats should be an array");
  } */

  /* if (seats.length === 0) {
    throw new ApiError(400, "No seats selected");
  } */

  if (!sessionId) {
    throw new ApiError(400, "SessionId is required");
  }

  const sessionDoc = await Session.findById(sessionId);

  if (!sessionDoc) {
    throw new ApiError(404, "Session not found");
  }

  //validate session
  if (sessionDoc.status !== "PENDING") {
    throw new ApiError(400, "Session is not active");
  }
  if (sessionDoc.expiresAt < new Date()) {
    throw new ApiError(400, "Session expired");
  }

  //if session already exists then reuse it
  if (sessionDoc.orderId) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Order already exists", {
          orderId: sessionDoc.orderId,
        }),
      );
  }

  //verify that seats are locked by this user only
  const lockedSeats = await Seat.find({
    _id: { $in: sessionDoc.seats },
    status: "LOCKED",
    lockedBy: req.user._id,
    lockExpiry: { $gt: new Date() },
  });

  if (lockedSeats.length !== sessionDoc.seats.length) {
    throw new ApiError(409, "Some seats are not locked");
  }

  const show = await Show.findById(sessionDoc.show);

  if (!show) {
    throw new ApiError(404, "Show not found");
  }

  const amount = show.price * sessionDoc.seats.length;

  //create razorpay order
  const order = await instance.orders.create({
    amount: amount * 100, // paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  sessionDoc.orderId = order.id;
  await sessionDoc.save();

  //check whether payment already exists
  const exists = await Payment.find({
    orderId: order.id,
  });
  // store payment record
  if (!exists) {
    await Payment.create({
      user: req.user._id,
      show: sessionDoc.show,
      seats: sessionDoc.seats,
      amount,
      orderId: order.id,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, "Payment order created", {
      orderId: order.id,
      amount,
      currency: "INR",
    }),
  );
});

const confirmPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature } = req.body; //razorpay returns these to frontend
  console.log("Req body", req.body);

  if (!orderId || !paymentId || !signature) {
    throw new ApiError(400, "Payment verification failed");
  }

  // generate signature
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  if (generatedSignature !== signature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    //Atomically update payment....prevents race condition
    const payment = await Payment.findOneAndUpdate(
      {
        orderId,
        status: { $ne: "SUCCESS" }, // prevents duplicate processing
      },
      {
        $set: {
          paymentId,
          razorpaySignature: signature,
          status: "SUCCESS",
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!payment) {
      throw new ApiError(409, "Payment already processed or not found");
    }

    // update seats to BOOKED
    const updatedSeats = await Seat.updateMany(
      {
        _id: { $in: payment.seats },
        show: payment.show,
        status: "LOCKED",
        lockedBy: payment.user,
        lockExpiry: { $gt: new Date() },
      },
      {
        $set: {
          status: "BOOKED",
          lockedBy: null,
          lockExpiry: null,
        },
      },
      { session },
    );

    //check to ensure all seats are updated
    if (updatedSeats.modifiedCount !== payment.seats.length) {
      throw new ApiError(409, "Seat validation failed during booking");
    }

    // create booking
    const booking = await Booking.create(
      [
        {
          user: payment.user,
          show: payment.show,
          seats: payment.seats,
          totalAmount: payment.amount,
          paymentStatus: "SUCCESS",
        },
      ],
      { session },
    );

    await Session.findOneAndUpdate(
      {
        orderId,
      },
      {
        status: "SUCCESS",
      },
      {
        session,
      },
    );

    await session.commitTransaction();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Payment verified and booking confirmed",
          booking[0],
        ),
      );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export { createPaymentOrder, confirmPayment };
