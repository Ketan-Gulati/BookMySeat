import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
    movie:{
        type: mongoose.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    theatre:{
        type: mongoose.Types.ObjectId,
        ref: "Theatre",
        required: true
    },
    showDateTime:{
        type: Date,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    totalSeats:{
        type: Number,
        required: true,
    },
    availableSeats:{
        type: Number,
        required: true,
    }
}, {timestamps: true})

export const Show = mongoose.model("Show", showSchema);