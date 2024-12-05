import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? 'http://localhost:4040/api' : "/api", // replace with your server URL
    withCredentials: true, // set to true to provide Enable sending cookies with requests
})