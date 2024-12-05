
import "dotenv/config"
import express from "express"
import cookieParser from "cookie-parser"
import authRoute from "./routes/auth.routes.js"
import messageRoute from "./routes/message.routes.js"
import cors from "cors"
import path from "path"

import { app, server } from "./config/socket.io.js"

// Connect to MongoDB
import connectDatabase from './config/database.js';

const port = process.env.PORT
const __dirname = path.resolve();

app.use(express.json({ limit: '50mb', }));
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    // methods: ["GET", "POST", "PUT", "DELETE"]
}))

app.use(cookieParser())

app.use('/api/auth', authRoute);
app.use("/api/message", messageRoute);

if (process.env.NODE_ENV === 'production') {
    // combined frontend folder to backend folder
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // serve frontend app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend', "dist", 'index.html'));
    });
}

server.listen(port, () => {
    connectDatabase();
    console.log(`Server is running on port ${port}`);
})