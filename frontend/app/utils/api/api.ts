import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (accessToken) {
    config.headers["x-access-token"] = accessToken; // ⬅ send access token
  }

  if (refreshToken) {
    config.headers["x-refresh-token"] = refreshToken; // ⬅ send refresh token
  }

  return config;
});
