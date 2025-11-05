import { Router } from "express";
import * as userService from "./user.service.js"
import { authentication  } from "../../MiddleWare/auth.middleware.js";
import { localFileUpload } from "../../Utilities/multer/local.multer.js";
const router=Router()
router.get("/",userService.listAllUser)
router.patch("/update",authentication ,userService.updateUser)
router.patch("/updateImage",authentication, localFileUpload().single("attachments"),userService.profileImage)

export default router