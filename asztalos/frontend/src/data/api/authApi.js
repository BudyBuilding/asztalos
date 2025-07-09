// authApi.js
import axiosInstance from "./mainApi";
import store from "../store/store";
import {
  loginSuccess,
  loginFailure,
  logoutSuccess,
  logoutFailure,
  addAllUsers,
  addUser
} from "../store/actions/authStoreFunctions";
// Login
// Login
const loginApi = async (username, password, beRemembered) => {
  console.log("Login API called with:", username, password, beRemembered);
  try {
    const response = await axiosInstance.post(
      "/account/login",
      {
        username: username,
        password: password
      },
      {
        withCredentials: true
      }
    );

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

    if (error.response) {
      console.error("Response error:", error.response);
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("Request error:", error.request);
    } else {
      console.error("General error:", error.message);
    }

    store.dispatch(loginFailure(error.message));
    throw error;
  }
};

const resetPasswordApi = async ({ token, newPassword }) => {
  const response = await axiosInstance.post(
    "/account/resetPassword",
    { token, newPassword },
    { withCredentials: true }
  );
  return response;  // <— visszaadjuk a teljes response-t
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

const deleteUserApi = async () => {
  return;
}

// Check a token
const checkTokenApi = async (token) => {
  try {
    const response = await axiosInstance.post("/account/checkToken", {
      token
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

const registerApi = async (registerData) => {
  const response = await axiosInstance.post("/account/register", registerData, { withCredentials: true });
 
  if (response.status === 200 && response.data.success) {
    const newUser = response.data.user;
    store.dispatch(addUser(newUser));
  }
 
  return response;  
};


const forgotPasswordApi = async (email) => {
  try {
    const response = await axiosInstance.post("/account/forgotPassword", { email });
    return response.data; // szerver mindig generikus üzenetet küld
  } catch (error) {
    console.error("Error during forgot password:", error.message);
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

// eslint-disable-next-line import/no-anonymous-default-export
export default { loginApi, checkTokenApi, logoutApi, getAllUsersApi, registerApi, forgotPasswordApi, resetPasswordApi, deleteUserApi };      
