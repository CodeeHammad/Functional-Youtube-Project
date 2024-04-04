import {asyncHandler} from '../utils/asyncHandler.js'


const registerUser = asyncHandler(async (req ,res)=>{
    res.send("hello guys how are you")
})
export {registerUser}