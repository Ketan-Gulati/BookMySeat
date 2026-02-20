import mongoose from "mongoose";
import argon2 from "argon2";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
    },
    userName:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password:{
        type: String,
        required: [true, "password is required"],
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    bookings:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
    }],
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    },
    refreshToken: {
        type: String,
        select: false,  //so it doesn’t get returned normally
    }
}, {timestamps:true});


//password hashing before saving
userSchema.pre("save", async function(next){
    if(!this.isModified('password')) return next();
    this.password = await argon2.hash(this.password);
})

//verifying hashed password
userSchema.methods.isCorrectPassword = async function(password){
    return await argon2.verify(this.password,password);
}

//generating access token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
           _id: this._id,
           email: this.email,
           userName: this.userName,
           fullName: this.fullName,
           role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//generating refresh token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
           _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);