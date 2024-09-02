import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {Follower} from '../models/Follower.model.js'
import "dotenv/config"


const ToggleFollwer=async(req,res)=>{
    const {id}=req.params
    const CurrentUserId=req.user._id;
    try{
        const conditions ={
            followedTo: CurrentUserId,
            account: id,
          };
          const existingFollower= await Follower.findOne(conditions);
          if (existingFollower) {
            // If the user is already following, remove the follower relationship
            await Follower.findByIdAndDelete(existingFollower) ;
            return res.status(201)
            .json(new ApiResponse(201,existingFollower," Follwer deleted successfully"));
          } else {
            // If the user is not following, add the follower relationship
            const newFollower = await Follower.create({
              followedTo: CurrentUserId,
              account: id,
            });
            return res.status(201)
            .json(new ApiResponse(201,newFollower,"new Follwer added successfully"));
          }

    }catch(e){
        console.log("Error happend in Toggle Follwing",e);
    }
}


export {ToggleFollwer}