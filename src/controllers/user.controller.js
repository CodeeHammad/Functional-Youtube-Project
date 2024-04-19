import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import { uploadFileOnCloudinary } from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'
const generateAccessTokenAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
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
        if(!(username || email)){
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
                refreshToken : 1
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
    return res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options )
    .json(new ApiResponse(200 , {} , "User logged out successfully"))
}) 
const refreshAccessToken = asyncHandler(async (req , res)=>{
    //getting refresh token from cookies
   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken 

   //checking refresh token 
   if (!incomingRefreshToken) {
    throw new ApiError(401 , "unauthorized request")
   }
  try {
     //verifying refresh token with the refresh token in db
      const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
  
      //finding user by id from decoded token 
      const user = User.findById(decodedToken?._id)
  
      if(!user){
          throw new ApiError(401 , "Invalid Refresh Token")
      }
      //matching the token to generate a new refresh token 
  
      if(incomingRefreshToken !== user?.refreshToken){
          throw new ApiError(401 , "Refresh token is expired or used")
      }
  
      //creating options 
      const options = {
          httpOnly: true ,
          secure : true
      }
      
      //generating new refresh token 
     const {accessToken , newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
  
     //sending response to frontend
     return res.status(200)
     .cookie("accessToken" , accessToken , options)
     .cookie("refreshToken" , newRefreshToken, options)
     .json(
      new ApiResponse(200 , {accessToken , refreshToken: newRefreshToken }, "Access token refreshed successfully")
     ) 
  
  } catch (error) {
    throw new ApiError(401 , error?.message || "Invalid Refresh Token")
  }

})

const changeUserPassword = asyncHandler(async (req , res)=>{
    //getting input fields from frontend
    const {oldPassword , newPassword , confirmPassword} = req.body 
    if (!(newPassword === confirmPassword)) {
        throw new ApiError(401 , "Password doesn't Match")
    }
    //finding User 
    const user = await User.findById(req.user?._id)
    //checking old password is correct or not
    const checkPassword = await user.isPasswordCorrect(oldPassword)
    //throwing error
    if (!checkPassword) {
        throw new ApiError(400 , "Invalid Password")
    }
    //assinging new password
    user.password = newPassword

    //saving password to db
    await user.save({validateBeforeSave : false})
    
    //sending response 
    return res.status(200)
    .json( new ApiResponse(200 , {} , "Password Changed Successfully"))

})

const getCurrentUser = asyncHandler(async (req ,res)=>{
    return res.status(200)
    .json(new ApiResponse(200 , req.user , "current user fetched successfully") )
})

const updateAccountDetails = asyncHandler(async (req , res)=>{
    //getting details from user 
    const {fullname , email} = req.body
    if(!(fullname || email)){
        throw new ApiError(400 , "All fields are required")
    }

    //finding user and upadating user details 
    const user = await User.findByIdAndUpdate(req.user?_id ,
         {$set: {
        fullname : fullname ,
        email : email
    }} , { new : true}).select("-password")

    return res.status(200)
    .json(new ApiResponse(200 , { } , "Account details updated successfully"))
})

//updating files

const updateAvatar = asyncHandler(async (req , res)=>{
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400 , "Avatar file is missing")
    }

  const avatar = await  uploadFileOnCloudinary(avatarLocalPath)
  if (!avatar.url) {
    throw new ApiError(400 , "Error while uploading avatar")
  }

 const user =  await User.findByIdAndUpdate(req.user?._id, {$set:{
    avatar : avatar.url
  }} , {new :true }).select("-password")

  return res.status(200)
  .json(200 , new ApiResponse(200 , user , "Avatar is updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req , res)=>{
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400 , "Cover Image is missing")
    }

  const coverImage = await  uploadFileOnCloudinary(coverImageLocalPath)
  if (!coverImage.url) {
    throw new ApiError(400 , "Error while uploading cover Image")
  }

 const user =  await User.findByIdAndUpdate(req.user?._id, {$set:{
    coverImage : coverImage.url
  }} , {new :true }).select("-password")

  return res.status(200)
  .json(200 , new ApiResponse(200 , user , "Cover Image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req , res)=>{
    const {username} = req.params
    if (!username) {
        throw new ApiError(400 , "Invalid username ") 
    }
       const channel =  await User.aggregate([
        {
            $match:{
                username : username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from : "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as : "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as : "subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size : "subscribers"
                },
                subscribedToChannel :{
                    $size : "subscribedTo"
                },
                isSubscribed : {
                    $cond:{
                        if:{ $in:[req.user?._id] , "$subscribers.subscriber"},
                        then:{true},
                        else:{false}
                    }
                }
            }
        },
        {
            $project:{
                fullname : 1,
                avatar : 1,
                email : 1,
                subscriberCount: 1,
                subscribedToChannel: 1,
                isSubscribed : 1 ,
                coverImage:1 ,
                username : 1
            }
        }
       ])

       if (!channel?.length) {
        throw new ApiError(400 , "channel does not exist ")
       }
       
       return res.status(200)
       .json(  new ApiResponse(200 , channel[0] , "user channel fetched successfully "))
})

export {registerUser , loginUser  , logoutUser , refreshAccessToken , changeUserPassword , getCurrentUser , updateAccountDetails , updateAvatar , updateUserCoverImage}