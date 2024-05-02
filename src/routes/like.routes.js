import { Router } from "express";

import {verifyJWT} from '../middlewares/auth.middleware.js'

import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
import { healthcheck } from "../controllers/healthcheck.controller.js";


const router = Router()

router.use(verifyJWT)

router.route("/video/:videoId").patch(toggleVideoLike)

router.route("/comment/:commentId").patch(toggleCommentLike)

router.route("/tweet/:tweetId").patch(toggleTweetLike)

router.route("/getlikeVideos").patch(getLikedVideos)

router.route("/health-check").get(healthcheck)

export default router