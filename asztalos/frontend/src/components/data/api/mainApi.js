// mainApi.js
import axios from "axios";

//const aws = "ec2-3-92-4-65.compute-1.amazonaws.com";

const aws = "localhost";
const BASE_URL = `http://${aws}:9000`; // Az API alapértelmezett URL-je

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
