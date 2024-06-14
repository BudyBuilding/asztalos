// clientApi.js
import axiosInstance from "./mainApi";
import store from "../store/store"; // Redux store importálása
import {
  addClient,
  addMoreClients,
  deleteClient,
  updateClient,
} from "../store/actions/clientStoreFunctions";
import { useDispatch } from "react-redux";

const getAllClientsApi = async () => {
  try {
    const response = await axiosInstance.get("/clients");
    console.log("Loading clients from server response: ", response);
    if (response.status === 200) {
      store.dispatch(addMoreClients(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};

// Delete a client
const deleteClientApi = (clientId) => {
  return async (dispatch) => {
    try {
      console.log(clientId);
      await axiosInstance.delete(`/clients/${clientId}`);
      console.log("Client deleted successfully.");
      dispatch(deleteClient(clientId));
    } catch (error) {
      console.error("Error while deleting client:", error);
      throw error;
    }
  };
};
////////////////////
// Updating section
const updateClientApi = (clientId, updatedClientData) => {
  return async (dispatch) => {
    try {
      await axiosInstance.put(`/clients/${clientId}`, updatedClientData);
      dispatch(updateClient(updatedClientData));
    } catch (error) {
      console.error("Error while updating client:", error);
      throw error;
    }
  };
};

const createClientApi = (clientData) => {
  return async (dispatch) => {
    try {
      console.log("creating new client");
      const response = await axiosInstance.post(`/clients`, clientData);
      console.log("Client added successfully:", response);

      dispatch(addClient(response.data));
      return response.data;
    } catch (error) {
      console.error("Error while adding client:", error);
      throw error;
    }
  };
};

const getClientOfUserAdminApi = (clientId) => {
  return async (dispatch) => {
    // A függvény visszatérési értéke egy aszinkron függvény
    try {
      const response = await axiosInstance.get(`/clients/${clientId}`);
      //   dispatch(getClientSuccess(response.data)); // API válasz feldolgozása és diszpácselése a store-ba
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  };
};

export default {
  getAllClientsApi,
  deleteClientApi,
  updateClientApi,
  createClientApi,
  getClientOfUserAdminApi,
};
