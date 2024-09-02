import{Router} from "express"
import { verifyJWT } from "../middleware/auth.midlleware.js";
import { ToggleQuoteLike,TogglePoemLike,ToggleCoupletLike,ToggleStoryLike} from "../controllers/Like.controller.js";

const router=Router();


router.route("/quote").post(verifyJWT,ToggleQuoteLike);
router.route("/story").post(verifyJWT,ToggleStoryLike);
router.route("/poem").post(verifyJWT,TogglePoemLike);
router.route("/couplet").post(verifyJWT,ToggleCoupletLike);
export default router