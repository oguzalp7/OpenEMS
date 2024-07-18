import axios from "axios";

export const apiClient = axios.create({
    baseURL: process.env.FASTAPI_ADDR,
  });

