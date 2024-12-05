// here we have bunch of different states and functions that we can use different components

import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const ServerBaseUrl = import.meta.env.MODE === "development" ? "http://localhost:4040" : "/";

// here [set] is setter function
// for use Authentication
export const useAuthStore = create((set, get) => ({
    // bunch of loading states
    isSigningUp: false,
    isLoggoingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket: null,
    // initial state
    authUser: null,
    isCheckingAuth: true, // hook

    // for protected routes
    checkAuth: async () => {
        try {
            const response = await axiosInstance.get("/auth/check");
            set({ authUser: response.data });
            // socket connected
            get().connectSocket();
        } catch (error) {
            console.log("Error in check auth: ", error.response.data);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }

        // set({ isCheckingAuth: true });
        // try {
        //     const token = localStorage.getItem('token');
        //     if (token) {
        //         set({ authUser: true, isCheckingAuth: false });
        //     } else {
        //         set({ authUser: null, isCheckingAuth: false });
        //     }
        // } catch (error) {
        //     set({ authUser: null, isCheckingAuth: false });
        // }
    },

    // for signup
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const response = await axiosInstance.post("/auth/signup", data);
            set({ authUser: response.data });
            toast.success("Account created successfully");
            // socket connected
            get().connectSocket();
        } catch (error) {
            console.log("Error in signup: " + error.response.data);
            set({ authUser: null });
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggoingIn: true });
        try {
            const response = await axiosInstance.post("/auth/login", data);
            set({ authUser: response.data });
            toast.success("Logged in successfully");
            // socket connected
            get().connectSocket();
        } catch (error) {
            console.log("Error in signup: " + error.response.data);
            set({ authUser: null });
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggoingIn: false });
        }
    },

    // for logout
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            // disconnect socket connection
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    // for updating profile
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const response = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: response.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error in signup: " + error.response.data.message);
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: async () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return; // if you are un-authenticated and if you are already connected with socket

        const socket = io(ServerBaseUrl, {
            query: {
                userId: authUser._id
            }
        });

        socket.connect();
        set({ socket: socket })

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })
    },

    disconnectSocket: async () => {
        if (get().socket?.connected) get().socket.disconnect();
    },
}));
