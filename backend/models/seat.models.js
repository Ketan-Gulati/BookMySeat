import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
    show:{
        type: mongoose.Types.ObjectId,
        ref: "Movie",
        required: true,
    },
    seatNumber:{
        type:String,
        required: true,
    },
    status: {
        type: String,
        enum: ["AVAILABLE", "LOCKED", "BOOKED"],
        default: "AVAILABLE"
    },
    lockedBy:{
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    lockExpiry: {
        type: Date
    }
})