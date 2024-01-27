import { Router } from "express";
import { registerUser , loginUser , logoutUser , refreshAccessToken} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";


const router = Router();

// syntax ====> upload.fields([{} , {}])
router.route("/register").post( upload.fields([
    {
        name:"avatar",
        maxCount: 1
    }, 
    {
        name:"coverImage",
        maxCount:1

    }]) , 
    registerUser
);

router.route("/login").post(loginUser);

//secure routes
router.route("/logout").post(verifyJWT , logoutUser);
router.route("/refreshAccessToken").post(refreshAccessToken)


export default router;