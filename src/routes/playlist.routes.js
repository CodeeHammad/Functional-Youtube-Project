import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/create-playlist").post(createPlaylist)//

router.route("/userPlaylist/:userId").get(getUserPlaylists)//

router.route("/p/:playlistId").get(getPlaylistById)//

router.route("/a/:playlistId/a/:videoId").patch(addVideoToPlaylist)//

router.route("/r/:playlistId/r/:videoId").patch(removeVideoFromPlaylist)//

router.route("/:playlistId").delete(deletePlaylist)//

router.route("/u/:playlistId").patch(updatePlaylist)

export default router
