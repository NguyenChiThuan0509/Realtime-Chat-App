import mongoose from "mongoose";

const lastMessageSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    content: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    sender: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      displayName: String,
      avatarUrl: { type: String, default: null },
    },
  },
  { _id: false },
);

const seenUserSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    displayName: String,
    avatarUrl: { type: String, default: null },
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    group: {
      name: { type: String, default: "" },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessageAt: { type: Date, default: Date.now },
    seenBy: [seenUserSchema],
    lastMessage: { type: lastMessageSchema, default: null },
    unreadCounts: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1, type: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
