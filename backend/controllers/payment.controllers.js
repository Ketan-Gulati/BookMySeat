import { instance } from "../config/razorpay.js";
import { Payment } from "../models/payments.models.js";
import { Seat } from "../models/seat.models.js";
import { Show } from "../models/show.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";
import { Booking } from "../models/bookings.models.js";

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { showId, seats } = req.body;

  //   console.log("Before creating order");

  if (!showId) {
    throw new ApiError(400, "ShowId is required");
  }

  if (!Array.isArray(seats)) {
    throw new ApiError(400, "Seats should be an array");
  }

  if (seats.length === 0) {
    throw new ApiError(400, "No seats selected");
  }

  //verify that seats are locked by this user only
  const lockedSeats = await Seat.find({
    _id: { $in: seats },
    status: "LOCKED",
    lockedBy: req.user._id,
    lockExpiry: { $gt: new Date() },
  });

  if (lockedSeats.length !== seats.length) {
    throw new ApiError(409, "Some seats are not locked");
  }

  const show = await Show.findById(showId);

  if (!show) {
    throw new ApiError(404, "Show not found");
  }

  const amount = show.price * seats.length;

  //create razorpay order
  const order = await instance.orders.create({
    amount: amount * 100, // paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  // store payment record
  await Payment.create({
    user: req.user._id,
    show: showId,
    seats,
    amount,
    orderId: order.id,
  });

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
      }
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

    await session.commitTransaction();

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Payment verified and booking confirmed", booking[0]),
      );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export { createPaymentOrder, confirmPayment };
