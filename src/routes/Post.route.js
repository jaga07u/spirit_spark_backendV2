import{Router} from "express"
import {getQuotes,UserPosts,postQuote,deleteQuotes} from "../controllers/Post.controller.js"
import {getCouplets, postCouplet,deleteCouplet} from "../controllers/Couplet.controller.js"
import {getPoem, postPoem,deletePoem} from "../controllers/poem.controller.js";
import {getStories, postStory,deleteStories} from "../controllers/Story.controller.js"
import { verifyJWT } from "../middleware/auth.midlleware.js";
import {upload} from "../middleware/multer.middleware.js";


const router=Router();


router.route("/quote/:limit/:pages").get(verifyJWT,getQuotes);
router.route("/couplet/:limit/:pages").get(verifyJWT,getCouplets);
router.route("/poem/:limit/:pages").get(verifyJWT,getPoem);
router.route("/story/:limit/:pages").get(verifyJWT,getStories);
router.route("/profile/:userId").get(verifyJWT,UserPosts);
router.route("/quote").post(verifyJWT, upload.fields([
    {
        name: "bgImg",
        maxCount: 1,
    }]),postQuote);
router.route("/couplet").post(verifyJWT, upload.fields([
    {
        name: "bgImg",
        maxCount: 1,
    }]),postCouplet);
router.route("/poem").post(verifyJWT, upload.fields([
        {
            name: "bgImg",
            maxCount: 1,
        }]),postPoem);
router.route("/story").post(verifyJWT, upload.fields([
            {
                name: "bgImg",
                maxCount: 1,
            }]),postStory);
router.route("/couplet/:coupletId").delete(verifyJWT, deleteCouplet);
router.route("/poem/:poemId").delete(verifyJWT, deletePoem);
router.route("/story/:storyId").delete(verifyJWT, deleteStories);
router.route("/quote/:quoteId").delete(verifyJWT, deleteQuotes);
export default router
