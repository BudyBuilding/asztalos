//actions.js
import apiService from "../../firebase/apiService";

import { GET_CLIENTS_SUCCESS, GET_WORKS_SUCCESS } from "../constants";

export const getClientsSuccess = (clients) => ({
  type: GET_CLIENTS_SUCCESS,
  payload: clients,
});

export const getWorksSuccess = (works) => ({
  type: GET_WORKS_SUCCESS,
  payload: works,
});

export const loginStart = () => ({
  type: "auth/loginStart",
});

export const loginSuccess = (user) => ({
  type: "auth/loginSuccess",
  payload: user,
});

export const loginFailure = (error) => ({
  type: "auth/loginFailure",
  payload: error,
});

export const logout = () => ({
  type: "auth/logout",
});

export const login = (userData) => {
  return (dispatch) => {
    dispatch(loginStart());
    // Ide jön majd a valós bejelentkezési logika, például az API hívás
    // Példa aszinkron műveletre:
    setTimeout(async () => {
      // Egyelőre példa adatokkal dolgozunk, később helyettesítsd az API hívással
      if (userData.email === "a@gmail.com" && userData.password === "a") {
        console.log("hello");
        const user = { id: 1, name: "John Doe", email: userData.email };
        apiService.getClients(user.id);
        apiService.getWorks(user.id);
        dispatch(loginSuccess(user));
      } else {
        dispatch(loginFailure("Invalid email or password"));
      }
    }, 1000); // Példa aszinkron művelet késleltetéssel
  };
};
