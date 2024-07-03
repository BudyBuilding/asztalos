// scriptApi.js
import axiosInstance from "./mainApi";
import store from "../store/store"; // Redux store importálása
import {
  addScript,
  addMoreScripts,
  deleteScript,
  updateScript,
} from "../store/actions/scriptStoreFunctions";
import { useDispatch } from "react-redux";

const getAllScriptsApi = async () => {
  try {
    const response = await axiosInstance.get("/scripts");
    console.log("Loading scripts from server response: ", response);
    if (response.status === 200) {
      store.dispatch(addMoreScripts(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching scripts:", error);
    throw error;
  }
};

// Delete a script
const deleteScriptApi = (scriptId) => {
  return async (dispatch) => {
    try {
      console.log(scriptId);
      await axiosInstance.delete(`/scripts/${scriptId}`);
      console.log("Script deleted successfully.");
      dispatch(deleteScript(scriptId));
    } catch (error) {
      console.error("Error while deleting script:", error);
      throw error;
    }
  };
};
////////////////////
// Updating section
const updateScriptApi = (scriptId, updatedScriptData) => {
  return async (dispatch) => {
    try {
      await axiosInstance.put(`/scripts/${scriptId}`, updatedScriptData);
      dispatch(updateScript(updatedScriptData));
    } catch (error) {
      console.error("Error while updating script:", error);
      throw error;
    }
  };
};

const createScriptApi = (scriptData) => {
  return async (dispatch) => {
    try {
      console.log("creating new script");
      const response = await axiosInstance.post(`/scripts`, scriptData);
      console.log("Script added successfully:", response);

      dispatch(addScript(response.data));
      return response.data;
    } catch (error) {
      console.error("Error while adding script:", error);
      throw error;
    }
  };
};

const getScriptOfUserAdminApi = (scriptId) => {
  return async (dispatch) => {
    // A függvény visszatérési értéke egy aszinkron függvény
    try {
      const response = await axiosInstance.get(`/scripts/${scriptId}`);
      //   dispatch(getScriptSuccess(response.data)); // API válasz feldolgozása és diszpácselése a store-ba
      return response.data;
    } catch (error) {
      console.error("Error fetching scripts:", error);
      throw error;
    }
  };
};

export default {
  getAllScriptsApi,
  deleteScriptApi,
  updateScriptApi,
  createScriptApi,
  getScriptOfUserAdminApi,
};
