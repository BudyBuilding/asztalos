// createdTablesApi.js
import axiosInstance from "./mainApi";
import store from "../store/store"; // Redux store importálása
import {
  addCreatedTables,
  addMoreCreatedTables,
  deleteCreatedTables,
  deleteMoreCreatedTables,
  //updateCreatedTables,
} from "../store/actions/objectStoreFunctions";
import { useDispatch } from "react-redux";

const getAllCreatedTablesApi = async () => {
  try {
    const response = await axiosInstance.get("/createdTables");
    console.log("Loading createdTables from server response: ", response);
    if (response.status === 200) {
      store.dispatch(addMoreCreatedTables(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching createdTables:", error);
    throw error;
  }
};

const getAllCreatedTablesForObjectApi = async (objectId) => {
  try {
    const response = await axiosInstance.get(
      `/createdTables/object/${objectId}`
    );
    console.log(
      "Loading createdTables for object: ",
      objectId,
      " from server response: ",
      response
    );
    if (response.status === 200) {
      store.dispatch(addMoreCreatedTables(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching createdTables:", error);
    throw error;
  }
};

const getAllCreatedTablesForWorkApi = async (workId) => {
  try {
    const response = await axiosInstance.get(`/createdTables/work/${workId}`);
    console.log(
      "Loading createdTables for work: ",
      workId,
      " from server response: ",
      response
    );
    if (response.status === 200) {
      store.dispatch(addMoreCreatedTables(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching createdTables:", error);
    throw error;
  }
};

const generateTablesApi = async (workId) => {
  try {
    const response = await axiosInstance.post(`/createdTables/generate-tables/${workId}`);
    console.log(
      "Generating tables for work: ",
      workId,
      " from server response: ",
      response
    );
    if (response.status === 200) {
      store.dispatch(addMoreCreatedTables(response.data));
    }
    return response.data;
  } catch (error) {
    console.error("Error generating tables:", error);
    throw error;
  }
};

// Delete a createdTables
const deleteCreatedTablesApi = (createdTablesId) => {
  return async (dispatch) => {
    try {
      console.log(createdTablesId);
      await axiosInstance.delete(`/createdTables/${createdTablesId}`);
      console.log("CreatedTables deleted successfully.");
      dispatch(deleteCreatedTables(createdTablesId));
    } catch (error) {
      console.error("Error while deleting createdTables:", error);
      throw error;
    }
  };
};

// Delete a createdTables
const deleteMultipleCreatedTablesApi = (createdTablesList) => {
  return async (dispatch) => {
    try {
      console.log(createdTablesList);
      await axiosInstance.delete(`/createdTables/delete/Tables`, {
        data: createdTablesList,
      });
      console.log("CreatedTables deleted successfully.");
      dispatch(deleteMoreCreatedTables(createdTablesList));
    } catch (error) {
      console.error("Error while deleting createdTables:", error);
      throw error;
    }
  };
};
/*
////////////////////
// Updating section
const updateCreatedTablesApi = (createdTablesId, updatedCreatedTablesData) => {
  return async (dispatch) => {
    try {
      await axiosInstance.put(
        `/createdTables/${createdTablesId}`,
        updatedCreatedTablesData
      );
      dispatch(updateCreatedTables(updatedCreatedTablesData));
    } catch (error) {
      console.error("Error while updating createdTables:", error);
      throw error;
    }
  };
};*/

const createCreatedTablesApi = (createdTablesData) => {
  return async (dispatch) => {
    try {
      console.log("creating new createdTables");
      const response = await axiosInstance.post(
        `/createdTables`,
        createdTablesData
      );
      console.log("CreatedTables added successfully:", response);

      dispatch(addCreatedTables(response.data));
      return response.data;
    } catch (error) {
      console.error("Error while adding createdTables:", error);
      throw error;
    }
  };
};

const createMultipleCreatedTablesApi = (createdTablesDataList) => {
  return async (dispatch) => {
    try {
      console.log("Creating multiple createdTables");
      const response = await axiosInstance.post(
        `/createdTables/Tables`,
        createdTablesDataList
      );
      console.log("CreatedTables added successfully:", response);

      // Assuming the response.data is an array of newly created Tables
      if (response.status === 200) {
        store.dispatch(addMoreCreatedTables(response.data)); // Dispatching to update Redux store
      }

      return response.data;
    } catch (error) {
      console.error("Error while adding createdTables:", error);
      throw error;
    }
  };
};

const getCreatedTablesOfUserAdminApi = (createdTablesId) => {
  return async (dispatch) => {
    // A függvény visszatérési értéke egy aszinkron függvény
    try {
      const response = await axiosInstance.get(
        `/createdTables/${createdTablesId}`
      );
      //   dispatch(getCreatedTablesuccess(response.data)); // API válasz feldolgozása és diszpácselése a store-ba
      return response.data;
    } catch (error) {
      console.error("Error fetching createdTables:", error);
      throw error;
    }
  };
};

export default {
  getAllCreatedTablesApi,
  getAllCreatedTablesForObjectApi,
  createMultipleCreatedTablesApi,
  getAllCreatedTablesForWorkApi,
  deleteCreatedTablesApi,
  deleteMultipleCreatedTablesApi,
  //  updateCreatedTablesApi,
  generateTablesApi,
  createCreatedTablesApi,
  getCreatedTablesOfUserAdminApi,
};
