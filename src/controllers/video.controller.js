import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadFileOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req , res)=>{
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = 1 ,
        userId
    } = req.query;
 // dont use await because it will be not able to populate properly with aggregate pipeline in the next step 
    const matchCondition = {
        $or:[
            { title : { $regex : query , $options : "i"}},
            { description : { $regex : query , $options : "i"}}
        ]
    }
      //.owner is the property of matchCondition  object 
     // if there is user id the the matchCondition.owner prperty will be set to new mongoDB objectId 
    if (userId) {
        matchCondition.owner = new mongoose.Types.ObjectId(userId)
    }

    var videoAggregate ;
    try {
       videoAggregate = Video.aggregate(
        [
            { // this filter the document base on the matchCondition 
                $match : matchCondition
            },
            {
                $lookup:{
        // this stage perform a left outer join with the user model  in which the video model owner is matched with the user model _id
                    from: "users",
                    localField : "owner",
                    foreignField : "_id",
                    as : "owner",
         
        
                    pipeline:[{
         // this pipeline will only include the field we specified here and all other fields of the users document will be excluded
                        $project:{
         // to project specifi fields from documents users 
         // $project is used to include , exclude , rename or create new field  in the output document 
         // 1 means to include the fields
                            _id : 1 ,
                            _id : 1,
                            avatar: "$avatar.url",
                            fullname :1 ,
                            username : 1
                        }
                    }]
                }
            },
            {
                $addFields:{
         // this stage is used to add new fields to each document in aggregation pipeline.

         //the $first operator use to return only the first elemnt from the array that has been returned from the lookup field if multiple documents in the "users" collection match the condition for a single document in the "Video" collection, MongoDB returns an array containing all matching documents for that particular document in the "Video" collection.

               owner:{
             //By using $first, we ensure that only the first document from the array of matched documents in the $lookup stage is selected and added to the owner field of each video document.  
            $first: "$owner"
          }
                }
            },
            {
                $sort:{
                     //The sorting criteria are specified using an object where the keys represent the field(s) to sort by, and the values represent the sorting order (1 for ascending order, -1 for descending order).
                    [sortBy || "createdAt" ] : parseInt(sortType) || 1 
                }
            }
        ]
       )
    } catch (error) {
        console.error("Error in aggregation : ",error)
        throw new ApiError(404 , error?.message || "error in aggreagation")
    }

    const options = {
         // denotes the current page number
        page , 
          // denotes how many documents to be returned based on limit
        limit,
         // it is used to specify alternative names for certain metadata fields in pagination results
         // to rename the fields name
        customLabels : {
            totalDocs : "totalVideos",
            docs: "videos"
        },
        // to skip for 2nd page the first 10(limit) vidoes
        skip : (page - 1)*limit,
          // to treat limit as integer
        limit : parseInt(limit), 
    }
    Video.aggregatePaginate(videoAggregate ,options)
    .then(result =>{
        if (result?.videos?.length === 0 && userId) {
            return res.status(200)
            .json(new ApiResponse(200 , [] , "videos is not found"))
        }
        return res.status(200)
        .json(
            new ApiResponse(200 , result , "videos has been fetched")
        )
    }).catch(error=>{
        console.log("Error : ",error)
        throw new ApiError(404 , error?.message || "error in aggreagation")})
    
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
