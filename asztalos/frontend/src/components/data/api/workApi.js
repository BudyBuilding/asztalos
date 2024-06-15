// workApi.js
import axiosInstance from "./mainApi";
import store from "../store/store"; // Redux store importálása
import {
  addWork,
  addMoreWorks,
  deleteWork,
  updateWork,
} from "../store/actions/workStoreFunctions";
import { useDispatch } from "react-redux";

const getAllWorksApi = async () => {
  try {
    const response = await axiosInstance.get("/works");
    console.log("Loading works from server response: ", response);
    if (response.status === 200) {
      store.dispatch(addMoreWorks(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching works:", error);
    throw error;
  }
};

// Delete a work
const deleteWorkApi = (workId) => {
  return async (dispatch) => {
    try {
      console.log(workId);
      await axiosInstance.delete(`/works/${workId}`);
      console.log("Work deleted successfully.");
      dispatch(deleteWork(workId));
    } catch (error) {
      console.error("Error while deleting work:", error);
      throw error;
    }
  };
};
////////////////////
// Updating section
const updateWorkApi = (workId, updatedWorkData) => {
  return async (dispatch) => {
    try {
      await axiosInstance.put(`/works/${workId}`, updatedWorkData);
      dispatch(updateWork(updatedWorkData));
    } catch (error) {
      console.error("Error while updating work:", error);
      throw error;
    }
  };
};

const createWorkApi = (workData) => {
  return async (dispatch) => {
    try {
      console.log("creating new work");
      const response = await axiosInstance.post(`/works`, workData);
      console.log("Work added successfully:", response);

      dispatch(addWork(response.data));
      return response.data;
    } catch (error) {
      console.error("Error while adding work:", error);
      throw error;
    }
  };
};

const getWorkOfUserAdminApi = (workId) => {
  return async (dispatch) => {
    // A függvény visszatérési értéke egy aszinkron függvény
    try {
      const response = await axiosInstance.get(`/works/${workId}`);
      //   dispatch(getWorkSuccess(response.data)); // API válasz feldolgozása és diszpácselése a store-ba
      return response.data;
    } catch (error) {
      console.error("Error fetching works:", error);
      throw error;
    }
  };
};

export default {
  getAllWorksApi,
  deleteWorkApi,
  updateWorkApi,
  createWorkApi,
  getWorkOfUserAdminApi,
};
