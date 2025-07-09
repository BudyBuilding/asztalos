// mainApi.js
import axios from "axios";

//const aws = "ec2-3-92-4-65.compute-1.amazonaws.com";

const aws = "localhost";
const BASE_URL = "https://asztalos-backend-d09e9ace256e.herokuapp.com/"; // Az API alapértelmezett URL-je   
const BASE_URL1 = `http://${aws}:9001`; // Az API alapértelmezett URL-je

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  // Ha a kérés a bejelentkezésre vagy regisztrációra megy, NE adjuk hozzá az Authorization fejléceket
  if (config.url?.endsWith("/account/login") || config.url?.endsWith("/account/register")) {
    return config;
  }
  const token = localStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default axiosInstance;
