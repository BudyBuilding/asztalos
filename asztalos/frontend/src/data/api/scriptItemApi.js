// scriptItemApi.js
import axiosInstance from "./mainApi";
import store from "../store/store"; // Redux store importálása
import {
  addScriptItem,
  addMoreScriptItems,
  //deleteScriptItem,
  //updateScriptItem,
} from "../store/actions/scriptStoreFunctions";
import { useDispatch } from "react-redux";

const getAllScriptItemsApi = async () => {
  try {
    const response = await axiosInstance.get("/script-item");
    console.log("Loading scriptItems from server response: ", response);
    if (response.status === 200) {
      store.dispatch(addMoreScriptItems(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("ScriptItems load failed:", error.response?.status, error.message);
    throw error;  // komponens eldönti, mit mutat a felhasználónak
  }
};

const getAllScriptItemsForScriptApi = async (scriptId) => {
  try {
    const response = await axiosInstance.get(`/script-item/script/${scriptId}`);
    console.log(
      "Loading scriptItems for script: ",
      scriptId,
      " from server response: ",
      response
    );
    if (response.status === 200) {
      store.dispatch(addMoreScriptItems(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching scriptItems:", error);
    throw error;
  }
};

// Delete a scriptItem
const deleteScriptItemApi = (scriptItemId) => {
  return async (dispatch) => {
    try {
      console.log(scriptItemId);
      await axiosInstance.delete(`/script-item/${scriptItemId}`);
      console.log("ScriptItem deleted successfully.");
   //   dispatch(deleteScriptItem(scriptItemId));
    } catch (error) {
      console.error("Error while deleting scriptItem:", error);
      throw error;
    }
  };
};
////////////////////
// Updating section
const updateScriptItemApi = (scriptItem, updatedScriptItemData) => {
  console.log("updatedScriptItemData: ",updatedScriptItemData );
  console.log("scriptItem: ",scriptItem );
  
  return async (dispatch) => {
    try {
      await axiosInstance.put(
        `/script-item/${scriptItem.itemId}`,
        scriptItem
      );
  //    dispatch(updateScriptItem(updatedScriptItemData));
    } catch (error) {
      console.error("Error while updating scriptItem:", error);
      throw error;
    }
  };
};

const createScriptItemApi = (scriptItemData) => {
  return async (dispatch) => {
    try {
      console.log("creating new scriptItem: ", scriptItemData);
      const response = await axiosInstance.post(`/script-item`, scriptItemData);
      console.log("ScriptItem added successfully:", response);

      dispatch(addScriptItem(response.data));
      return response.data;
    } catch (error) {
      console.error("Error while adding scriptItem:", error);
      throw error;
    }
  };
};

const getScriptItemOfUserAdminApi = (scriptItemId) => {
  return async (dispatch) => {
    // A függvény visszatérési értéke egy aszinkron függvény
    try {
      const response = await axiosInstance.get(`/script-item/${scriptItemId}`);
      //   dispatch(getScriptItemSuccess(response.data)); // API válasz feldolgozása és diszpácselése a store-ba
      return response.data;
    } catch (error) {
      console.error("Error fetching scriptItems:", error);
      throw error;
    }
  };
};

export default {
  getAllScriptItemsApi,
  getAllScriptItemsForScriptApi,
  deleteScriptItemApi,
  updateScriptItemApi,
  createScriptItemApi,
  getScriptItemOfUserAdminApi,
};
