import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/User.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {UploadOnCloudnary} from '../utils/Cloudinary.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import {v2 as Cloudnary} from 'cloudinary';
import bcrypt from "bcrypt"
import {Quote} from "../models/Quote.model.js"
import {Couplet} from "../models/Couplet.model.js"
import { img_detect, Text_detection } from '../Helper/Generative_AI.js'
import "dotenv/config"


const postCouplet=async(req,res)=>{
     const {couplet,TextColor,image}=req.body;
     console.log(req.body);
     let CoupletImagePath=null;
     const IsImageSafe=await img_detect(image);
     const IsContentSafe=await Text_detection(couplet);
     console.log(IsImageSafe);
     console.log(IsContentSafe);
     if(IsImageSafe == "no" || IsContentSafe == "yes"){
         res.status(200)
         .json({
           success:false
         })
     }
    //  if(req.files?.bgImg){
    //     CoupletImagePath=req.files?.bgImg[0]?.path;
    //  }
    //  let CoupletImage=null;
    //  if(CoupletImagePath){
    //      CoupletImage=await UploadOnCloudnary(CoupletImagePath);
    //  }
     
    //  try{
    //    const CoupletCreate= await Couplet.create({
    //         couplet,
    //         language:"hindi",
    //         TextColor,
    //         BgImageUrl:CoupletImage?.url || "",
    //         Owner:req.user._id
    //       })
    //       console.log(couplet);
    //       if(!CoupletCreate){
    //         throw new ApiError(401,"Sorry Something went wrong");
    //       }
    //     return res.status(201)
    //     .json(new ApiResponse(200,"couplet created Successfully"));
    // }
    //  catch(e){
    //     console.log("Error happend in posing couplet",e);

    //  }
}
const getCouplets=async(req,res)=>{
    const {limit,pages}=req.params;
     console.log(Number(limit))
    // console.log(pages);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const skip = (pages - 1) * limit;
    console.log(skip);
    try{
        const couplets = await Couplet.aggregate([
            {
                $lookup: {
                    from: "coupletlikes",
                    localField: "_id",
                    foreignField: "coupletId",
                    as: "Likes"
                }
            },
            {
                $addFields: {
                    likeCount: { $size: "$Likes" },
                    isLiked: {
                        $cond: {
                            if: { $in: [userId, "$Likes.LikedBy"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $lookup: {
                  from: "followers",
                  localField: "Owner",
                  foreignField: "account",
                  as: "followers"
                }
              },
              {
                $lookup: {
                  from: "followers",
                  localField: "Owner",
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
            {
                $lookup: {
                    from: "users",
                    localField: "Owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
           
            {
                $unwind: "$owner"
            },
            {
                $lookup: {
                    from: "followers",
                    let: { ownerId: "$owner._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$account", "$$ownerId"] },
                                        { $eq: ["$followedTo", userId] } // Check if the current user has followed this account
                                    ]
                                }
                            }
                        }
                    ],
                    as: "followed"
                }
            },
            {
                $addFields: {
                    isFollowed: { $cond: { if: { $gt: [{ $size: "$followed" }, 0] }, then: true, else: false } }
                }
            },
            {
                $sort: { createdAt: -1 } // Sort by creation date in descending order
              },
            {
                $project: {
                    _id: 1,
                    couplet: 1,
                    category: 1,
                    BgImageUrl: 1,
                    BgColor: 1,
                    TextColor: 1,
                    Owner: {
                        _id: "$owner._id",
                        username: "$owner.username",
                        avatar: "$owner.avatarImg"
                    },
                    createdAt: 1,
                    likeCount: 1,
                    followerCount:1,
                    followingCount:1,
                    isLiked: 1,
                    isFollowed: 1 // Add the isFollowed field
                }
            },
            {
                $skip: skip
            },
            {
                $limit: Number(limit)
            }
        ]);
        if(!couplets){
            throw new ApiError(401,"Sorry Couplet is not get")
        }
       // console.log(quotes);
        return res.status(200)
        .json(new ApiResponse(200,{data:couplets},"Get All Quote Successfully"))
    }
    catch(e){
        throw new ApiError(401,"Something went wrong in Getting Couplet",e)
    }
}
const UserCouplets=async(req,res)=>{
    const {userId}=req.params;
    console.log(userId);
     try {
        const couplets = await Couplet.aggregate([
            // Match stage to filter quotes by owner ID
            {
              $match: {
                Owner: new mongoose.Types.ObjectId(userId)
              }
            },
            // Lookup stage to get likes for each quote
            {
              $lookup: {
                from: "coupletlikes",
                let: { coupletId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$coupletId", "$$coupletId"] },
                      LikedBy: new mongoose.Types.ObjectId(userId) // Filter likes by current user
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
        
        if(!couplets){
            throw new ApiError(401,"Sorry Error in fetching quotes")
        }
        
        
         // Replace with the actual user ID
         const userInfo = await User.aggregate([
          // Match stage to filter users by user ID
          {
            $match: {
              _id: new mongoose.Types.ObjectId(userId) // Convert userId to ObjectId
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
        if(!userInfo){
            throw new ApiError(401,"Sorry Error in fetching UserInfo")
        }
        return res.status(201).json(new ApiResponse(201,{
            UserDetails:userInfo,
            couplets:couplets,
          },"User Profile Get Successfully"))
    } catch (error) {
        console.log("Error happend in Getting user Profile",error);
    }
}

const deleteCouplet = async (req, res, next) => {
  try {
    const { coupletId } = req.params;
    
    if (!coupletId) {
      throw new ApiError(400, "Poem ID is required");
    }

    const couplet = await Couplet.findById(coupletId);

    if (!couplet) {
      throw new ApiError(404, "Poem not found");
    }

    const imageUrl = couplet.BgImageUrl;
    const imageUrlParts = imageUrl ? imageUrl.split('/') : [];
    const imagePublicId = imageUrlParts.length > 0 ? imageUrlParts[imageUrlParts.length - 1].split('.')[0] : null;
    // Delete the poem document
    await Couplet.findByIdAndDelete(coupletId);

    // Delete the associated image in Cloudinary
    if (imagePublicId) {
      await Cloudnary.api.delete_resources(imagePublicId, { type: 'upload', resource_type: "image" });
    }

    res.status(200).json(new ApiResponse(200, {}, "couplet deleted successfully"));
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
};
export {postCouplet,getCouplets,UserCouplets,deleteCouplet}