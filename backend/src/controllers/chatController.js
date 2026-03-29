// @ts-nocheck
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { formatConversation, formatMessage, normalizeUnreadCounts } from "../utils/chatDto.js";
import { getIO } from "../socket/io.js";

const PAGE_SIZE = 50;

async function loadConvo(id) {
  return Conversation.findById(id).populate(
    "participants",
    "displayName avatarUrl username",
  );
}

export const listConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const list = await Conversation.find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "displayName avatarUrl username")
      .lean();

    const conversations = list.map((c) => formatConversation(c, userId));
    return res.json({ conversations });
  } catch (error) {
    console.error("listConversations", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Number(req.query.limit) || PAGE_SIZE, 100);
    const { cursor } = req.query;

    const convo = await Conversation.findOne({
      _id: id,
      participants: req.user._id,
    });
    if (!convo) {
      return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
    }

    let query = { conversationId: id };
    if (cursor) {
      const cur = await Message.findById(cursor);
      if (cur) {
        query.createdAt = { $lt: cur.createdAt };
      }
    }

    const batch = await Message.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    const ordered = [...batch].reverse();
    const nextCursor =
      batch.length === limit && ordered.length > 0 ? ordered[0]._id.toString() : null;

    const messages = ordered.map((m) => formatMessage(m));
    return res.json({ messages, nextCursor });
  } catch (error) {
    console.error("getMessages", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

async function emitToParticipants(convoId, event, payload) {
  const io = getIO();
  if (!io) return;
  const convo = await Conversation.findById(convoId).lean();
  if (!convo?.participants) return;
  for (const pid of convo.participants) {
    const id = pid.toString();
    io.to(`user-${id}`).emit(event, payload);
  }
}

export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content = "", imgUrl, conversationId } = req.body;
    const senderId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ message: "Thiếu recipientId" });
    }
    if (recipientId === senderId.toString()) {
      return res.status(400).json({ message: "Không thể gửi cho chính mình" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Người nhận không tồn tại" });
    }

    let convo;
    if (conversationId) {
      const rid = new mongoose.Types.ObjectId(recipientId);
      convo = await Conversation.findOne({
        _id: conversationId,
        type: "direct",
        participants: { $all: [senderId, rid] },
      });
      if (!convo) {
        return res.status(404).json({ message: "Cuộc trò chuyện không hợp lệ" });
      }
    } else {
      const rid = new mongoose.Types.ObjectId(recipientId);
      convo = await Conversation.findOne({
        type: "direct",
        participants: { $size: 2, $all: [senderId, rid] },
      });
      if (!convo) {
        convo = await Conversation.create({
          type: "direct",
          group: { name: "", createdBy: senderId },
          participants: [senderId, rid],
          lastMessageAt: new Date(),
          unreadCounts: new Map(),
        });
      }
    }

    const sender = await User.findById(senderId).select("displayName avatarUrl");
    const msg = await Message.create({
      conversationId: convo._id,
      senderId,
      content,
      imgUrl: imgUrl || null,
    });

    const lastMessage = {
      _id: msg._id,
      content: msg.content ?? "",
      createdAt: msg.createdAt,
      sender: {
        _id: sender._id,
        displayName: sender.displayName,
        avatarUrl: sender.avatarUrl ?? null,
      },
    };

    convo.lastMessage = lastMessage;
    convo.lastMessageAt = new Date();
    if (!convo.unreadCounts) convo.unreadCounts = new Map();
    for (const pid of convo.participants) {
      const key = pid.toString();
      if (key === senderId.toString()) {
        convo.unreadCounts.set(key, 0);
      } else {
        convo.unreadCounts.set(key, (convo.unreadCounts.get(key) || 0) + 1);
      }
    }
    await convo.save();

    const populated = await loadConvo(convo._id);
    const plain = populated.toObject();
    const unread = normalizeUnreadCounts(plain.unreadCounts);

    const socketPayload = {
      message: formatMessage(msg),
      conversation: {
        ...formatConversation(plain),
        lastMessage: {
          _id: msg._id.toString(),
          content: msg.content ?? "",
          createdAt: msg.createdAt.toISOString(),
          senderId: senderId.toString(),
        },
      },
      unreadCounts: unread,
    };

    await emitToParticipants(convo._id, "new-message", socketPayload);

    return res.status(201).json({ message: formatMessage(msg) });
  } catch (error) {
    console.error("sendDirectMessage", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content = "", imgUrl } = req.body;
    const senderId = req.user._id;

    if (!conversationId) {
      return res.status(400).json({ message: "Thiếu conversationId" });
    }

    const convo = await Conversation.findOne({
      _id: conversationId,
      type: "group",
      participants: senderId,
    });
    if (!convo) {
      return res.status(404).json({ message: "Không tìm thấy nhóm" });
    }

    const sender = await User.findById(senderId).select("displayName avatarUrl");
    const msg = await Message.create({
      conversationId: convo._id,
      senderId,
      content,
      imgUrl: imgUrl || null,
    });

    const lastMessage = {
      _id: msg._id,
      content: msg.content ?? "",
      createdAt: msg.createdAt,
      sender: {
        _id: sender._id,
        displayName: sender.displayName,
        avatarUrl: sender.avatarUrl ?? null,
      },
    };

    convo.lastMessage = lastMessage;
    convo.lastMessageAt = new Date();
    if (!convo.unreadCounts) convo.unreadCounts = new Map();
    for (const pid of convo.participants) {
      const key = pid.toString();
      if (key === senderId.toString()) {
        convo.unreadCounts.set(key, 0);
      } else {
        convo.unreadCounts.set(key, (convo.unreadCounts.get(key) || 0) + 1);
      }
    }
    await convo.save();

    const populated = await loadConvo(convo._id);
    const plain = populated.toObject();
    const unread = normalizeUnreadCounts(plain.unreadCounts);

    const socketPayload = {
      message: formatMessage(msg),
      conversation: {
        ...formatConversation(plain),
        lastMessage: {
          _id: msg._id.toString(),
          content: msg.content ?? "",
          createdAt: msg.createdAt.toISOString(),
          senderId: senderId.toString(),
        },
      },
      unreadCounts: unread,
    };

    await emitToParticipants(convo._id, "new-message", socketPayload);

    return res.status(201).json({ message: formatMessage(msg) });
  } catch (error) {
    console.error("sendGroupMessage", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const convo = await Conversation.findOne({
      _id: id,
      participants: userId,
    });
    if (!convo) {
      return res.status(404).json({ message: "Không tìm thấy" });
    }

    const me = await User.findById(userId).select("displayName avatarUrl");
    const seenEntry = {
      _id: me._id,
      displayName: me.displayName,
      avatarUrl: me.avatarUrl ?? null,
    };
    const exists = (convo.seenBy || []).some((s) => s._id?.toString() === userId.toString());
    if (!exists) {
      convo.seenBy = [...(convo.seenBy || []), seenEntry];
    }
    if (!convo.unreadCounts) convo.unreadCounts = new Map();
    convo.unreadCounts.set(userId.toString(), 0);
    await convo.save();

    const populated = await loadConvo(convo._id);
    const plain = populated.toObject();

    const lm = plain.lastMessage;
    const lastMessage =
      lm && lm._id
        ? {
            _id: lm._id.toString(),
            content: lm.content ?? "",
            createdAt: new Date(lm.createdAt).toISOString(),
            sender: {
              _id: lm.sender?._id?.toString?.() ?? lm.sender?._id,
              displayName: lm.sender?.displayName ?? "",
              avatarUrl: lm.sender?.avatarUrl ?? null,
            },
          }
        : null;

    const readPayload = {
      conversation: formatConversation(plain),
      lastMessage,
    };

    await emitToParticipants(convo._id, "read-message", readPayload);

    return res.json({ ok: true });
  } catch (error) {
    console.error("markAsSeen", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds = [] } = req.body;
    const creatorId = req.user._id;

    if (type !== "group" && type !== "direct") {
      return res.status(400).json({ message: "Loại trò chuyện không hợp lệ" });
    }
    
    if (type === "group" && !name?.trim()) {
      return res.status(400).json({ message: "Thiếu tên nhóm" });
    }

    const ids = [...new Set([creatorId.toString(), ...memberIds.map(String)])].map(
      (x) => new mongoose.Types.ObjectId(x),
    );

    if (type === "direct" && ids.length !== 2) {
      return res.status(400).json({ message: "Trò chuyện cá nhân phải có đúng 2 người" });
    }

    for (const oid of ids) {
      const u = await User.findById(oid);
      if (!u) {
        return res.status(400).json({ message: "Có thành viên không tồn tại" });
      }
    }

    if (type === "direct") {
      const existing = await Conversation.findOne({
        type: "direct",
        participants: { $size: 2, $all: ids }
      });
      if (existing) {
        const populated = await loadConvo(existing._id);
        const formatted = formatConversation(populated.toObject());
        return res.status(200).json({ conversation: formatted });
      }
    }

    const convo = await Conversation.create({
      type,
      group: type === "group" ? { name: name.trim(), createdBy: creatorId } : undefined,
      participants: ids,
      lastMessageAt: new Date(),
      unreadCounts: new Map(),
    });

    const populated = await loadConvo(convo._id);
    const formatted = formatConversation(populated.toObject());

    const io = getIO();
    if (io) {
      for (const p of populated.participants) {
        const uid = p._id?.toString?.() ?? String(p._id);
        io.to(`user-${uid}`).emit(type === "group" ? "new-group" : "new-conversation", formatted);
      }
    }

    return res.status(201).json({ conversation: formatted });
  } catch (error) {
    console.error("createConversation", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
