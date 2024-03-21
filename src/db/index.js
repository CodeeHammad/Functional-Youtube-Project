import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'

const connectDB = async ()=>{

    try {
    const connectionInstance =    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MONGO DB CONNECTED DB HOST:${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`Monodb connection failed here ` , error)
    }

}
export default connectDB





// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";

// const connectDB = async ()=>{
//     try {
        
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log(`MongoDb connected DB HOST:${connectionInstance.connection.host}`)
//     } catch (error) {
//        console.log(`Mongodb connection failed he` , error)
//        process.exit(1)
//     }
// }
// export default connectDB;