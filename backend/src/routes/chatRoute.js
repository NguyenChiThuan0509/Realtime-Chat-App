import express from "express";
import {
  createConversation,
  getMessages,
  listConversations,
  markAsSeen,
  sendDirectMessage,
  sendGroupMessage,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", listConversations);
router.post("/", createConversation);
router.get("/:id/messages", getMessages);
router.patch("/:id/seen", markAsSeen);

export default router;
