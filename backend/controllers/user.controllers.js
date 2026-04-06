import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Movie } from "../models/movie.models.js";
import mongoose from "mongoose";
import { Show } from "../models/show.models.js";
import { Seat } from "../models/seat.models.js";
import { Booking } from "../models/bookings.models.js";

////auth logic

//method to generate access and refresh token
const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    const hashedToken = await argon2.hash(refreshToken); //to secure refresh token
    user.refreshToken = hashedToken;
    await user.save({ validateBeforeSave: false }); //validateBeforeSave : false will not run any validations and directly save the token

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const body = req.body;

  if (!body || Object.keys(req.body).length === 0)
    throw new ApiError(400, "Empty request body");

  const { fullName, userName, email, password } = req.body;

  //check if any field is absent
  if (
    [fullName, userName, email, password].some(
      (field) => !field || field.trim() === "",
    )
  ) {
    throw new ApiError(400, "Missing fields");
  }

  //check if user with same email or username exists
  const userExists = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (userExists)
    throw new ApiError(409, "User with same email or username already exists");

  //create new user document
  const newUser = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email: email.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken",
  );

  if (!createdUser)
    throw new ApiError(500, "Something went wrong while trying to register");

  const { refreshToken, accessToken } = await generateTokens(newUser._id);

  const options = {
    httpOnly: true,
    /* secure: true,
        sameSite: "None", */
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(201, createdUser, "Registation successful"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!(email || userName)) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) throw new ApiError(401, "User not found");

  const isPasswordValid = await user.isCorrectPassword(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    /* secure: true,
        sameSite: "None", */
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "User logged in successfully", loggedInUser));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from the document
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    /* secure: true,
        sameSite: "None", */
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Logged out successfully", {}));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", user));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );

  const user = await User.findById(decodedToken._id).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const valid = await argon2.verify(user.refreshToken, incomingRefreshToken);

  if (!valid) {
    throw new ApiError(401, "Refresh token mismatch");
  }

  const newAccessToken = user.generateAccessToken();

  const options = {
    httpOnly: true,
    /* secure: true,
        sameSite: "None", */
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, options)
    .json(new ApiResponse(200, "Access token refershed", {}));
});

////core logic

//get all movies
const getMovies = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const movies = await Movie.find()
    .select("-createdBy")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Movies fetched successfully", movies));
});

//get movie details
const getMovieDesc = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const movie = await Movie.findById(movieId).select("-createdBy");
  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Movie description fetched successfuly", movie));
});

//get shows by movie id
const getShowsByMovieId = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  const shows = await Show.aggregate([
    {
      $match: {
        movie: new mongoose.Types.ObjectId(movieId),
      },
    },
    {
      $lookup: {
        from: "theatres",
        localField: "theatre",
        foreignField: "_id",
        as: "theatre",
      },
    },
    {
      $unwind: "$theatre",
    },
    {
      $group: {
        _id: "$theatre._id",
        theatreName: { $first: "$theatre.theatreName" },
        location: { $first: "$theatre.location" },
        shows: {
          $push: {
            showId: "$_id",
            time: "$showDateTime",
            price: "$price",
            language: "$language",
          },
        },
      },
    },
    {
      $project: {
        _id: 0, //we hide default id generated by monogdb bcz we would need theatre objectId
        theatreId: "$_id", //rename _id
        theatreName: 1,
        location: 1,
        shows: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, "Shows fetched successfully", shows));
});

