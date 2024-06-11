//apiService.js
import store from "../store/store"; // Redux store importálása
import axios from "axios";

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
  loginSuccess,
  logoutSuccess,
} from "../store/actions/actions"; // Frissítsd az elérési utat, ha szükséges

const amazonDNS = "ec2-54-160-166-216.compute-1.amazonaws.com";

const BASE_URL = `http://${amazonDNS}:9000`; // Az API alapértelmezett URL-je

///////////////////
//account crud actions

const loginApi = async (username, password, beRemembered) => {
  try {
    const response = await axios.post(`${BASE_URL}/account/login`, {
      username,
      password,
    });

    console.log("Server response:", response);

    const { token } = response.data;

    if (beRemembered && response.status === 200) {
      localStorage.setItem("rememberToken", token);
    }

    if (response.status === 200) {
      store.dispatch(loginSuccess()); // Dispatch login success action
    }
  } catch (error) {
    console.error("Error during login:", error);
    // Dispatch login failure action or handle error
    throw error; // Rethrow the error for component to handle
  }
};

const checkToken = async (token) => {
  try {
    const response = await axios.post(`${BASE_URL}/account/checkToken`, {
      token,
    });

    console.log("Token check response:", response);

    if (response.status === 200) {
      store.dispatch(loginSuccess()); // Dispatch login success action
    }
    // Handle response as needed
  } catch (error) {
    console.error("Error during token check:", error);
    // Handle error
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("rememberToken");
  store.dispatch(logoutSuccess()); // Dispatch logout success action
};

///////////////////
const getClients = () => {
  return (dispatch) => {
    const clients = store.getState().clients; // Az ügyfelek állapotának lekérése a store-ból
    return clients; // Visszaadja az ügyfelek adatait
  };
};

const getClient = (clientId) => {
  return (dispatch) => {
    const clients = store.getState().clients;
    const client = clients.find((client) => client.ClientId === clientId);
    return client; // Visszaadja az ügyfelek adatait
  };
};

const getWork = (workId) => {
  return (dispatch) => {
    const works = store.getState().works;
    const work = works.find((work) => work.workId === workId);
    return work; // Visszaadja az ügyfelek adatait
  };
};
const getObject = (objectID) => {
  return (dispatch) => {
    const objects = store.getState().objects;
    const object = objects.find((object) => object.key === objectID);
    return object; // Visszaadja az ügyfelek adatait
  };
};
const getScript = (scriptId) => {
  return (dispatch) => {
    const scripts = store.getState().scripts;
    const script = scripts.find((script) => script.scriptId === scriptId);
    return script; // Visszaadja az ügyfelek adatait
  };
};

const getWorks = () => {
  return (dispatch) => {
    const works = store.getState().works; // Az ügyfelek állapotának lekérése a store-ból
    return works; // Visszaadja az ügyfelek adatait
  };
};

const getObjects = () => {
  return (dispatch) => {
    const objects = store.getState().objects; // Az ügyfelek állapotának lekérése a store-ból
    return objects; // Visszaadja az ügyfelek adatait
  };
};
const getScripts = () => {
  return (dispatch) => {
    const scripts = store.getState().scripts; // Az ügyfelek állapotának lekérése a store-ból
    return scripts; // Visszaadja az ügyfelek adatait
  };
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
  loginApi,
  checkToken,
  getClient,
  getWork,
  getObject,
  getScript,
  getClients,
  getWorks,
  getScripts,
  getObjects,
  addClient,
  addWork,
  addColor,
  addScript,
  addObject,
  modifyObject,
  logout,
};
