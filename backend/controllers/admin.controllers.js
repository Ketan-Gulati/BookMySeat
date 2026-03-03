//admin can control a new document for movie, theatre, show
import { Movie } from "../models/movie.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

//movie management

//create movie
const createMovie = asyncHandler(async (req, res) => {
  const { title, duration, genre, description, rating } = req.body;

  if (
    [title, duration, genre, description, rating].some(
      (field) => !field || field === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const coverLocalPath = req.file?.path;

  if (!coverLocalPath) {
    throw new ApiError(400, "Cover image is required");
  }

  const uploadedImage = await uploadOnCloudinary(coverLocalPath);

  if (!uploadedImage) {
    throw new ApiError(500, "Error while uploading cover image");
  }

  const movie = await Movie.create({
    title,
    coverImage: uploadedImage.secure_url,
    duration,
    genre,
    description,
    rating,
    createdBy: req.user._id,
  });

  if (!movie) {
    throw new ApiError(500, "Error while creating movie");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Movie created successfully", movie));
});

//update movie fields
const updateMovie = asyncHandler(async (req, res) => {
  const { movieId } = req.params;

  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  const updatedData = { ...req.body };

  if (req.file?.path) {
    const uploaded = await uploadOnCloudinary(req.file.path);
    updatedData.coverImage = uploaded.secure_url;
  }

  const updatedMovie = await Movie.findByIdAndUpdate(
    movieId,
    {
      $set: updatedData,
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Movie data updated", updatedMovie));
});

//delete a movie
const deleteMovie = asyncHandler(async (req, res) => {
  const { movieId } = req.params;

  const movie = await Movie.findById(movieId);

  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  const deleteResponse = await Movie.deleteOne({ _id: movieId });

  if (!deleteResponse) {
    throw new ApiError(500, "Error while deleting the movie");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Movie deleted successfully", {}));
});

//get all movies
const getMovies = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const movies = await Movie.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Movies fetched successfully", movies));
});


//theatre management

//create theatre
const createTheatre = asyncHandler(async(req, res)=>{

})

//update theatre
const updateTheatre = asyncHandler(async(req, res)=>{

})

//delete theatre
const deleteTheatre = asyncHandler(async(req, res)=>{

})

//get all theatres
const getTheatres = asyncHandler(async(req, res)=>{

})
export { createMovie, updateMovie, deleteMovie, getMovies, createTheatre, updateTheatre, deleteTheatre, getTheatres };
