import{Router} from "express"
import {getQuotes,UserPosts} from "../controllers/Post.controller.js"
import {UserCouplets} from '../controllers/Couplet.controller.js'
import {UserPoems} from "../controllers/poem.controller.js"
import {UserStories} from '../controllers/Story.controller.js'
import { verifyJWT } from "../middleware/auth.midlleware.js";

const router=Router();


router.route("/post/:userId").get(verifyJWT,UserPosts);
// router.route("/couplet/:userId").get(verifyJWT,UserCouplets);
// router.route("/story/:userId").get(verifyJWT,UserStories);
// router.route("/poem/:userId").get(verifyJWT,UserPoems);
export default router