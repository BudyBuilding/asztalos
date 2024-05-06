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
};
