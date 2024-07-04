// authApi.js
import axiosInstance from "./mainApi";
import store from "../store/store"; // Redux store importálása
import {
  loginSuccess,
  loginFailure,
  logoutSuccess,
  logoutFailure,
  addAllUsers,
} from "../store/actions/authStoreFunctions"; // Frissítsd az elérési utat, ha szükséges

// Login
const loginApi = async (username, password, beRemembered) => {
  try {
    const response = await axiosInstance.post("/account/login", {
      username,
      password,
    });

    console.log("Server response:", response);

    if (response.status === 200) {
      const { token, user } = response.data;
      localStorage.setItem("userToken", token);
      if (beRemembered) {
        localStorage.setItem("rememberToken", token);
      }
      store.dispatch(loginSuccess(user));
    }

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    store.dispatch(loginFailure(error));
    throw error;
  }
};

// Get All Users
const getAllUsersApi = async () => {
  try {
    const response = await axiosInstance.get("/users");
    console.log("Loading users from server response: ", response);
    if (response.status === 200) {
      store.dispatch(addAllUsers(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Check a token
const checkTokenApi = async (token) => {
  try {
    const response = await axiosInstance.post("/account/checkToken", {
      token,
    });

    console.log("Token check response:", response);
    if (response.status === 200) {
      const { user } = response.data;
      localStorage.setItem("userToken", token);

      store.dispatch(loginSuccess(user));
    }
    return response;
  } catch (error) {
    console.error("Error during token check:", error);
    store.dispatch(loginFailure(error));
    throw error;
  }
};

// Logout
const logoutApi = () => {
  try {
    store.dispatch(logoutSuccess());
    localStorage.removeItem("userToken");
    localStorage.removeItem("rememberToken");
  } catch (error) {
    console.error("Error during logout:", error);
    store.dispatch(logoutFailure(error));
    throw error;
  }
};

export default { loginApi, checkTokenApi, logoutApi, getAllUsersApi };
