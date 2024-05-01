import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if (!(name )&& (description)) {
        throw new ApiError(404 , " name and description fields are required") }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    })
    if (!playlist) {
        throw new ApiError(404 , "playlist is not created")
    }
    return res.status(200)
    .json(
        new ApiResponse(200 , playlist , "playlist created successfully"))
})



const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!userId) {
        throw new ApiError(200 , "userId is required")
    }
    const userPlaylist = await Playlist.find({owner :  userId})
    if (!userPlaylist) {
        throw new ApiError(404 , "playlist is not found")}
        return res.status(200)
        .json(new ApiResponse(200 , userPlaylist , "playlist successfully fetched"))
})



const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!playlistId) {
        throw new ApiError(404 ,"")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(200 , "playlist doesn't exists")
    }
    return res.status(200)
    .json(new ApiResponse(200 , playlist , "playlist by id fetched successfully"))

})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    //TODO: add video to playlist
    if (!(playlistId) && (videoId)) {
        throw new ApiError(404 ,"playlistId and videoId is required")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404 , "video is not available")
    }
    const addedVideo = await Playlist.findByIdAndUpdate(playlistId,
    {
        $addToSet:{
            video: videoId //$addToSet is useful for ensuring that element remain unique in an array
        }
    },{new : true})
    if (!addedVideo) {
        throw new ApiError(404 , "Video is not added to the playlist")
    }
  return res.status(200)
      .json(new ApiResponse(200, addedVideo, "Api response is successfull"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!(playlistId) && (videoId)) {
        throw new ApiError(404 ,"playlistId and videoId is required")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video is not found")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
    {
        $pull:{video : videoId}
    },{new : true})
 if (!updatedPlaylist) {
    throw new ApiError(404, "Video has not been deleted")
 }
    return res.status(200)
        .json(new ApiResponse(200,  updatedPlaylist, "Api response is successfull"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(404 ,"playlistId  is required")
    }
    const dPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if (!dPlaylist) {
        throw new ApiError(404 , "playlist cannot be deleted")
    }
    return res.status(200)
        .json(new ApiResponse(200, dPlaylist, "Api response is successfull"))
})



const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!playlistId) {
        throw new ApiError(404 ,"playlistId is required")
    }
    if (!(name)&& (description)) {
        throw new ApiError(404 , "name and description is required")
    }
    const playlist = await Playlist.findByIdAndUpdate(playlistId ,
    {
        $set:{
            name, 
            description
        }
    })
    if (!playlist) {
        throw new ApiError(404, "playlist cannot be updated")
    }
    
    return res.status(200)
        .json(new ApiResponse(200, playlist, "Api response is successfull"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
