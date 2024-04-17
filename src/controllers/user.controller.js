import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import { uploadFileOnCloudinary } from '../utils/cloudinary.js'

const generateAccessTokenAndRefreshToken = async (userId)=>{
    try {
        const user = User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
     await user.save({validateBeforeSave: false})
        return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500 , "something went wrong while generating access and refresh token ")
    }
}

const registerUser = asyncHandler(async (req ,res)=>{


    //getting user details  from frontend
    const {fullname , email , username , password} = req.body

    // console.log(req.body)

    //checking if the details are not empty
    if ([fullname ,password, email ,username ,  ].some((field)=>field?.trim() === "")
        ) {
    throw new ApiError(400 , "all fields are required") 
    }

    //checking if user already existed or not
    const existedUser = await User.findOne({
        $or : [{username} , {email} , {fullname}]
    })

    console.log(existedUser)

    if(existedUser){
        throw new ApiError(409 , "User with email , username or fullname already existed")
    }

    //checking for images , check for avatar
      
   const avatarLocalPath =  req.files?.avatar[0]?.path;
//    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 )  {
        coverImageLocalPath = req.files.coverImage[0].path
    }


   if (!avatarLocalPath) {
    throw new ApiError(400 , "avatar is requried")
   }
//    console.log(req.files)

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
    username : username.toLowerCase(),
    password
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

const loginUser = asyncHandler( async (req ,res)=>{
        //todo for this functionality 
        // get data from frontend 
        // find the user
        // password validation  
        // access & refresh token generation
        const {email , username , password} = req.body
        if(!username || !email){
            throw new ApiError(400 , "username or email is required")
        }
        const user = await User.findOne({
            $or : [{username} , {email}]
        })
        if(!user){
            throw new ApiError(401 , "user does not exist")
        }
        const passwordValidation = await user.isPasswordCorrect(password)
        if(!passwordValidation){
            throw new ApiError(401 , "password is incorrect")
        }

       const {accessToken , refreshToken} =  await generateAccessTokenAndRefreshToken(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
        //removing password and refresht token 

        const options = {
            httpOnly : true ,
            secure : true 
        }
        return res.status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
        .json(
            new ApiResponse(200 , {
                user : loggedInUser , accessToken , refreshToken
            }
            , "user logged in succesfully"
        )
        )


    })
const logoutUser = asyncHandler( async( req , res)=>{
   await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken : undefined
            },
            },
        {
            new : true
        }
    )
    
    const options = {
        httpsOnly : true ,
        secure : true 
    }
    return res.status(200 )
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options )
    .json(200 , {} ,"User logged out successfully")
})




export {registerUser , loginUser  , logoutUser}