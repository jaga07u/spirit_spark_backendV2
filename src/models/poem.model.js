import mongoose,{Schema} from "mongoose";

const PoemSchema=new Schema(
    {
        poem:{
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

export const Poem=mongoose.model("Poem",PoemSchema);