import {Router} from "express"
import {registerUser,LoginUser,
 LoginUserQuote, LogoutUser,
  UpdateUserProfile,ForgotPassword} from "../controllers/User.controller.js"
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.midlleware.js";
import {searchUser} from "../controllers/Search.controller.js"


const router=Router();


router.route("/signup").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
          }
    ]),
    registerUser
)
router.route("/update").patch(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
          }
    ]),
    verifyJWT,
    UpdateUserProfile
)
router.route("/signin").post(LoginUser);
router.route("/signout").delete(verifyJWT,LogoutUser);
router.route("/forgotpassword").patch(ForgotPassword);
router.route("/profile").get(verifyJWT,LoginUserQuote);
router.route("/search/:username").get(verifyJWT,searchUser);
export default router;