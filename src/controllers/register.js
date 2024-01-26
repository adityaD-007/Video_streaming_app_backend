import {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIErrors.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary} from "../utils/cloudinaryFileUploader.js"

const registerUser = asyncHandler(async(req , res )=>{


    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {username , fullName , email , password} = req.body;

    if( [fullName, email, username, password].some((field) => field?.trim() === "") ){
        throw new ApiError(400 , "All fields are required !!");
    }

    const username_temp = username.toLowerCase();


    const existedUser = await User.findOne({
        $or: [{ username:username_temp }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarPath = req.files?.avatar[0]?.path;
    let coverImagePath ;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagePath = req.files.coverImage[0].path
    }

    if(!avatarPath){
        throw new ApiError(400 , "avatar is required.")
    }
    const avatar= await uploadOnCloudinary(avatarPath);
    const coverImage = await uploadOnCloudinary(coverImagePath);
    

    if(!avatar){
        throw new ApiError(500 , "Something went wrong while uploading avatar");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username_temp
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //  console.log(`req.body is here ${req.body}`);
    console.log(`=============================================================================`);
    console.log(`user is here ${user}`);

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

export { registerUser};