import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";



const router = Router()
router.use(verifyJWT)
router.route("/toggle/:channelId").patch(toggleSubscription)
router.route("/subscribers/:channelId").get(getUserChannelSubscribers)
router.route("/channels").get(getSubscribedChannels)

export default router