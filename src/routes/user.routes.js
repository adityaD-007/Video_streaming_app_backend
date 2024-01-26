import { Router } from "express";
import { registerUser } from "../controllers/register.js";
import { upload } from "../middlewares/multer.js";

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

    }]) , registerUser);


export default router;