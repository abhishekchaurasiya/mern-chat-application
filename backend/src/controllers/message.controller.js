import cloudinary from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../config/socket.io.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// means of the fetch the every single users for not the self
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        const filteredUsers = await User.find({
            _id: { $ne: loggedInUser },
        }).select("-password -__v");

        res.status(200).json(filteredUsers);
    } catch (error) {
        return res.status(500).json({ error: error.messsage });
    }
};

// get messages between two users
// show all messages history for one user
export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        }).select("-__v");

        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({ error: error.messsage });
    }
};

// here message could be text or image
export const sendMessage = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        const { text, image } = req.body;

        let imageUrl;
        if (image) {
            const uploadResult = await cloudinary.uploader.upload(image);
            imageUrl = uploadResult.secure_url;
        }

        const newMessage = new Message({
            senderId: senderId,
            receiverId: receiverId,
            text: text,
            image: imageUrl,
        })

        await newMessage.save();

        // todo: real time functionality goes here ==> socket.io
        const receiverSocketId = await getReceiverSocketId(receiverId)
        // means if user online you are sent the message
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage) // it's a private chat 
        }



        return res.status(201).json(newMessage);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}