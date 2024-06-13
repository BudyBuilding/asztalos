// clientApi.js
import axiosInstance from "./mainApi";
import store from "../store/store"; // Redux store importálása
import { addMoreClients } from "../store/actions/clientStoreFunctions";
import { useDispatch } from "react-redux";

const getAllClients = async () => {
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
const deleteClient = (clientId) => {
  return async (dispatch) => {
    try {
      console.log(clientId);
      await axiosInstance.delete(`/clients/${clientId}`);
      console.log("Client deleted successfully.");
      //     dispatch(deleteClientSuccess(clientId));
    } catch (error) {
      console.error("Error while deleting client:", error);
      throw error;
    }
  };
};
////////////////////
// Updating section
const updateClient = (clientId, updatedClientData) => {
  return async (dispatch) => {
    try {
      await axiosInstance.put(`/clients/${clientId}`, updatedClientData);
      //dispatch(modifyClientSuccess(updatedClientData));
    } catch (error) {
      console.error("Error while updating client:", error);
      throw error;
    }
  };
};
const addClient = (clientData) => {
  return async (dispatch) => {
    try {
      const response = await axiosInstance.post(`/clients`, clientData);
      console.log("Client added successfully:", response.data);

      // Frissítjük a kliensek állapotát a frissen hozzáadott klienssel
      //   dispatch(getClientsSuccess([...store.getState().clients, response.data]));

      return response.data;
    } catch (error) {
      console.error("Error while adding client:", error);
      throw error;
    }
  };
};

const getClientOfUserAdmin = (clientId) => {
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
  getAllClients,
  deleteClient,
  updateClient,
  addClient,
  getClientOfUserAdmin,
};
