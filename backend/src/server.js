import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import chatRoute from "./routes/chatRoute.js";
import messagesRoute from "./routes/messagesRoute.js";
import friendRoute from "./routes/friendRoute.js";
import { protectedRoute } from "./middlewares/authMiddleware.js";
import { initSocket } from "./socket/io.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5001;

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads")),
);

app.use("/api/auth", authRoute);

app.use(protectedRoute);
app.use("/api/users", userRoute);
app.use("/api/conversations", chatRoute);
app.use("/api/messages", messagesRoute);
app.use("/api/friends", friendRoute);

connectDB().then(() => {
  initSocket(httpServer, clientUrl);
  httpServer.listen(PORT, () => {
    console.log(`Server + Socket.IO: http://localhost:${PORT}`);
  });
});
