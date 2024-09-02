import{Router} from "express"
import {ToggleFollwer} from "../controllers/Follow.controller.js"
import { verifyJWT } from "../middleware/auth.midlleware.js";

const router=Router();

router.route("/:id").post(verifyJWT,ToggleFollwer)

export default router