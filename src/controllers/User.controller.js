import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/User.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {UploadOnCloudnary} from '../utils/Cloudinary.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import {v2 as cloudinary} from 'cloudinary';
import bcrypt from "bcrypt"
import { Quote } from '../models/Quote.model.js'
import "dotenv/config"
const generateAccessAndRefresToken=async(userId)=>{
    try {
        const user=await User.findById(userId);
        // console.log(user);
           const Token=jwt.sign(
            {
               _id:user?._id,
               username:user?.username,
               email:user?.email,
               avatarImg:user?.avatarImg,
               fullname:user?.fullname
            },process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_SECRET_EXPIRY }
         )
         // console.log(AccessToken);
         // console.log(refreshToken);
      return {Token};
    } catch (error) {
       throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
 }

 const registerUser=async (req,res)=>{
    try {
        const {username,email,fullname,password}=req.body;
        console.log("email:",email);
       //  if(fullname === ""){
       //     throw new ApiError(400,"full name is required")
       //  }
          if(
           [fullname,email,username,password].some((field)=> field?.trim() === ""
           )
          ){
             throw new ApiError(400,"All fields are required")
          }
         const existenUser= await User.findOne({
           $or:[{username} , {email}]
          } //{email}
          )
          
          if(existenUser){
           throw new ApiError(409,"User with email or user name already exists")
          }
           // console.log(req.files);
           const avatar=null;
       const avatarLocalPath= req.files?.avatar[0]?.path;
         if(avatarLocalPath){
          // throw new ApiError(400,"Avatar file is required")
            avatar=await UploadOnCloudnary(avatarLocalPath);
        }
       
        //console.log(avatar);
        // if(!avatar){
        //    throw new ApiError(400,"avatar file is required");
        // }
        const hashPass=await bcrypt.hash(password,10);
         const user=await User.create(
           {
               fullname,
               avatar: avatar?.url || " ",
               email,
               password:hashPass,
               username:username.toLowerCase()
           }
        )
       
       const createdUser= await User.findById(user._id).select(
           "-password -refreshToken"
       )
       if(!createdUser){
           throw new ApiError(500,"Something went wrong when user register");
       }
       
       return res.status(201).json(
           new ApiResponse(200,createdUser,"User registerd Successfully")
       )
    } catch (error) {
        console.log("User Register Error");
    }
 }

 const LoginUser=async (req,res)=>{
   console.log(req.body);
    const {email,password}=req.body;
    const user=await User.findOne({email:email});
    //console.log(user);
    if(!user){
        return res.status(400)
        .json(new ApiResponse(400,{},"Email does not exists")); 
    }
    const IspasswordCorrect=await bcrypt.compare(password,user.password);
    console.log(IspasswordCorrect);
    if(!IspasswordCorrect){
       throw new Error("Invalid password")
    }
    const {Token}=await generateAccessAndRefresToken(user._id);
    user.Token=Token;
   await  user.save({validateBeforeSave:false})
   const options={
    httpOnly:true,
    secure:true,
 }
   return res.status(200)
   .cookie("accessToken",Token,options)
   .json(new ApiResponse(200,{data:user,accessToken:Token},"user loggin  successfully")); 
 }

 const LoginUserQuote=async(req,res)=>{
   const UserId=new mongoose.Types.ObjectId(req.user._id);


    try {
         const quotes = await Quote.aggregate([
    // Match stage to filter quotes by owner ID
    {
      $match: {
        Owner: new mongoose.Types.ObjectId(UserId)
      }
    },
    // Lookup stage to get likes for each quote
    {
      $lookup: {
        from: "likes",
        let: { quoteId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$quoteId", "$$quoteId"] },
              LikedBy: new mongoose.Types.ObjectId(UserId) // Filter likes by current user
            }
          }
        ],
        as: "userLikes" // Store user's likes in a separate field
      }
    },
    // Add field to calculate number of likes for each quote
    {
      $addFields: {
        likeCount: { $size: "$userLikes" }, // Total likes
        isLikedByCurrentUser: { $cond: { if: { $gt: [{ $size: "$userLikes" }, 0] }, then: true, else: false } } // Check if current user has liked the post
      }
    },
    // Project stage to shape the output
    {
      $project: {
        quote: 1, // Keep the quote ID,
        BgImageUrl: 1,
        BgColor: 1,
        TextColor: 1,
        likeCount: 1, // Number of likes for each quote
        isLikedByCurrentUser: 1 // Field indicating if the current user has liked the post
      }
    }
  ]);

  const userInfo = await User.aggregate([
    // Match stage to filter users by user ID
    {
      $match: {
        _id: new mongoose.Types.ObjectId(UserId) // Convert userId to ObjectId
      }
    },
   // Lookup stage to get follower count
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "account",
        as: "followers"
      }
    },
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "followedTo",
        as: "following"
      }
    },
    // Count the number of followers
    {
      $addFields: {
        followerCount: { $size: "$followers" },
        followingCount: { $size: "$following" }
      }
    },
    //Project stage to shape the output
    {
      $project: {
        _id: 1, // Exclude user ID from the output
        username:1,
        fullname:1,
        avatarImg:1,
        followerCount: 1, // Number of followers
        followingCount: 1 // Number of followings
      }
   }
  ]);

  return res.status(201).json(new ApiResponse(201,{
    UserDetails:userInfo,
    quotes:quotes,
  },"Profile Get Successfully"))

    } catch (error) {
        console.log("Error Happen in Fetching User Quotes",error);
    }
}

