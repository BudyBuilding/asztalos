//apiService.js
import store from "../store/store"; // Redux store importálása

import {
  getClientsSuccess,
  getWorksSuccess,
  addClientSuccess,
  getScriptsSuccess,
  addScriptSuccess,
  addObjectSuccess,
  modifyObjectSuccess,
  addWorkSuccess,
  selectObject,
} from "../store/actions/actions"; // Frissítsd az elérési utat, ha szükséges

const BASE_URL = "https://api.example.com";

const getClients = () => {
  return store.getState().clients;
};

const getWorks = () => {
  return store.getState().works;
};

const addClient = (clientData) => {
  return async (dispatch) => {
    try {
      dispatch(addClientSuccess(clientData));
      return clientData;
    } catch (error) {
      console.error("Error while adding client:", error);
      throw error;
    }
  };
};

const addWork = (work) => {
  return async (dispatch) => {
    dispatch(addWorkSuccess(work));
    return work;
  };
};

const addColor = (colorObj) => {
  return (dispatch) => {
    dispatch({
      type: "ADD_COLOR",
      payload: colorObj,
    });
  };
};

const addScript = (script) => {
  return async (dispatch) => {
    try {
      dispatch(addScriptSuccess(script));
      return script;
    } catch (error) {
      console.error("Error while adding script:", error);
      throw error;
    }
  };
};

const addObject = (object) => {
  return async (dispatch) => {
    try {
      dispatch(addObjectSuccess(object));
      return object;
    } catch (error) {
      console.error("Error while adding object:", error);
      throw error;
    }
  };
};

const modifyObject = (modifiedObject) => {
  return async (dispatch) => {
    try {
      dispatch(modifyObjectSuccess(modifiedObject));
      return modifiedObject;
    } catch (error) {
      console.error("Error while modifying object:", error);
      throw error;
    }
  };
};

export const selectingObject = async (objectKey) => {
  try {
    store.dispatch(selectObject(objectKey));
  } catch (error) {
    console.error("Error while fetching objects:", error);
    throw error;
  }
};

export {
  getClients,
  getWorks,
  addClient,
  addWork,
  addColor,
  addScript,
  addObject,
  modifyObject,
};
