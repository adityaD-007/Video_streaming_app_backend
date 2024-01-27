import {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIErrors.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary} from "../utils/cloudinaryFileUploader.js"


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


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
    console.log(`user is here ${user}`);

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})



const loginUser = asyncHandler( async(req , res)=>{

    //take email/username password from body
    // verify if they are present
    // check user with username exist or not --- not then error
    //compare password
    //if true then access & refresh token generate 
    //send cookies

    const {username , email , password} = req.body;

    if(!username && !email){ // both not present

        throw new ApiError(400 , "Username or email required !");
    }

    const existedUser = await User.findOne( {$or: [ {username} , {email} ] } );

    if(!existedUser){
        throw new ApiError(404 , "User does not exist!");
    }

    const passwordCheck = await existedUser.checkPassword(password);

    if(!passwordCheck){
        throw new ApiError( 401 , "Enter correct password")
    }

    //Here we can write a function to generate this .... but me ethe ch kela ....... still function vrti ahe
    //const { accessToken , refreshToken } = await generateAccessAndRefereshTokens(existedUser._id);

    const accessToken = existedUser.generateAccessToken();
    const refreshToken = existedUser.generateRefreshToken();

    existedUser.refreshToken = refreshToken
    await existedUser.save({ validateBeforeSave: false })  // see the notes

    existedUser.refreshToken = "";
    existedUser.password = "";
    //lso we can do it like this .....
    //const createdUser = await User.findById(existedUser._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    // By default anyone could modify/write cookies 
    // But by doing these to options "true" .... now they are only modifiable by server

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: existedUser, accessToken, refreshToken
                // Here we again sending access/refresh Token .... cuz if user need to store locally / NO  cookie in app development 
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser  = asyncHandler( async(req , res)=>{

    const {userId }= req.user._id;

    await User.findByIdAndUpdate( userId , { $set:{refreshToken:undefined} } , { new: true} );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))    
})







export { 
    registerUser, 
    loginUser,
    logoutUser
};