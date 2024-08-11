// "use client"
// import axios from "axios";



// const apiClient = axios.create({
//     baseURL: 'http://127.0.0.1:8000',
// });


// let hasAlerted = false;

//   // Interceptor to handle 401 errors
// apiClient.interceptors.response.use(
//   (config) => {
//     console.log(config.status)
//     return config
//   },(error) => {
//     console.log(error)
//     if(error.response.status === 401){
//       if(!hasAlerted){
//         //alert('Oturumunuzun süresi dolmuştur. Lütfen tekrar giriş yapın.')
//         //window.location.assign('/login')
//         hasAlerted = true;
//       }
//     }
//     return Promise.reject(error)
//   }
// );

// export {apiClient};

"use client";
import axios from "axios";
import { getPlainSession } from "./actions";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    })

    failedQueue = [];
}



const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, 
    withCredentials: true
});



apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const session = await getPlainSession(); // Assuming getSession refreshes the token if necessary

            if (session && session.token) {
                apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + session.token;
                originalRequest.headers['Authorization'] = 'Bearer ' + session.token;
                processQueue(null, session.token);
                return apiClient(originalRequest);
            }

            processQueue(error, null);
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export { apiClient };
