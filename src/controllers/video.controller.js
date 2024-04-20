import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadFileOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})







const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!(title || description)) {
        throw new ApiError(401 , "Title and Description is required")
    }


    if (!(req.files || req.files.videoFile || req.files.videoFile.length > 0)) {
        throw new ApiError(400 , "video is not uploaded")
    }

    let videoFilePath ;
    let thumbnailURL;
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0 && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
         videoFilePath = req.files?.videoFile[0].path;
        thumbnailURL = req.files?.thumbnail[0].path
        
    }
    // const videoFilePath = req.files?.videoFile[0].path;
    console.log(videoFilePath)
    console.log(thumbnailURL)
   
    if (!videoFilePath) {
        throw new ApiError(401 , "video is required")
    }
   const videoResponse  =    await uploadFileOnCloudinary(videoFilePath);
   const thumbnailRespone = await uploadFileOnCloudinary(thumbnailURL)
    const video = await Video.create({
        videoFile : videoFilePath,
        thumbnail : thumbnailURL,
        title , description ,
        duration : videoResponse.duration,
        views : videoResponse.views,
    })

    
    return res.status(200 )
    .json(
        new ApiResponse(200 , video, "video is been uploaded succesfully" )
    )


    // let videoPath ;
    // if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0){
    //     videoPath = req.files.videoFile[0].path
    // }
    // const videoFile = await uploadFileOnCloudinary(videoPath)
    // const video = await Video.create({videoFile})



    // if(!(req.files || req.files.videoFile || req.files.videoFile.length === 0)){
    //     throw new ApiError(400 , "video is not uploaded")
    // }
    // const videoPath = req.files.videoFile[0].path;
    // await uploadFileOnCloudinary(videoPath)
    // const video = await Video.create({
    //     title,
    //     description,
        
    // })
    // return res.status(201).json(
    //     new ApiResponse(200 , video , "video uploaded successfully")
    // )
})









const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
