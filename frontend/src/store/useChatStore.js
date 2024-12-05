import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessageLoading: false,

    getUsers: async () => {
        set({ isUserLoading: true });
        try {
            const response = await axiosInstance.get("/message/users");
            set({ users: response.data });
        } catch (error) {
            toast.error(error.response.data.error);
        } finally {
            set({ isUserLoading: false });
        }
    },

    getMessages: async (selectedUserId) => {
        set({ isMessageLoading: true });
        try {
            const response = await axiosInstance.get(`/message/${selectedUserId}`);
            set({ messages: response.data });
        } catch (error) {
            toast.error(error.response.data.error);
        } finally {
            set({ isMessageLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const response = await axiosInstance.post(
                `/message/send/${selectedUser._id}`,
                messageData
            );
            set({ messages: [...messages, response.data] });
        } catch (error) {
            toast.error(error.response.data.error);
        }
    },

    subscribeToMessages: async () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        // listener
        // todo: optimize this one later
        socket.on("newMessage", (newMessage) => {
            const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
            if(!isMessageFromSelectedUser) return;

            set({ messages: [...get().messages, newMessage] });
        });
    },

    unsubscribeFromMessages: async () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
