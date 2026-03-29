import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";
import type { Conversation, LastMessage, Message } from "@/types/chat";

/** Payload socket: lastMessage có senderId thay vì object sender đầy đủ */
type NewMessagePayload = {
    message: Message;
    conversation: Omit<Conversation, "lastMessage"> & {
        lastMessage: Pick<LastMessage, "_id" | "content" | "createdAt"> & {
            senderId: string;
        };
    };
    unreadCounts: Record<string, number>;
};

type ReadMessagePayload = {
    conversation: Conversation;
    lastMessage: LastMessage | null;
};

const baseURL =
    import.meta.env.VITE_SOCKET_URL ?? "http://127.0.0.1:5001";

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    onlineUsers: [],
    connectSocket: () => {
        const accessToken = useAuthStore.getState().accessToken;
        const existingSocket = get().socket;

        if (existingSocket) return; // tránh tạo nhiều socket

        const socket: Socket = io(baseURL, {
            auth: { token: accessToken },
            transports: ["websocket"],
        });

        set({ socket });

        socket.on("connect", () => {
            console.log("Đã kết nối với socket");
        });

        // online users
        socket.on("online-users", (userIds: string[]) => {
            set({ onlineUsers: userIds });
        });

        // new message
        socket.on("new-message", ({ message, conversation, unreadCounts }: NewMessagePayload) => {
            useChatStore.getState().addMessage(message);

            const lastMessage = {
                _id: conversation.lastMessage._id,
                content: conversation.lastMessage.content,
                createdAt: conversation.lastMessage.createdAt,
                sender: {
                    _id: conversation.lastMessage.senderId,
                    displayName: "",
                    avatarUrl: null,
                },
            };

            const updatedConversation = {
                ...conversation,
                lastMessage,
                unreadCounts,
            };

            if (useChatStore.getState().activeConversationId === message.conversationId) {
                useChatStore.getState().markAsSeen();
            }

            useChatStore.getState().updateConversation(updatedConversation);
        });

        // read message
        socket.on("read-message", ({ conversation, lastMessage }: ReadMessagePayload) => {
            const updated = {
                _id: conversation._id,
                lastMessage,
                lastMessageAt: conversation.lastMessageAt,
                unreadCounts: conversation.unreadCounts,
                seenBy: conversation.seenBy,
            };

            useChatStore.getState().updateConversation(updated);
        });

        // new group chat
        socket.on("new-group", (conversation: Conversation) => {
            useChatStore.getState().addConvo(conversation);
            socket.emit("join-conversation", conversation._id);
        });
    },
    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },
}));