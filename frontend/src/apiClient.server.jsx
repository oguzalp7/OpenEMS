// src/apiClient.server.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true
});

// No need for redirection on server-side
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Token expired on the server-side');
        }
        return Promise.reject(error);
    }
);

export default apiClient;