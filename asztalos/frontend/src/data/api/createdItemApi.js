// createdItemApi.js
import axiosInstance from "./mainApi";
import store from "../store/store"; // Redux store importálása
import {
  addCreatedItem,
  addMoreCreatedItems,
  deleteCreatedItem,
  deleteMoreCreatedItems,
  updateCreatedItem
} from "../store/actions/objectStoreFunctions";
import { useDispatch } from "react-redux";

const getAllCreatedItemsApi = async () => {
  try {
    const response = await axiosInstance.get("/created-itemss");
    console.log("Loading createdItems from server response: ", response);
    if (response.status === 200) {
      store.dispatch(addMoreCreatedItems(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching createdItems:", error);
    throw error;
  }
};

const getAllCreatedItemsForObjectApi = async (objectId) => {
  try {
    const response = await axiosInstance.get(
      `/created-items/object/${objectId}`
    );
    console.log(
      "Loading createdItems for object: ",
      objectId,
      " from server response: ",
      response
    );
    if (response.status === 200) {
      store.dispatch(addMoreCreatedItems(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching createdItems:", error);
    throw error;
  }
};

const getAllCreatedItemsForWorkApi = async (workId) => {
  try {
    const response = await axiosInstance.get(`/created-items/work/${workId}`);
    console.log(
      "Loading createdItems for work: ",
      workId,
      " from server response: ",
      response
    );
    if (response.status === 200) {
      store.dispatch(addMoreCreatedItems(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching createdItems:", error);
    throw error;
  }
};

// Delete a createdItem
const deleteCreatedItemApi = (createdItemId) => {
  return async (dispatch) => {
    try {
      console.log(createdItemId);
      await axiosInstance.delete(`/created-items/${createdItemId}`);
      console.log("CreatedItem deleted successfully.");
      dispatch(deleteCreatedItem(createdItemId));
    } catch (error) {
      console.error("Error while deleting createdItem:", error);
      throw error;
    }
  };
};

// Delete a createdItem
const deleteMultipleCreatedItemsApi = (createdItemList) => {
  return async (dispatch) => {
    try {
      console.log(createdItemList);
      await axiosInstance.delete(`/created-items/delete/items`, {
        data: createdItemList
      });
      console.log("CreatedItem deleted successfully.");
      dispatch(deleteMoreCreatedItems(createdItemList));
    } catch (error) {
      console.error("Error while deleting createdItem:", error);
      throw error;
    }
  };
};

const updateCreatedItemApi = (createdItemId, updatedCreatedItemData) => {
  return async (dispatch) => {
    try {
      await axiosInstance.put(
        `/created-items/${createdItemId}`,
        updatedCreatedItemData
      );
      dispatch(updateCreatedItem(updatedCreatedItemData));
    } catch (error) {
      console.error("Error while updating createdItem:", error);
      throw error;
    }
  };
};

const createCreatedItemApi = (createdItemData) => {
  return async (dispatch) => {
    try {
      console.log("creating new createdItem");
      const response = await axiosInstance.post(
        `/created-items`,
        createdItemData
      );
      console.log("CreatedItem added successfully:", response);

      dispatch(addCreatedItem(response.data));
      return response.data;
    } catch (error) {
      console.error("Error while adding createdItem:", error);
      throw error;
    }
  };
};

const createMultipleCreatedItemsApi = (createdItemsDataList) => {
  return async (dispatch) => {
    try {
      console.log("Creating multiple createdItems: ", createdItemsDataList);
      const response = await axiosInstance.post(
        `/created-items/items`,
        createdItemsDataList
      );
      console.log("CreatedItems added successfully:", response);

      // Assuming the response.data is an array of newly created items
      if (response.status === 200) {
        store.dispatch(addMoreCreatedItems(response.data)); // Dispatching to update Redux store
      }

      return response.data;
    } catch (error) {
      console.error("Error while adding createdItems:", error);
      throw error;
    }
  };
};

const getCreatedItemOfUserAdminApi = (createdItemId) => {
  return async (dispatch) => {
    // A függvény visszatérési értéke egy aszinkron függvény
    try {
      const response = await axiosInstance.get(
        `/created-items/${createdItemId}`
      );
      //   dispatch(getCreatedItemSuccess(response.data)); // API válasz feldolgozása és diszpácselése a store-ba
      return response.data;
    } catch (error) {
      console.error("Error fetching createdItems:", error);
      throw error;
    }
  };
};

const updateMultipleCreatedItemsApi = (updatedItemsList) => {
  return async (dispatch) => {
    try {
      const response = await axiosInstance.put(
        `/created-items/items`,
        updatedItemsList
      );
      console.log("Bulk update successful:", response.data);
      // For each updated dto, fire the single‐item update action
      response.data.forEach((dto) => {
        dispatch(updateCreatedItem(dto));
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk‐updating createdItems:", error);
      throw error;
    }
  };
};

const deleteCreatedItemsByObjectApi = (objectId) => {
  return async (dispatch) => {
    try {
      // 1) gather all itemIds in the store for this object
      const allItems = store.getState().createdItems || [];
      const idsToDelete = allItems
        .filter((it) => it.object?.objectId === objectId)
        .map((it) => it.itemId);

      // 2) call server
      await axiosInstance.delete(`/created-items/object/${objectId}`);

      // 3) purge from Redux
      dispatch(deleteMoreCreatedItems(idsToDelete));
      console.log(`Deleted ${idsToDelete.length} items for object ${objectId}`);
    } catch (error) {
      console.error("Error deleting createdItems by object:", error);
      throw error;
    }
  };
};

export default {
  getAllCreatedItemsApi,
  getAllCreatedItemsForObjectApi,
  createMultipleCreatedItemsApi,
  getAllCreatedItemsForWorkApi,
  deleteCreatedItemApi,
  deleteMultipleCreatedItemsApi,
  updateCreatedItemApi,
  createCreatedItemApi,
  getCreatedItemOfUserAdminApi,
  updateMultipleCreatedItemsApi,
  deleteCreatedItemsByObjectApi
};
