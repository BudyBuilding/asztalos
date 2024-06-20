// settingApi.js
import axiosInstance from "./mainApi";
import store from "../store/store"; // Redux store importálása
import {
  addSetting,
  addMoreSettings,
  deleteSetting,
  updateSetting,
} from "../store/actions/settingStoreFunctions";
import { useDispatch } from "react-redux";

//////////////////////////
const getAllSettingsApi = async () => {
  try {
    const response = await axiosInstance.get("/settings");
    console.log("Loading settings from server response: ", response);
    if (response.status === 200) {
      store.dispatch(addMoreSettings(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

const getAllSettingOfWorkApi = async (workId) => {
  try {
    const response = await axiosInstance.get(`/settings/work/${workId}`);
    console.log(
      "Loading settings of the work: ",
      workId,
      "from server response: ",
      response
    );
    if (response.status === 200) {
      store.dispatch(addMoreSettings(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

const getAllSettingOfListOfIdsApi = async (settingIdList) => {
  try {
    const response = await axiosInstance.post(`/settings/ids`, settingIdList);

    console.log(
      "Loading settings of the list: ",
      settingIdList,
      "from server response: ",
      response
    );
    if (response.status === 200) {
      store.dispatch(addMoreSettings(response.data)); // Dispatching to update Redux store
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

// Delete a setting
const deleteSettingApi = (settingId) => {
  return async (dispatch) => {
    try {
      console.log(settingId);
      await axiosInstance.delete(`/settings/${settingId}`);
      console.log("setting deleted successfully.");
      dispatch(deleteSetting(settingId));
    } catch (error) {
      console.error("Error while deleting setting:", error);
      throw error;
    }
  };
};
////////////////////
// Updating section
const updateSettingApi = (settingId, updatedsettingData) => {
  return async (dispatch) => {
    try {
      await axiosInstance.put(`/settings/${settingId}`, updatedsettingData);
      dispatch(updateSetting(updatedsettingData));
    } catch (error) {
      console.error("Error while updating setting:", error);
      throw error;
    }
  };
};

const createSettingApi = (settingData) => {
  return async (dispatch) => {
    try {
      console.log("creating new setting");
      const response = await axiosInstance.post(`/settings`, settingData);
      console.log("setting added successfully:", response);

      dispatch(addSetting(response.data));
      return response.data;
    } catch (error) {
      console.error("Error while adding setting:", error);
      throw error;
    }
  };
};

const getSettingOfUserAdminApi = (settingId) => {
  return async (dispatch) => {
    // A függvény visszatérési értéke egy aszinkron függvény
    try {
      const response = await axiosInstance.get(`/settings/${settingId}`);
      //   dispatch(getsettingSuccess(response.data)); // API válasz feldolgozása és diszpácselése a store-ba
      return response.data;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  };
};

export default {
  getAllSettingsApi,
  deleteSettingApi,
  updateSettingApi,
  createSettingApi,
  getSettingOfUserAdminApi,
  getAllSettingOfWorkApi,
  getAllSettingOfListOfIdsApi,
};
