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
    const user = await User.findById(req.user?._id , {_id: 1})
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

    const {userId} = req.params;
    if (!userId) {
        throw new ApiError(404 , "User id is required")
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(404 , "User id is not valid")
    }
    const {page = 1 , limit = 10 } = req.query;
    const user = await User.findById(userId).select("_id")
    if (!user) {
        throw new ApiError(404 , "User is not found")
    }
    const tweetAggregate = Tweet.aggregate([
        {
            $match:
            { owner : new mongoose.Types.ObjectId(user?._id)} 
        },
        {
            $lookup:{
                from : "users",
                localField:"owner",
                foreignField:"_id",
                as: "owner",
                pipeline:[
                    {
                        $project:{
                            _id : 1 ,
                            username : 1,
                            avatar : $avatar.url,
                            fullname : 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner : {
                    $first:$owner
                }
            }
        },
        {
            $sort:{
                createdAt : -1
            }
        }
    ])
        if (!tweetAggregate) {
            throw new ApiError(404 , "Tweets not found")
        }

        const options = {
            page : parseInt(page),
            limit:parseInt(limit),
            customLabels:{
                totalDocs : "totalTweets",
                docs : "tweets"
            },
            skip:(page - 1 )*limit
        }
        Tweet.aggregatePaginate(tweetAggregate , options)
        .then(results=>{
            console.log("congratulations")
            if (results.length === 0 ) {
            return res.status(200 )
            .json( 
                new ApiResponse(200  , results, "No Tweets Found")
                )
            }
            return res.status(200)
            .json(
                new ApiResponse(200 , results , "Tweets fetched successfully")
            )
        }).catch(error =>{
            console.log("something went wrong " , error)
            throw new ApiError(404 , error?.message || "tweets cannot be displayed")
        })


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
