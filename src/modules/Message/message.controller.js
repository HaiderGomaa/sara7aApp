import { Router } from "express";
import * as messageService from "../Message/message.service.js"
const router=Router()
router.post("/send-message/:recieverId",messageService.sendMessage)
router.get("/get-message",messageService.getMessage)

export default router