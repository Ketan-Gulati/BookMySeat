import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import argon2 from "argon2";


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

export {registerUser}