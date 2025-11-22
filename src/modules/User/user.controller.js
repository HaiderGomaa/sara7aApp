import { Router } from "express";
import * as userService from "./user.service.js"
import { authentication, authorization, tokenTypeEnum  } from "../../MiddleWare/auth.middleware.js";
import { fileValidation, localFileUpload } from "../../Utilities/multer/local.multer.js";
import { validate } from "../../MiddleWare/validation.Middleware.js";
import { coverImagesSchema, freezeAccountSchema, profileImageSchema } from "./user.validation.js";
import { cloudFileUpload } from "../../Utilities/multer/cloud.multer.js";
import { ROLE } from "../../DB/models/user.model.js";
const router=Router()
router.get("/",userService.listAllUser)
router.patch(
    "/update",
    authentication({ tokenType: tokenTypeEnum.ACCESS }),
    authorization({ accessRole: [ROLE.USER] }),
    userService.updateUser
);
router.patch(
    "/profile-image",
    authentication(),
    authorization({ accessRole: [ROLE.USER, ROLE.ADMIN] }),
    cloudFileUpload({ allowedTypes: [...fileValidation.images] })
    //  localFileUpload({customPath:"User",allowedTypes:fileValidation.images})
        .single("profileImage"),
    validate(profileImageSchema),
    userService.profileImage
);
router.patch(
    "/cover-images",
    authentication(),
    cloudFileUpload({ allowedTypes: [...fileValidation.images] })
        // localFileUpload({customPath:"User",allowedTypes:fileValidation.images})
        .array("coverImages", 4),
    authorization({ accessRole: [ROLE.USER, ROLE.ADMIN] }),
    validate(coverImagesSchema),
    userService.coverImages
);
router.delete(
    "{/:userId}/freeze-account",
    authentication({tokenType: tokenTypeEnum.ACCESS }),
    authorization({accessRole:[ROLE.ADMIN,ROLE.USER]}),
    validate(freezeAccountSchema),
    userService.freezeAccount
)
router.delete(
    "{/:userId}/restored-account",
    authentication({tokenType: tokenTypeEnum.ACCESS }),
    authorization({accessRole:[ROLE.ADMIN,ROLE.USER]}),
    validate(freezeAccountSchema),
    userService.restoredAccount
)

export default router