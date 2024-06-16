// tableApi.js
import axiosInstance from "./mainApi";
import store from "../store/store"; // Redux store importálása
import {
  addTable,
  addMoreTables,
  deleteTable,
  updateTable,
} from "../store/actions/tableStoreFunctions";
import { useDispatch } from "react-redux";

//////////////////////////
const getAlltablesApi = async () => {
  try {
    const response = await axiosInstance.get("/tables");
    console.log("Loading tables from server response: ", response);
    if (response.status === 200) {
      store.dispatch(addMoreTables(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw error;
  }
};

const getAllTableOfWorkApi = async (workId) => {
  try {
    const response = await axiosInstance.get(`/tables/work/${workId}`);
    console.log(
      "Loading tables of the work: ",
      workId,
      "from server response: ",
      response
    );
    if (response.status === 200) {
      store.dispatch(addMoreTables(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw error;
  }
};

// Delete a table
const deletetableApi = (tableId) => {
  return async (dispatch) => {
    try {
      console.log(tableId);
      await axiosInstance.delete(`/tables/${tableId}`);
      console.log("table deleted successfully.");
      dispatch(deleteTable(tableId));
    } catch (error) {
      console.error("Error while deleting table:", error);
      throw error;
    }
  };
};
////////////////////
// Updating section
const updatetableApi = (tableId, updatedtableData) => {
  return async (dispatch) => {
    try {
      await axiosInstance.put(`/tables/${tableId}`, updatedtableData);
      dispatch(updateTable(updatedtableData));
    } catch (error) {
      console.error("Error while updating table:", error);
      throw error;
    }
  };
};

const createtableApi = (tableData) => {
  return async (dispatch) => {
    try {
      console.log("creating new table");
      const response = await axiosInstance.post(`/tables`, tableData);
      console.log("table added successfully:", response);

      dispatch(addTable(response.data));
      return response.data;
    } catch (error) {
      console.error("Error while adding table:", error);
      throw error;
    }
  };
};

const gettableOfUserAdminApi = (tableId) => {
  return async (dispatch) => {
    // A függvény visszatérési értéke egy aszinkron függvény
    try {
      const response = await axiosInstance.get(`/tables/${tableId}`);
      //   dispatch(gettableSuccess(response.data)); // API válasz feldolgozása és diszpácselése a store-ba
      return response.data;
    } catch (error) {
      console.error("Error fetching tables:", error);
      throw error;
    }
  };
};

export default {
  getAlltablesApi,
  deletetableApi,
  updatetableApi,
  createtableApi,
  gettableOfUserAdminApi,
  getAllTableOfWorkApi,
};
