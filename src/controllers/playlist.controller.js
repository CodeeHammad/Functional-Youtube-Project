import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if (!(name )&& (description)) {
        throw new ApiError(404 , " name and description fields are required")
    }
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
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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
