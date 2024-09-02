import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/User.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {UploadOnCloudnary} from '../utils/Cloudinary.js'
import {v2 as Cloudnary} from "cloudinary"
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import {v2 as cloudinary} from 'cloudinary';
import bcrypt from "bcrypt"
import {Quote} from "../models/Quote.model.js"
import { Poem } from '../models/poem.model.js'
import { Couplet } from '../models/Couplet.model.js'
import { Story } from '../models/Story.model.js'
import "dotenv/config"
import { img_detect, Text_detection } from '../Helper/Generative_AI.js'
import fs from "fs/promises"

const postQuote=async(req,res)=>{
     const {quote,TextColor,image}=req.body;
   //  console.log(req.body);
     
     const QuoteImg=req.files?.bgImg[0];
     const QuoteImagePath= req.files?.bgImg[0]?.path;
    //  const imageBuffer = await fs.readFile(QuoteImagePath);
    //  const base64Image = imageBuffer.toString('base64');
    // console.log(QuoteImg);
     
    //  const Image = {
    //   inlineData: {
    //     data: image ,
    //     mimeType: QuoteImg.mimetype
    //   }
    // };
    // console.log(Image);
    
    const IsImageSafe=await img_detect(image);
    const IsContentSafe=await Text_detection(quote);
    console.log(IsImageSafe);
    console.log(IsContentSafe);
    if(IsImageSafe == "no" || IsContentSafe == "yes"){
        res.status(200)
        .json({
          success:false
        })
    }
    
    //  if(!QuoteImagePath){
    //     throw new ApiError(400,"Avatar file is required")
    //  }
    //  const QuoteImage=await UploadOnCloudnary(QuoteImagePath);
    //  try{
    //    const QuoteCreate= await Quote.create({
    //         quote,
    //         language:"hindi",
    //         TextColor,
    //         BgImageUrl:QuoteImage.url || "",
    //         Owner:req.user._id
    //       })
    //       if(!QuoteCreate){
    //         throw new ApiError(401,"Sorry Something went wrong");
    //       }
    //     return res.status(201).json(new ApiResponse(200,"Post created Successfully"));
    //  }
    //  catch(e){
    //     console.log("Error happend in posing Quote",e);

    //  }
}
const getQuotes=async(req,res)=>{
    const {limit,pages}=req.params;
     console.log(Number(limit))
    // console.log(pages);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const skip = (pages - 1) * limit;
    console.log(skip);
    try{
        const quotes = await Quote.aggregate([
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "quoteId",
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
                    quote: 1,
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
        if(!quotes){
            throw new ApiError(401,"Sorry Quote is not get")
        }
       // console.log(quotes);
        return res.status(200)
        .json(new ApiResponse(200,{data:quotes},"Get All Quote Successfully"))
    }
    catch(e){
        throw new ApiError(401,"Something went wrong in Getting Quote",e)
    }
}
const UserPosts = async (req, res) => {
  const { userId } = req.params;
  const currUserId = new mongoose.Types.ObjectId(req.user._id);
  
  try {
    const quotes = await Quote.aggregate([
      {
        $match: {
          Owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "quoteId",
          as: "Likes",
        },
      },
      {
        $addFields: {
          likeCount: { $size: "$Likes" },
          isLikedByCurrentUser: {
            $cond: {
              if: { $in: [currUserId, "$Likes.LikedBy"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          type: { $literal: "quote" },
          quote: 1,
          BgImageUrl: 1,
          BgColor: 1,
          TextColor: 1,
          likeCount: 1,
          isLikedByCurrentUser: 1,
        },
      },
    ]);

    const stories = await Story.aggregate([
      {
        $match: {
          Owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "storylikes",
          localField: "_id",
          foreignField: "storyId",
          as: "Likes",
        },
      },
      {
        $addFields: {
          likeCount: { $size: "$Likes" },
          isLikedByCurrentUser: {
            $cond: {
              if: { $in: [currUserId, "$Likes.LikedBy"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          type: { $literal: "story" },
          story: 1,
          BgImageUrl: 1,
          BgColor: 1,
          TextColor: 1,
          likeCount: 1,
          isLikedByCurrentUser: 1,
        },
      },
    ]);

    const poems = await Poem.aggregate([
      {
        $match: {
          Owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "poemlikes",
          localField: "_id",
          foreignField: "poemId",
          as: "Likes",
        },
      },
      {
        $addFields: {
          likeCount: { $size: "$Likes" },
          isLikedByCurrentUser: {
            $cond: {
              if: { $in: [currUserId, "$Likes.LikedBy"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          type: { $literal: "poem" },
          poem: 1,
          BgImageUrl: 1,
          BgColor: 1,
          TextColor: 1,
          likeCount: 1,
          isLikedByCurrentUser: 1,
        },
      },
    ]);

    const couplets = await Couplet.aggregate([
      {
        $match: {
          Owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "coupletlikes",
          localField: "_id",
          foreignField: "coupletId",
          as: "Likes",
        },
      },
      {
        $addFields: {
          likeCount: { $size: "$Likes" },
          isLikedByCurrentUser: {
            $cond: {
              if: { $in: [currUserId, "$Likes.LikedBy"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          type: { $literal: "couplet" },
          couplet: 1,
          BgImageUrl: 1,
          BgColor: 1,
          TextColor: 1,
          likeCount: 1,
          isLikedByCurrentUser: 1,
        },
      },
    ]);

    const userInfo = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "followers",
          localField: "_id",
          foreignField: "account",
          as: "followers",
        },
      },
      {
        $lookup: {
          from: "followers",
          localField: "_id",
          foreignField: "followedTo",
          as: "following",
        },
      },
      {
        $addFields: {
          followerCount: { $size: "$followers" },
          followingCount: { $size: "$following" },
        },
      },
      {
        $lookup: {
          from: "followers",
          let: { ownerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$account", "$$ownerId"] },
                    { $eq: ["$followedTo", currUserId] },
                  ],
                },
              },
            },
          ],
          as: "followed",
        },
      },
      {
        $addFields: {
          isFollowed: {
            $cond: {
              if: { $gt: [{ $size: "$followed" }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          fullname: 1,
          avatarImg: 1,
          followerCount: 1,
          followingCount: 1,
          isFollowed: 1,
        },
      },
    ]);

    if (!userInfo || userInfo.length === 0) {
      throw new ApiError(401, "Sorry, error in fetching UserInfo");
    }

    // Combine all posts into a single array
    const allPosts = [...quotes, ...stories, ...poems, ...couplets];

    // Sort the combined array if needed, e.g., by creation date
    // allPosts.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          UserDetails: userInfo[0],
          posts: allPosts,
        },
        "User Profile Get Successfully"
      )
    );
  } catch (error) {
    console.log("Error happened in Getting user Profile", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const deleteQuotes = async (req, res, next) => {
  try {
    const { quoteId } = req.params;
    
    if (!quoteId) {
      throw new ApiError(400, "Poem ID is required");
    }

    const quote = await Quote.findById(quoteId);

    if (!quote) {
      throw new ApiError(404, "Poem not found");
    }

    const imageUrl = quote.BgImageUrl;
    const imageUrlParts = imageUrl ? imageUrl.split('/') : [];
    const imagePublicId = imageUrlParts.length > 0 ? imageUrlParts[imageUrlParts.length - 1].split('.')[0] : null;
    // Delete the poem document
    await Quote.findByIdAndDelete(quoteId);

    // Delete the associated image in Cloudinary
    if (imagePublicId) {
      await Cloudnary.api.delete_resources(imagePublicId, { type: 'upload', resource_type: "image" });
    }

    res.status(200).json(new ApiResponse(200, {}, "quote deleted successfully"));
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
};

export {postQuote,getQuotes,UserPosts,deleteQuotes}