import express from "express";
import {
  acceptRequest,
  declineRequest,
  listFriendRequests,
  listFriends,
  sendFriendRequest,
} from "../controllers/friendController.js";

const router = express.Router();

router.get("/", listFriends);
router.post("/requests", sendFriendRequest);
router.get("/requests", listFriendRequests);
router.post("/requests/:requestId/accept", acceptRequest);
router.post("/requests/:requestId/decline", declineRequest);

export default router;
