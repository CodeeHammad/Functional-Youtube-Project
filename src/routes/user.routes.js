import { Router } from "express";
import { 
        changeUserPassword,
        getCurrentUser,
        getUserChannelProfile,
        getWatchHistory,
        loginUser,
        logoutUser,
        refreshAccessToken,
        registerUser,
        updateAccountDetails,
        updateAvatar,
             
        updateUserCoverImage

             } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields(
        [ {
            name : "avatar",
            maxCount : 1
        }, {
            name : "coverImage",
            maxCount : 1
        }]
        ),
    registerUser)

router.route("/login").post(loginUser) //
router.route("/logout").post(verifyJWT , logoutUser)//
router.route("/refresh-token").post(refreshAccessToken)//
router.route("/change-password").post(verifyJWT , changeUserPassword)//
router.route("/current-user").post(verifyJWT , getCurrentUser)//
router.route("/update-account").patch(verifyJWT , updateAccountDetails)//
router.route("/avatar").patch(verifyJWT , upload.single("avatar") , updateAvatar)//
router.route("/coverImage").patch(verifyJWT , upload.single("coverImage") , updateUserCoverImage)  //
router.route("/c/:username").get(verifyJWT , getUserChannelProfile) //
router.route("/watchHistory").get(verifyJWT , getWatchHistory)//
export default router