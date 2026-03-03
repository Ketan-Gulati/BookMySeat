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
    language:{
            type: String,
            required: true,
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
    },
    isActive:{
        type: Boolean,
        default: true
    }
}, {timestamps: true})

export const Show = mongoose.model("Show", showSchema);