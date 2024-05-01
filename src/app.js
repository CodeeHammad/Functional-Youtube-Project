import express from 'express'
import cookieParser from "cookie-parser"
import cors from "cors";
const app  = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended : true , limit: "16kb"}))
app.use(express.static("/public"))
app.use(cookieParser())

import router from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import playlistRouter from './routes/playlist.routes.js'

app.use("/users" , router)
app.use("/video" , videoRouter)
app.use("/tweets" , tweetRouter)
app.use("/subscription" , subscriptionRouter)
app.use("/playlist" , playlistRouter)


export  { app }