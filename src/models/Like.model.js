import mongoose,{Schema} from "mongoose";

 const likeSchema=new Schema(
    {
       quoteId:{
        type:Schema.Types.ObjectId,
        ref:"Quote"
       },
       LikedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
       }
    },
    
    {timestamps:true});

 const LikeQ= mongoose.model("likes",likeSchema);
const SotrylikeSchema=new Schema(
   {
      storyId:{
       type:Schema.Types.ObjectId,
       ref:"Story"
      },
      LikedBy:{
       type:Schema.Types.ObjectId,
       ref:"User"
      }
   },
   
   {timestamps:true});

 const LikeS= mongoose.model("storylikes",SotrylikeSchema);
const PoemlikeSchema=new Schema(
   {
      poemId:{
       type:Schema.Types.ObjectId,
       ref:"Poem"
      },
      LikedBy:{
       type:Schema.Types.ObjectId,
       ref:"User"
      }
   },
   {timestamps:true});

 const LikeP= mongoose.model("poemlikes",PoemlikeSchema);
const CoupletlikeSchema=new Schema(
   {
      coupletId:{
       type:Schema.Types.ObjectId,
       ref:"Couplet"
      },
      LikedBy:{
       type:Schema.Types.ObjectId,
       ref:"User"
      }
   },
   {timestamps:true});

 const LikeC= mongoose.model("coupletlikes",CoupletlikeSchema);

 export {LikeQ,LikeS,LikeP,LikeC}


