import connectDB from "./DB/connection.js"
import authRouter from "./modules/Auth/auth.controller.js"
import messageRouter from "./modules/Message/message.controller.js"
import userRouter from "./modules/User/user.controller.js"
import cors from "cors"
const bootsrap=async(app,express)=>{
    app.use(express.json());
    app.use(cors())
    await connectDB()
    app.get("/",(req,res)=>{
        return res.status(200).json({message:"Done"})
    })
    app.use("/api/v1/auth",authRouter)
    app.use("/api/v1/message",messageRouter)
    app.use("/api/v1/user",userRouter)
    app.use((err,req,res,next)=>{
        const status=err.cause||500
        return res.status(status).json({message:"something went wrong",
            stack:err.stack,
            error:err.message
        })
    })

    app.get("/*dummy",(req,res)=>{
        return res.status(404).json({message:"userNot handler!!!!"})
    })
    
}

export default bootsrap
//wyah axqu mhlf bbwj
