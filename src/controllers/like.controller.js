import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!videoId) {
        throw new ApiError(404, "Video id is required")
    }
    const video = await Like.findById(videoId)
   video.likedBy = !video.likedBy
    await video.save()
    const toggleVideo = await Like.findById(videoId)
    if (!toggleVideo) {
        throw new ApiError(404, "Video is not like or unlike")
    }
    return res.status(200)
        .json(new ApiResponse(200,toggleVideo , "Api response is successfull"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!commentId) {
        throw new ApiError(404, "Comment id is required")
    }
    const comment = await Like.findById(commentId)
    comment.likedBy = !comment.likedBy
   await comment.save()
    const updatedComment = await Like.findById(commentId)
    if (!updatedComment) {
        throw new ApiError(404, "comment cannot be updated")
    }
    return res.status(200)
        .json(new ApiResponse(200, updatedComment, "Api response is successfull"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!tweetId) {
        throw new ApiError(404, "Tweet id is required")
    }
    const tweet = await Like.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "tweet is not found")
    }
    tweet.likedBy = !tweet.likedBy
    await save()
    const updatedTweet = await Like.findById(tweetId)
    if (!updatedTweet) {
        throw new ApiError(404, "tweet cannot be updated")
    }
    return res.status(200)
        .json(new ApiResponse(200, updatedTweet, "Api response is successfull"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos  = await Like.find({
        Video : likedBy
    })
    if (likedVideos) {
        throw new ApiError(404, "liked video cannot be found")
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