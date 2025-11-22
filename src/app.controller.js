import connectDB from "./DB/connection.js"
import authRouter from "./modules/Auth/auth.controller.js"
import messageRouter from "./modules/Message/message.controller.js"
import userRouter from "./modules/User/user.controller.js"
import cors from "cors"
import path from "path"
import morgan from "morgan"
import { morganMiddleware, morganFor } from "./Utilities/morgan/logger.morgan.js";
import helmet from "helmet"
import { corsOptions } from "./Utilities/cors/cors.utils.js"
import {rateLimit} from "express-rate-limit"
const bootsrap=async(app,express)=>{
    app.use(express.json({limit:"1kb"}));
    // Request logging in development
    if (process.env.NODE_ENV !== 'production') {
        // use custom morgan middleware that writes to file and console
        app.use(morganMiddleware());
    }
    app.use(cors(corsOptions()))
    app.use(helmet())
    const limiter=rateLimit({
        windowMs:15*60*1000,//15 minutes
        max:100,//limit each IP to 100 requests per windowMs
        message:"Too many requests from this IP, please try again later",
        statusCode:429,
        legacyHeaders: false,
    });
    app.use(limiter);
    await connectDB()
    app.get("/",(req,res)=>{
        return res.status(200).json({message:"Done"})
    })
    app.use("/uploads",express.static(path.resolve("./src/uploads")))
    // per-route logging
    app.use("/api/v1/auth", morganFor('auth'), authRouter)
    app.use("/api/v1/message", morganFor('message'), messageRouter)
    app.use("/api/v1/user", morganFor('user'), userRouter)
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
