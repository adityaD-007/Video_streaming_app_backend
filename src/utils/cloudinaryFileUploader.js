import {v2 as cloudinary} from "cloudinar";
import fs from "fs";


cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (path)=>{

        try{
                if(!path) return null;

                response = await cloudinary.uploader.upload(path , {resource_type : "auto"});
                console.log("file is uploaded on cloudinary ", response);
                return response;

        }catch(error){
                fs.unlinkSync(path) // remove the locally saved temporary file as the upload operation got failed
                console.log("File upload to cloudinary failed !!!")
                return null;

        }
}

export {uploadOnCloudinary}