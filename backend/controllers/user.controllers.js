import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";



//method to generate access and refresh token
const generateTokens = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const refreshToken =  user.generateRefreshToken();
        const accessToken =  user.generateAccessToken();
    
        const hashedToken = await argon2.hash(refreshToken);  //to secure refresh token
        user.refreshToken = hashedToken;
        await user.save({validateBeforeSave : false})     //validateBeforeSave : false will not run any validations and directly save the token
    
        return {refreshToken, accessToken};
    } catch (error) {
        throw new ApiError(500, error);
    }
}

const registerUser = asyncHandler(async(req, res)=>{
    const body = req.body;

    if(!body || Object.keys(req.body).length === 0) throw new ApiError(400, "Empty request body");

    const {fullName, userName, email, password} = req.body;

    //check if any field is absent
    if([fullName, userName, email, password].some((field)=>
        !field || field.trim()===""
    )){
        throw new ApiError(400, "Missing fields");
    }

    //check if user with same email or username exists
    const userExists = await User.findOne({
        $or: [{userName}, {email}]
    });

    if(userExists) throw new ApiError(409, "User with same email or username already exists");

    //create new user document
    const newUser = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email: email.toLowerCase(),
        password
    })

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if(!createdUser) throw new ApiError(500, "Something went wrong while trying to register");

    const {refreshToken, accessToken} =  await generateTokens(newUser._id);

    const options = {
        httpOnly: true,
        /* secure: true,
        sameSite: "None", */
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    }

    return res.status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(201,createdUser,"Registation successful")
    )
})

const loginUser = asyncHandler(async(req, res)=>{
    const {userName, email, password} = req.body;

    if(!(email || userName)){
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{email}, {userName}]
    })

    if(!user) throw new ApiError(401, "User not found");

    const isPasswordValid = await user.isCorrectPassword(password);

    if(!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

    const {accessToken, refreshToken} = await generateTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        /* secure: true,
        sameSite: "None", */
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    }

    return res.
    status(200)
    .cookie("accessToken",accessToken,options) 
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200, "User logged in successfully", loggedInUser)
    )
})

const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(req.user._id, {
        $unset: {
            refreshToken: 1  // this removes the field from the document
        }
    },
    {
            new : true
    }
)

    const options = {
        httpOnly: true,
        /* secure: true,
        sameSite: "None", */
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Logged out successfully", {}));
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Refresh token not found");
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken._id).select("+refreshToken");

    if(!user){
        throw new ApiError(401, "Invalid refresh token");
    }

    const valid = await argon2.verify(
        user.refreshToken,
        incomingRefreshToken
    )

    if(!valid){
        throw new ApiError(401, "Refresh token mismatch");
    }

    const newAccessToken = user.generateAccessToken();

    const options = {
        httpOnly: true,
        /* secure: true,
        sameSite: "None", */
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    }

    return res
    .status(200)
    .cookie("accessToken", newAccessToken)
    .json(new ApiResponse(200,"Access token refershed", {}))
})

export {registerUser, loginUser,logoutUser,refreshAccessToken};