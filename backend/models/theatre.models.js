import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema({
    theatreName: {
        type: String,
        required: true,
    },
    location:{
        type: String,
        required: true,
    }
}, {timestamps: true})

export const Theatre = mongoose.model("Theatre", theatreSchema);