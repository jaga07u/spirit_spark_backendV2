import mongoose,{Schema} from "mongoose";

const StorySchema=new Schema(
    {
        story:{
            type:String,
            required:[true,"Quote required"]
        },
        language:{
            type:String,
            required:[true,"Catagory required"]
        },
        BgImageUrl:{
            type:String,
        },
        TextColor:{
            type:String
        },
        Owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {timestamps:true});

export const Story=mongoose.model("Story",StorySchema);