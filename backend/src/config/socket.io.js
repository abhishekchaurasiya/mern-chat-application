import { Server } from "socket.io";
import { createServer } from "http"
import express from "express"

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true,
    },
});

export function getReceiverSocketId(userIds) {
    return userSocketMap[userIds]
}

// used to store online users
const userSocketMap = {}; // {userId: socketId} userId came to server and sockeId came to socket.io

io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    });
})


export { io, app, server }