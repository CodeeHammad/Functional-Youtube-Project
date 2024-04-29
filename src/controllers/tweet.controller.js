import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if (!content || content.trim()==="") {
        throw new ApiError(404 , "fields are empty")
    }
    const tweet = await Tweet.create({
        content , owner : req?.user?._id
    })
    if (!tweet) {
        throw new ApiError(500 , "Tweets are not created something went wrong")
    }
    console.log("congratulations")

    return res.status(200)
    .json(
        new ApiResponse(200 , tweet , "Tweet has been uploaded")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if (!userId) {
        throw new ApiError(404 , "user id is required")
    }
    const tweets = await Tweet.find({
        owner : userId
    })
    if (!tweets) {
        throw new ApiError(404 , "user not found")
    }

    return res.status(200)
    .json(new ApiResponse(200 , tweets , "All tweets has been fetched"))


})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId } = req.params;
    const {content} = req.body
    if (!(tweetId  )) {
        throw new ApiError(404 , "tweet  Id is required ")
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId  , {
        $set:{
            content
        }},
        {
            new : true
        })
        if (!updatedTweet) {
            throw new ApiError(404 , "Tweet is not updated")
        }
        return res.status(200)
        .json(
            new ApiResponse(200 , updatedTweet , "Tweet has been updated")
        )







})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    if (!tweetId) {
        throw new ApiError(404 , "tweet id is requried")
    }
   const findTweet = await Tweet.findById(tweetId)
    console.log("tweet has been finded")
     await Tweet.findByIdAndDelete(tweetId)
    console.log("tweet has been deleted")
    return res.status(200)
    .json(
        new ApiResponse(200 , findTweet , "Tweet has been succesfully deleted")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
