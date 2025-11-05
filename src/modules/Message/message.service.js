import userModel from "../../DB/models/user.model.js"
import * as dbService from "../../DB/db.service.js"
import messageModel from "../../DB/models/message.model.js"
import { successResponse } from "../../Utilities/successResponse.utilities.js"
export const sendMessage=async(req,res,next)=>{

    const {content}=req.body
    const {receieverId}=req.params

    const user=await dbService.findById(
        {
            model:userModel,
            id:receieverId
        }
    )
    if(!user){
        return next (new Error("receiver not found",{cause:404}))
    }
    const message =await dbService.create({
        model:messageModel,
        data:[
            {content,
        receieverId : user._id}
        ]
    })
     return successResponse({
          res,
          statusCode: 201,
          message: "message sent successfully",
          data:{message}
        });
}
export const getMessage=async(req,res,next)=>{

   
    const message=await dbService.find(
        {
            model:messageModel,
            populate:[
                {path:"receieverId",select:"firstName lastName gender email -_id"}
            ]
        }
    )
   
   
     return successResponse({
          res,
          statusCode: 200,
          message: "message fetched successfully",
          data:{message}
        });
}