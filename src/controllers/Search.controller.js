import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/User.model.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import "dotenv/config"


const searchUser=async(req,res)=>{
    const query = req.params.username.toLowerCase();
    console.log(query);
    try {
      const users = await User.find({ username: new RegExp(query, 'i') });
      console.log(users);
      if(!users){

      }
     res.status(201)
     .json(new ApiResponse(201,users,"User Searched Successfully"))
    } catch (error) {
      res.status(500).send('Server error');
    }
}
export {searchUser}