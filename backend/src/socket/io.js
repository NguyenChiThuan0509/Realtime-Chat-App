// @ts-nocheck
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

let io;

/**
 * @param {import("http").Server} httpServer
 * @param {string} clientUrl
 */
export function initSocket(httpServer, clientUrl) {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || true,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Unauthorized"));
      }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err || !decoded?.userId) {
          return next(new Error("Unauthorized"));
        }
        const user = await User.findById(decoded.userId).select("-hashedPassword");
        if (!user) {
          return next(new Error("Unauthorized"));
        }
        socket.userId = user._id.toString();
        socket.join(`user-${socket.userId}`);
        next();
      });
    } catch (e) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    broadcastOnlineUsers();

    socket.on("join-conversation", (conversationId) => {
      if (typeof conversationId === "string") {
        socket.join(`convo-${conversationId}`);
      }
    });

    socket.on("disconnect", () => {
      broadcastOnlineUsers();
    });
  });

  return io;
}

function broadcastOnlineUsers() {
  if (!io) return;
  const ids = [];
  for (const socket of io.of("/").sockets.values()) {
    if (socket.userId) ids.push(socket.userId);
  }
  io.emit("online-users", [...new Set(ids)]);
}

export function getIO() {
  return io;
}
