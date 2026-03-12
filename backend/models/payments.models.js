import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seat",
        required: true,
      },
    ],
    amount: {
      type: Number,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String, //payment id should not be required initially... it comes after orderId is created
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
    },
  },
  { timestamps: true },
);

export const Payment = mongoose.model("Payment", paymentSchema);
