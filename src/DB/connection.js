import mongoose from "mongoose";
 const connectDB=async()=>{
    try
    {
        await mongoose.connect(process.env.DB_URI
            // {serverSelectionTimeoutMS:5000}
        )
        console.log("mongodb connected sussessfully");
        

    }
    catch(error)
    {
        console.log("mongoDB is connection is failed",error);
        

    }
}
export default connectDB