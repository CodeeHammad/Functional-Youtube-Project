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



const publishAVideo = asyncHandler(async (req ,res)=>{
        // TODO: get video, upload to cloudinary, create video
    const {title , description} = req.body

    if (!(title && description)) {
        throw new ApiError(401 , "Title and Description is required")
    }

    let thumbnailUrlPath; 
    let videoFileUrlPath;
    if (req.files || Array.isArray(req.files.videoFile) ||  req.files.videoFile.length > 0  &&  (Array.isArray(req.files.thumbnail)  || req.files.thumbnail.length > 0 ) ){
      
        videoFileUrlPath = req.files.videoFile[0].path;
        thumbnailUrlPath = req.files.thumbnail[0].path;
    }

    if (!(thumbnailUrlPath &&  videoFileUrlPath)) {
        throw new ApiError(401 , "Video is not uploaded")
    }

     const thumbnailCld =  await uploadFileOnCloudinary(thumbnailUrlPath)
     const videoFileCld =  await uploadFileOnCloudinary(videoFileUrlPath)

    console.log("video and thumbnail is uploaded on cloudinary")

    const video = await Video.create({
        videoFile : videoFileUrlPath ,
        title ,
        description ,
        thumbnail : thumbnailUrlPath , 
        duration : videoFileCld.duration,
   
    })
    console.log("last step is successfull")

    return res.status(200)
    .json(
        new ApiResponse(200 , video ,"video has been successfully uploaded")
    )

})









const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId) {
        throw new ApiError(401 , "video id is required")
    }

    const video = await Video.findById(videoId)
    const videourl = video.url
    
    if(!video){
        throw new ApiError(401 , "video is not available")
    }
    return res.status(200)
    .json(
        new ApiResponse(200 , videourl , " video has been uploaded")
    )

})






const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const {description ,title  } = req.body
    const thumbnailUrlPath = req.file?.path;
    
    if (!thumbnailUrlPath || !(title) || title?.trim() === "" || !(description ) || description?.trim() === "") {
        throw new ApiError(404 , "All fields are required")
    }

    const updatedThumbnailUrl = await uploadFileOnCloudinary(thumbnailUrlPath)
    if (!updatedThumbnailUrl) {
        throw new ApiError(404 , "Thumbnail is not uploaded")
    }

   
    const video = await Video.findByIdAndUpdate(videoId , {
        $set:{
            title ,
            description ,
            thumbnail :thumbnailUrlPath
            }
        
    } ,
    {new : true}
)

console.log(video)
return res.status(200)
    .json(new ApiResponse(
        201,
        video,
        "Video Updated Successfully"
    ))



})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(404 , "video is required")
        
    }
    const findVideo = await Video.findById(videoId)
    if (findVideo) {
        console.log("video has been finded and deleted")
    }
    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new ApiError(404  , "video is not found")
    }
    return res.status(200)
    .json(
        new ApiResponse(200 , video , "video has been deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(404 , "video is required")
    }
    const video = await Video.findById(videoId )
    if (!video) {
        throw new ApiError(404 , "Video is not uploaded")
    }
    video.isPublished = !video.isPublished
    await video.save()

    const updatedVideo = await Video.findById(videoId)
    res.status(200)
    .json(
        new ApiResponse(200 , updatedVideo , "video has been toggled")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
