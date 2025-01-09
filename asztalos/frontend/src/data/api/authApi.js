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
// Login
const loginApi = async (username, password, beRemembered) => {
  console.log("Login API called with:", username, password, beRemembered);
  try {
    const response = await axiosInstance.post("/account/login", {
      "username": username,
      "password": password,
    }, {
      withCredentials: true,
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
    console.error("Error during login:");
    
    // Részletesebb hiba információk
    if (error.response) {
      // A válasz létezik, így az error.response az axios válasz objektum
      console.error("Response error:", error.response);
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      // Ha nem volt válasz, de a kérés elküldésre került
      console.error("Request error:", error.request);
    } else {
      // Egyéb hiba, például konfigurációs probléma
      console.error("General error:", error.message);
    }

    store.dispatch(loginFailure(error.message));
    throw error;  // Hibát dobunk, hogy a hívó is kezelhesse, ha szükséges
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
    console.error("Error fetching users:", error.message);
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
    console.error("Error during token check:", error.message);
    store.dispatch(loginFailure(error.message));
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
    console.error("Error during logout:", error.message);
    store.dispatch(logoutFailure(error.message));
    throw error;
  }
};

export default { loginApi, checkTokenApi, logoutApi, getAllUsersApi };
