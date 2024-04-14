import { getClients, getWorks } from "../../firebase/apiService"; // addClient eltávolítva, mert már importálva van az apiService-ből

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

export const addClientSuccess = (client) => ({
  type: "ADD_CLIENT_SUCCESS",
  payload: client,
});

export const selectClient = (client) => ({
  type: "SELECT_CLIENT",
  payload: client,
});

export const login = (userData) => {
  return (dispatch) => {
    dispatch(loginStart());
    setTimeout(async () => {
      if (userData.email === "a@gmail.com" && userData.password === "a") {
        console.log("hello");
        const user = { id: 1, name: "John Doe", email: userData.email };
        getClients(user.id);
        getWorks(user.id);
        dispatch(loginSuccess(user));
      } else {
        dispatch(loginFailure("Invalid email or password"));
      }
    }, 1000);
  };
};
