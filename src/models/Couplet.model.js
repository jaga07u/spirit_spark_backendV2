import mongoose,{Schema} from "mongoose";

const CoupletSchema=new Schema(
    {
        couplet:{
            type:String,
            required:[true,"Couplet required"]
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

export const Couplet=mongoose.model("Couplet",CoupletSchema);