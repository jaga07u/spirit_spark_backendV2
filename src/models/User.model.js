import mongoose,{Schema} from "mongoose";

const UserSchema=new Schema(
    {
        username:{
            type:String,
            required:[true,"username requird"]
        },
        fullname:{
            type:String,
            required:[true,"fullname requird"]
        },
        email:{
            type:String,
            required:[true,"email requird"]
        },
        password:{
            type:String,
            required:[true,"password requird"]
        },
        savedQuote:[
            {
            type:Schema.Types.ObjectId,
            ref:"Quote"
        }
        ]
        ,
        avatarImg:{
            type:String,
            default:"https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png"
        },
        coverImg:{
            type:String
        },
        Token:{
            type:String
        },
        isVerify:{
            type:Boolean,
            default:false
        },
        forgotpasswordToken:{
            type:String
        }

    },
    {timestamps:true}
    );
export const User= mongoose.model("users",UserSchema);