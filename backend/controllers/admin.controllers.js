//admin can control a new document for movie, theatre, show
import { Movie } from "../models/movie.models.js";
import { Theatre } from "../models/theatre.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

////movie management

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

  if (!updatedMovie) {
    throw new ApiError(500, "Error while updating movie");
  }

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

  const deleteResponse = await Movie.deleteOne({_id: movieId});

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
    .populate("createdBy", "fullName userName email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (!movies) {
    throw new ApiError(500, "Error while fetching theatre data");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Movies fetched successfully", movies));
});




////theatre management

//create theatre
const createTheatre = asyncHandler(async (req, res) => {
  const { theatreName, location } = req.body;
  if ([theatreName, location].some((field) => !field || field === "")) {
    throw new ApiError(401, "All fields are required");
  }

  const theatre = await Theatre.create({
    theatreName,
    location,
    createdBy: req.user._id,
  });

  if (!theatre) {
    throw new ApiError(500, "Error while creating theatre");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Theatre created successfully", theatre));
});

//update theatre
const updateTheatre = asyncHandler(async (req, res) => {
  const { theatreId } = req.params;
  const theatre = await Theatre.findById(theatreId);
  if (!theatre) {
    throw new ApiError(404, "Theatre not found");
  }
  const updateData = { ...req.body };

  const updatedTheatre = await Theatre.findByIdAndUpdate(
    theatreId,
    {
      $set: updateData,
    },
    {
      new: true,
    },
  );

  if (!updatedTheatre) {
    throw new ApiError(500, "Error while updating theatre");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Theatre updated successfully", updatedTheatre));
});

//delete theatre
const deleteTheatre = asyncHandler(async (req, res) => {
  const { theatreId } = req.params;
  const theatre = await Theatre.findById(theatreId);
  if (!theatre) {
    throw new ApiError(404, "Theatre not found");
  }

  const deleteResponse = await Theatre.deleteOne({_id: theatreId});

  if (!deleteResponse) {
    throw new ApiError(500, "Error while deleting theatre");
  }

  return res.status(200).json(new ApiResponse(200, "Theatre deleted successfully", {}))
});

//get all theatres
const getTheatres = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const theatres = await Theatre.find()
    .populate("createdBy", "fullName userName email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (!theatres) {
    throw new ApiError(500, "Error while fetching theatre data");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Theatre data fetched successfully", theatres));
});



////show management

//create show
const createShow = asyncHandler(async(req, res)=>{});

//update show
const updateShow = asyncHandler(async(req, res)=>{});

//delete show
const deleteShow = asyncHandler(async(req, res)=>{});

//get shows
const getShows = asyncHandler(async(req, res)=>{});

export {
  createMovie,
  updateMovie,
  deleteMovie,
  getMovies,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  getTheatres,
  createShow,
  updateShow,
  deleteShow,
  getShows
};
