import mongoose from "mongoose";


const sessionSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    show: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Show",
        required: true,
        index: true
    },
    seats:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seat",
            required: true
        },
    ],
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "EXPIRED"],
      default: "PENDING",
      index: true,
    },
    bookingKey:{
        type: String,
        required: true,
        unique: true   //necessary to prevent race conditions and also ensure idempotency
    },
    orderId: {
        type: String   // Razorpay order ID
    },
    expiresAt:{
        type: Date,
        required: true,
        index: true
    }
},{timestamps: true})

//TTL(Time to live) for auto deletion
sessionSchema.index(
    {expiresAt: 1},      //Creates an index on the expiresAt field
    {expireAfterSeconds: 0}  //elete exactly at the time stored in expiresAt
)


export const Session = mongoose.model("Session", sessionSchema);