import mongoose, { Types } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content:{
        type:String,
        required:true,
        minLength:[2,"message must be at least 2 charactrs long"],
        minLength:[500,"message must be at least 500 charactrs long"]

    },
   
    receieverId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"User",
        required:true
    }


  },
  
  { timestamps: true }
);

const messageModel = mongoose.models.Message || mongoose.model("Message", messageSchema);
export default messageModel;
