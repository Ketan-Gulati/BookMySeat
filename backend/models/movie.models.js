import mongoose, { mongo } from "mongoose";

const movieSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
        unique: true,
    },
    coverImage:{
        type: String,
        required: true,
    },
    duration:{
        type: Number,   //in minutes
        required: true,
    },
    genre:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true,
    },
    rating:{
        type: String,
        required: true,
    },
    language:{
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true,
    }
},{timestamps: true})

export const Movie = mongoose.model("Movie", movieSchema);