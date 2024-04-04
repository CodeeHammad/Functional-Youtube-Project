import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import { uploadFileOnCloudinary } from '../utils/cloudinary.js'


const registerUser = asyncHandler(async (req ,res)=>{


    //getting user details  from frontend
    const {fullname , email , username , password} = req.body

    console.log(req.body)

    //checking if the details are not empty
    if ([fullname , email ,username , password].some((inputs)=>inputs?.trim() === "")
        ) {
    throw new ApiError(400 , "all fields are required") 
    }

    //checking if user already existed or not
    const existedUser = User.findOne({
        $or : [{username} , {email} , {fullname}]
    })

    console.log(existedUser)

    if(existedUser){
        throw new ApiError(409 , "User with email , username or fullname already existed")
    }

    //checking for images , check for avatar
      
   const avatarLocalPath =  req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;
   if (!avatarLocalPath) {
    throw new ApiError(400 , "avatar is requried")
   }


   //uploading images to cloudinary 
   const avatar = await uploadFileOnCloudinary(avatarLocalPath)
   const coverImage = await uploadFileOnCloudinary(coverImageLocalPath)

   //checking if avatar is uploaded or not.
   if (!avatar) {
    throw new ApiError(400 , "Avatar is required")
    
   }

   //create object and make entry to database
   const user = await User.create({
    fullname ,
    email,
    avatar :avatar.url,
    coverImage : coverImage?.url || "",
    username : username.toLowerCase()
   })
   //removing password and refreshToken from database
    const createdUser =  await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) {
        throw new ApiError(500 , "something went wrong when creating user")
    }
    // sending ApiResponse to frontend
    return res.status(201).json(
        new ApiResponse(200 , createdUser ,"user registered successfully")
    )
})



export {registerUser}