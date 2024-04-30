import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    // checking channel id 
    //checking if channel is subscriber throw's error
    //if already subscribed ,  unsubscribed 
    // create subscription
    // return res 

    if (!channelId) throw new ApiError(404 , "user id is required")
    if (!isValidObjectId(channelId)) throw new ApiError(404 , "channel id is not a valid object") 
    if (req.user?._id.toString() === channelId.toString() ){
        throw new ApiError("you cannot subscribed to your own channel")
    }

    const subscription = await Subscription.findOne({
        channel : channelId,
        subscriber : req.user?._id
    })
      if (subscription) {
        await Subscription.findByIdAndDelete({_id : subscription._id})
        return res.status(200)
        .json(new ApiResponse(200 , "unsubscribed successfully"))
    }
    const subscribed = await Subscription.create({
        channel : channelId,
        subscriber : req.user?._id
    })
    return res.status(200)
    .json(new ApiResponse(200 , "channel is subscribed successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    //channel id from req.params 
    // FIND CHANNEL LIST 
    //RETURN CHANNEL LIST 
    if (!channelId) throw new ApiError(404 , "user id is required")
    if (!isValidObjectId(channelId)) throw new ApiError(404 , "channel id is not a valid object") 
    const subscribers = await Subscription.aggregate([
        {
            $match:{
                //it filters the document in mongo db and gives us a new set of docs based on the channelId we provided
                channel : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from : "users",
                localField:"subscriber",
                foreignField:"_id",
                as: "subscriber"
            }
        },
        {
            $addFields:{ //returns the first elemnt from an array
                subscriber:{ $arrayElemAt : ["$subscriber" , 0] }
            }
        },
        {
            $project:{
                subscriber:{
                    _id : 1,
                    username : 1,
                    fullname : 1,
                    email:1 ,
                    avatar: 1

                }
            }
        }
    ])
    if (!subscribers) {
        throw new ApiError(404 , "No subscriber found")
    }
    return res.status(200)
    .json(new ApiResponse(200 , subscribers  , "subscribers found successfully"))


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) throw new ApiError(404 , "subscriber  id is required")
    if (!isValidObjectId(subscriberId)) throw new ApiError(404 , "subscriber id is not a valid object") 

    const channel = await Subscription.aggregate([
        {
            $match: new mongoose.Types.objectId(subscriberId)
        },
        {
            $lookup:{
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as:"channel"
            }
        },
        {
            $addFields:{
                channel:{ $arrayElemAt: ["$channel" , 0] }
            }
        },
        {
            $project:{
               channel:{
                fullname : 1,
                username:1,
                email:1,
                avatar,
                _id:1
               }
            }
        }
    ])


    if (!channel) {
        throw new ApiError(404 , "something went wrong")
    }
    return res.status(200)
    .json(
        new ApiResponse(200 , channel , "Subscribed channels are fetched successfully")
    )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}