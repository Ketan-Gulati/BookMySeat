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
import { Show } from "../models/show.models.js";
import { generateSeats } from "../utils/seat.service.js";
import { Seat } from "../models/seat.models.js";
import { Booking } from "../models/bookings.models.js";
import mongoose from "mongoose";

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

  const deleteResponse = await Theatre.deleteOne({ _id: theatreId });

  if (!deleteResponse) {
    throw new ApiError(500, "Error while deleting theatre");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Theatre deleted successfully", {}));
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
const createShow = asyncHandler(async (req, res) => {
  const { movie, theatre, language, showDateTime, price, totalSeats } =
    req.body;

  if (
    [movie, theatre, language, showDateTime, price, totalSeats].some(
      (field) => !field || field === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const movieExists = await Movie.findById(movie);
  if (!movieExists) {
    throw new ApiError(404, "Movie does not exist");
  }

  const theatreExists = await Theatre.findById(theatre);
  if (!theatreExists) {
    throw new ApiError(404, "Theatre does not exist");
  }

  const existingShow = await Show.findOne({ theatre, showDateTime });
  if (existingShow) {
    throw new ApiError(409, "Show already exists for this time");
  }

  const show = await Show.create({
    movie,
    theatre,
    language,
    showDateTime,
    price,
    totalSeats,
    availableSeats: totalSeats,
  });

  //optional extra check
  if (!show) {
    throw new ApiError(500, "Error while creating show");
  }

  //once the show is created, we would be generating seats automatically.... for this we would be a custom seat generation service
  await generateSeats(show._id, totalSeats);

  return res
    .status(201)
    .json(new ApiResponse(201, "Show created successfully", show));
});

//update show
const updateShow = asyncHandler(async (req, res) => {
  const { showId } = req.params;
  const show = await Show.findById(showId);
  if (!show) {
    throw new ApiError(404, "Show not found");
  }

  const updateFields = { ...req.body };

  const updatedShow = await Show.findByIdAndUpdate(
    showId,
    {
      $set: updateFields,
    },
    {
      new: true,
    },
  );

  if (!updatedShow) {
    throw new ApiError(500, "Error while updating show");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Show updated successfully", updatedShow));
});

//delete show
const deleteShow = asyncHandler(async (req, res) => {
  const { showId } = req.params;
  const show = await Show.findById(showId);
  if (!show) {
    throw new ApiError(404, "Show not found");
  }

  const deleteResponse = await Show.deleteOne({ _id: showId });

  if (!deleteResponse) {
    throw new ApiError(500, "Error while deleting show");
  }

  //we also need to delete associated seats
  const deleteSeatResponse = await Seat.deleteMany({ show: showId });

  if (!deleteSeatResponse) {
    throw new ApiError(500, "Error while deleting seats");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Show deleted successfully", {}));
});

//get shows
const getShows = asyncHandler(async (req, res) => {
  const { page } = parseInt(req.query.page) || 1;
  const { limit } = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const shows = await Show.find()
    .populate("movie", "title duration genre")
    .populate("theatre", "theatreName location")
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  if (!shows) {
    throw new ApiError(500, "Error while fetching shows");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Shows fetched successfully", shows));
});

////booking management

//get movies for which bookings exist
const getBookingMovies = asyncHandler(async (req, res) => {
  const movies = await Booking.aggregate([
    {
      $lookup: {
        from: "shows",
        localField: "show",
        foreignField: "_id",
        as: "show",
      },
    },
    {
      $unwind: "$show",
    },
    {
      $lookup: {
        from: "movies",
        localField: "show.movie",
        foreignField: "_id",
        as: "movie",
      },
    },
    {
      $unwind: "$movie",
    },
    {
      $group: {
        _id: "$movie._id",
        title: { $first: "$movie.title" },
        coverImage: { $first: "$movie.coverImage" },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, "Movies fetched successfully", movies));
});

//get theatres for a selected movie - bookings
const getBookingTheatres = asyncHandler(async (req, res) => {
  const { movieId } = req.params;

  const theatres = await Booking.aggregate([
    {
      $lookup: {
        from: "shows",
        localField: "show",
        foreignField: "_id",
        as: "show",
      },
    },
    { $unwind: "$show" },

    {
      $match: {
        "show.movie": new mongoose.Types.ObjectId(movieId),
      },
    },

    {
      $lookup: {
        from: "theatres",
        localField: "show.theatre",
        foreignField: "_id",
        as: "theatre",
      },
    },
    { $unwind: "$theatre" },

    {
      $group: {
        _id: "$theatre._id",
        theatreName: { $first: "$theatre.theatreName" },
        location: { $first: "$theatre.location" },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, "Theatres fetched", theatres));
});

//get shows for selected movie and theatre
const getBookingShows = asyncHandler(async (req, res) => {
  const { movieId, theatreId } = req.query;

  const shows = await Show.find({
    movie: movieId,
    theatre: theatreId,
  }).select("showDateTime price");

  return res.status(200).json(new ApiResponse(200, "Shows fetched", shows));
});

//get bookings for selected show - bookings
const getShowBookings = asyncHandler(async (req, res) => {
  const { showId } = req.params;

  const bookings = await Booking.find({ show: showId })
    .populate("user", "fullName email")
    .populate("seats", "seatNumber")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Bookings fetched", bookings));
});

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
  getShows,
  getBookingMovies,
  getBookingTheatres,
  getBookingShows,
  getShowBookings
};
