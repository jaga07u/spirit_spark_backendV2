import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {LikeQ,LikeS,LikeC,LikeP} from "../models/Like.model.js"
import "dotenv/config"


const ToggleQuoteLike=async(req,res)=>{
    const {quoteId}=req.body;
    const CurrentUserId=req.user._id;
    try{
        const conditions = { quoteId: quoteId, LikedBy: CurrentUserId};
        const existingLike = await LikeQ.findOne(conditions);       
        if (!existingLike) {
            const newLike = await LikeQ.create({ quoteId: quoteId, LikedBy: CurrentUserId });
            return res.status(201)
            .json(new ApiResponse(201,newLike,"Like Created successfully")); 
        } else {
            const removedLike = await LikeQ.findOneAndDelete(conditions);
            return res.status(201)
            .json(new ApiResponse(201,removedLike,"Like Removed successfully")); 
    }
}
    catch(e){
        console.log("Error Happend in Toggle Like")
    }

}
const ToggleStoryLike=async(req,res)=>{
    const {storyId}=req.body;
    console.log(storyId);
    
    const CurrentUserId=req.user._id;
    try{
        const conditions = { storyId: storyId, LikedBy: CurrentUserId};
        const existingLike = await LikeS.findOne(conditions);       
        if (!existingLike) {
            const newLike = await LikeS.create({ storyId: storyId, LikedBy: CurrentUserId });
            return res.status(201)
            .json(new ApiResponse(201,newLike,"Like Created successfully")); 
        } else {
            const removedLike = await LikeS.findOneAndDelete(conditions);
            return res.status(201)
            .json(new ApiResponse(201,removedLike,"Like Removed successfully")); 
    }
}
    catch(e){
        console.log("Error Happend in Toggle Like")
    }

}
const TogglePoemLike=async(req,res)=>{
    const {poemId}=req.body;
    const CurrentUserId=req.user._id;
    try{
        const conditions = { poemId: poemId, LikedBy: CurrentUserId};
        const existingLike = await LikeP.findOne(conditions);       
        if (!existingLike) {
            const newLike = await LikeP.create({ poemId: poemId, LikedBy: CurrentUserId });
            return res.status(201)
            .json(new ApiResponse(201,newLike,"Like Created successfully")); 
        } else {
            const removedLike = await LikeP.findOneAndDelete(conditions);
            return res.status(201)
            .json(new ApiResponse(201,removedLike,"Like Removed successfully")); 
    }
}
    catch(e){
        console.log("Error Happend in Toggle Like")
    }

}
const ToggleCoupletLike=async(req,res)=>{
    const {coupletId}=req.body;
    console.log(coupletId);
    const CurrentUserId=req.user._id;
    try{
        const conditions = { coupletId: coupletId, LikedBy: CurrentUserId};
        const existingLike = await LikeC.findOne(conditions);       
        if (!existingLike) {
            const newLike = await LikeC.create({ coupletId: coupletId, LikedBy: CurrentUserId });
            return res.status(201)
            .json(new ApiResponse(201,newLike,"Like Created successfully")); 
        } else {
            const removedLike = await LikeC.findOneAndDelete(conditions);
            return res.status(201)
            .json(new ApiResponse(201,removedLike,"Like Removed successfully")); 
    }
}
    catch(e){
        console.log("Error Happend in Toggle Like")
    }

}

export {ToggleQuoteLike,ToggleCoupletLike,ToggleStoryLike,TogglePoemLike}