const LogoutUser=async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
        $unset: {
            Token: 1 // this removes the field from document
        }
    },
    {
        new: true
    }
)
console.log("User logedout");
const options = {
    httpOnly: true,
    secure: true
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User logged Out"))
}
const UpdateUserProfile=async(req,res)=>{
     const {username,fullname}=req.body;
     const userId=req.user._id;
     let UpdateavatarLocalPath=null;
     const file=req.files || null;
     console.log(req.files);
     if(file?.avatar){
      UpdateavatarLocalPath=req.files?.avatar[0]?.path;
    }
   // console.log(UpdateavatarLocalPath);
     let updatedAvatar=null;
     if(UpdateavatarLocalPath){
      console.log(UpdateavatarLocalPath);
      updatedAvatar=await UploadOnCloudnary(UpdateavatarLocalPath);
     // console.log(updatedAvatar);        
     }
    // console.log(updatedAvatar);
     if(updatedAvatar){
      const newData={username,fullname,avatarImg:updatedAvatar?.url}
      const UpdateUser=await User.findByIdAndUpdate(
         userId,
         newData,{
            new:true
         }
      )
       if(!UpdateUser){
             throw new ApiError(402,"Error happend at Updated user")
       }
      return res.status(201).
      json(new ApiResponse(201,UpdateUser,"User profile Updated"))
     }
     else{
      const newData={username,fullname,avatarImg:req.user?.avatarImg}
      const UpdateUser=await User.findByIdAndUpdate(
         userId,
         newData,{
            new:true
         }
      )
      if(!UpdateUser){
        throw new ApiError(402,"Error happend at Updated user with no file")
  }

  return res.status(201).
  json(new ApiResponse(201,UpdateUser,"User profile Updated"))
    
}
    
}

const ForgotPassword=async (req,res)=>{
  const { email, password, confirmPassword } = req.body;

// Check if any field is empty
if ([email, password, confirmPassword].some((field) => field?.trim() === "")) {
  throw new Error("All fields are required");
}
console.log(password);
console.log( confirmPassword);


// Check if passwords match
if (password !== confirmPassword) {
  return res.status(400).json(new ApiResponse(400, {}, "Passwords do not match"));
}
try {
  const user = await User.findOne({ email: email });
  
  if (!user) {
    return res.status(400).json(new ApiResponse(400, {}, "Email does not exist"));
  }

  // Hash the new password before saving
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(confirmPassword, salt);
  await user.save();

  return res.status(201).json(new ApiResponse(201, {}, "Password reset successful"));
} catch (error) {
  return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
}

}


export {registerUser,LoginUser,LoginUserQuote,LogoutUser,UpdateUserProfile,ForgotPassword}
