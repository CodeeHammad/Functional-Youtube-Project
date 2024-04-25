import { Router } from "express";
import { deleteVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)
router.route("/publish-video").post(
    upload.fields(
        [{
            name : "videoFile",
            maxCount : 1
        } ,{
            name : "thumbnail", 
            maxCount : 1
        }
    ]
    )
    , publishAVideo
)
router.route("/:videoId").get(getVideoById)
router.route("/:videoId").patch(upload.single("thumbnail") , updateVideo)
router.route("/:videoId").delete(deleteVideo)
router.route("/:videoId").put(togglePublishStatus)

export default router

// {
//     "videoId" : "662412317e94f056dc893f32"
// }