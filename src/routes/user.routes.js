import { Router } from "express";
import { 
    registerUser ,
    loginUser , 
    logoutUser , 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getChannelProfile,
    getWatchHistory,
} from "../controllers/user.controller.js";
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

router.route("/refreshAccessToken").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-details").patch(verifyJWT, updateAccountDetails);  //----Patch method it is

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/channel/:username").get(verifyJWT, getChannelProfile);

router.route("/history").get(verifyJWT, getWatchHistory);



export default router;