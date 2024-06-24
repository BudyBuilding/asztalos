// objectApi.js
import axiosInstance from "./mainApi";
import store from "../store/store"; // Redux store importálása
import {
  addObject,
  addMoreObjects,
  deleteObject,
  updateObject,
  setObjectLoading,
  replaceStoreWithMoreObjects,
  // Delete a object
} from "../store/actions/objectStoreFunctions";
import { useDispatch } from "react-redux";

const getAllObjectsApi = async () => {
  try {
    const response = await axiosInstance.get("/objects");
    console.log("Loading objects from server response: ", response);
    if (response.status === 200) {
      store.dispatch(replaceStoreWithMoreObjects(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching objects:", error);
    throw error;
  }
};

const getObjectOfWorkApi = async (selectedWork) => {
  try {
    store.dispatch(setObjectLoading(true));
    const response = await axiosInstance.get(`/objects/work/${selectedWork}`);
    console.log("Loading objects from server response: ", response);
    store.dispatch(setObjectLoading(false));
    if (response.status === 200) {
      store.dispatch(replaceStoreWithMoreObjects(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching objects:", error);
    throw error;
  }
};
// Delete a object
const deleteObjectApi = (objectId) => {
  return async (dispatch) => {
    try {
      console.log("Object to delete: ", objectId);
      await axiosInstance.delete(`/objects/${objectId}`);
      console.log("Object deleted successfully.");
      dispatch(deleteObject(objectId));
    } catch (error) {
      console.error("Error while deleting object:", error);
      throw error;
    }
  };
};
////////////////////
// Updating section
const updateObjectApi = (objectId, updatedObjectData) => {
  return async (dispatch) => {
    try {
      await axiosInstance.put(`/objects/${objectId}`, updatedObjectData);
      dispatch(updateObject(updatedObjectData));
    } catch (error) {
      console.error("Error while updating object:", error);
      throw error;
    }
  };
};

const createObjectApi = (objectData) => {
  return async (dispatch) => {
    try {
      console.log("creating new object");
      const response = await axiosInstance.post(`/objects`, objectData);
      console.log("Object added successfully:", response);

      dispatch(addObject(response.data));
      return response.data;
    } catch (error) {
      console.error("Error while adding object:", error);
      throw error;
    }
  };
};

const getObjectOfUserAdminApi = (objectId) => {
  return async (dispatch) => {
    // A függvény visszatérési értéke egy aszinkron függvény
    try {
      const response = await axiosInstance.get(`/objects/${objectId}`);
      //   dispatch(getObjectSuccess(response.data)); // API válasz feldolgozása és diszpácselése a store-ba
      return response.data;
    } catch (error) {
      console.error("Error fetching objects:", error);
      throw error;
    }
  };
};

export default {
  getAllObjectsApi,
  getObjectOfWorkApi,
  deleteObjectApi,
  updateObjectApi,
  createObjectApi,
  getObjectOfUserAdminApi,
};
