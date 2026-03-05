import mongoose from "mongoose";
import { User } from "./user.models.js";

const theatreSchema = new mongoose.Schema({
    theatreName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    location:{
        type: String,
        required: true,
        lowercase: true,
    },
    createdBy:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true})

export const Theatre = mongoose.model("Theatre", theatreSchema);