//get seats for particular show
const getShowSeats = asyncHandler(async (req, res) => {
  const { showId } = req.params;
  const show = await Show.findById(showId);
  if (!show) {
    throw new ApiError(404, "Show not found");
  }

  const seats = await Seat.find({ show: showId })
    .select("-show")
    .sort({ seatNumber: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Seats fetched successfully", seats));
});

//lock the selected seats with concurrency checks...prevents race conditions
const lockSeats = asyncHandler(async (req, res) => {
  const { showId, seats } = req.body; //an array of seatIds will be received
  // console.log(seats);

  if (!Array.isArray(seats)) {
    throw new ApiError(400, "Seats must be an array");
  }

  const MAX_SEATS = 10;

  if (seats.length > MAX_SEATS) {
    throw new ApiError(400, `You can book maximum ${MAX_SEATS} seats`);
  }

  if (!seats || seats.length === 0) {
    throw new ApiError(400, "No seats selected");
  }

  const seatsFromDB = await Seat.find({
    _id: { $in: seats },
  });
  //security check if seats belong to same show or not
  const invalidSeat = seatsFromDB.find(
    (seat) => seat.show.toString() !== showId,
  );

  if (invalidSeat) {
    throw new ApiError(400, "Seats do not belong to this show");
  }

  //additional security check
  if (seatsFromDB.length !== seats.length) {
    throw new ApiError(400, "Invalid seat IDs");
  }

  const session = await mongoose.startSession(); //to group all DB ops
  session.startTransaction();

  //for sessions and transactions we need to use try catch
  try {
    const lockedSeats = [];

    for (let seatId of seats) {
      /* const seat = await Seat.findById(seatId);     //this line is bad for concurrency, it will lead to double bookings...we better use just atomic update with condition
      if (!seat) {                               
        throw new ApiError(404, "Seat not found");
      } */

      const seat = await Seat.findOneAndUpdate(
        { _id: seatId, status: "AVAILABLE", show: showId },
        {
          status: "LOCKED",
          lockedBy: req.user._id,
          lockExpiry: new Date(Date.now() + 5 * 60 * 1000),
        },
        {
          new: true,
          session,
        },
      );

      if (!seat) {
        throw new ApiError(409, "Seat already booked or locked");
      }

      lockedSeats.push(seat);
    }

    await session.commitTransaction();

    return res
      .status(201)
      .json(new ApiResponse(201, "Seats locked successfully", lockedSeats));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

//after payment succeeds, confirm booking and also create a booking
/* const confirmBooking = asyncHandler(async (req, res) => {
  const { showId, lockedSeats } = req.body;

  const show = await Show.findById(showId);

  if (show.availableSeats < lockedSeats.length) {
    throw new ApiError(409, "Not enough seats available");
  }

  if (!lockedSeats || lockedSeats.length === 0) {
    throw new ApiError(400, "No seats locked");
  }

  const seatsFromDB = await Seat.find({
    _id: { $in: lockedSeats },
  });

  for (let seat of seatsFromDB) {
    if (seat.status === "BOOKED") {
      throw new ApiError(409, "Seat already booked");
    }

    if (seat.status !== "LOCKED") {
      throw new ApiError(409, "Seat not locked");
    }
    if (seat.lockedBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Seat locked by another user");
    }
    if (seat.lockExpiry < new Date()) {
      throw new ApiError(403, "Seat lock expired");
    }
  }

  await Seat.updateMany(
    //updateMany because we might be updating multiple seat status at once
    {
      _id: { $in: lockedSeats },
    },
    {
      $set: {
        status: "BOOKED",
        lockedBy: null,
        lockExpiry: null,
      },
    },
  );

  await Show.findByIdAndUpdate(showId, {
    $inc: { availableSeats: -lockedSeats.length },
  });

  //calculate total price
  const totalAmount = show.price * lockedSeats.length;

  const booking = await Booking.create({
    user: req.user._id,
    show: showId,
    seats: lockedSeats,
    totalAmount,
    paymentStatus: "SUCCESS",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Seats booked successfully", booking));
}); */

//get user booking history
const bookingHistory = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate({
      path: "show",
      populate: [
        //to populate deeply
        { path: "movie" },
        { path: "theatre" },
      ],
    })
    .populate("seats")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Booking history fetched successfully", bookings),
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  getMovies,
  getMovieDesc,
  getShowsByMovieId,
  getShowSeats,
  lockSeats,
  // confirmBooking,
  bookingHistory,
};
