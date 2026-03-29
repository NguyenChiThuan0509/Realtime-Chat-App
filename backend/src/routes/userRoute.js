import express from "express";
import { authMe, patchAvatar, searchByUsername } from "../controllers/userController.js";
import { uploadAvatarMiddleware } from "../middlewares/uploadAvatar.js";

const router = express.Router();

router.get("/me", authMe);
router.get("/search", searchByUsername);
router.post("/uploadAvatar", uploadAvatarMiddleware.single("file"), patchAvatar);

export default router;
