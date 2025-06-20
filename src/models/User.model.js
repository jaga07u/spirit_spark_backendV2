import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username required"]
    },
    fullname: {
      type: String,
      required: [true, "Full name required"]
    },
    email: {
      type: String,
      required: [true, "Email required"],
      unique: true
    },
    password: {
      type: String,
      // not required for Google OAuth users
      required: function () {
        return !this.googleId;
      }
    },
    googleId: {
      type: String,
      default: null
    },
    avatarImg: {
      type: String,
      default:
        "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png"
    },
    coverImg: {
      type: String
    },
    Token: {
      type: String
    },
    savedQuote: [
      {
        type: Schema.Types.ObjectId,
        ref: "Quote"
      }
    ],
    isVerify: {
      type: Boolean,
      default: false
    },
    forgotpasswordToken: {
      type: String
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("users", UserSchema);
