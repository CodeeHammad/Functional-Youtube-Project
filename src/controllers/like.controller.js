import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from '../models/video.model.js'

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!videoId) {
        throw new ApiError(404, "Video id is required")
    }
    const likedVideo = await Like.findOne({video : videoId , likedBy: req.user?._id})
    if (likedVideo) {
        await Like.findByIdAndDelete(likedVideo?._id)     
        return res.status(200)
            .json(new ApiResponse(200, "video has been unlike"))
    }
    const likeVideo = await Like.create({video: videoId , likedBy : req.user?._id })
    if (!likeVideo) {
        throw new ApiError(404, "video cannot be liked")
    }
    return res.status(200)
        .json(new ApiResponse(200, likeVideo, "video has been liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!commentId) {
        throw new ApiError(404, "Comment id is required")
    }
    const likedComment = await Like.findOne({commnet : commentId , likedBy : req.user?._id})
    if (likedComment) {
        await Like.findByIdAndDelete(likedComment?._id)
        return res.status(200)
            .json(new ApiResponse(200,likedComment , "comment has been unliked"))
    }

    const likeComment = await Like.create({comment : commentId , likedBy:req.user?._id}) 
    return res.status(200)
        .json(new ApiResponse(200,likeComment, "comment has been liked successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!tweetId) {
        throw new ApiError(404, "Tweet id is required")
    }
//    if (isValidObjectId(tweetId)) {
//     throw new ApiError(404, "tweet id is not valid object id")
//    }
   const likedTweet = await Like.findOne({ tweet : tweetId , likedBy:req.user?._id})
//    if (!likedTweet) {
//     throw new ApiError(404, "Tweet is not found")
//    }
   if (likedTweet) {
    const unlikeTweet =  await Like.findByIdAndDelete(likedTweet?._id)
    return res.status(200)
        .json(new ApiResponse(200, "Tweet has been unliked"))
   }
   const likeTweet = await Like.create( { tweet : tweetId , likedBy : req.user?._id})
   if (!likeTweet) {
        throw new ApiError(200, "Tweet cannot be liked")
   }
   return res.status(200)
       .json(new ApiResponse(200, likeTweet, "Api response is successfull"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy : req.user?._id
            }
        },
        {
            $lookup:{
                from : "videos",
                localField:"video",
                foreignField:"_id",
                 as : "likedVideos"
            }
        },
        {
            $addFields:{
                likedVideos:{
                $first : "$likedvideos"}
            }
        },
        {
            $project:{
                likedVideos:{
                    _id : 1,
                    title : 1
                }
            }
        }
    ])

if (!likedVideos) {
    throw new ApiError(404 , "videos cannot be find")
}
return res.status(200)
    .json(new ApiResponse(200, likedVideos, "Api response is successfull"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}