//apiService.js
import store from "../store/store"; // Redux store importálása
import axios from "axios";

import {
  getClientsSuccess,
  getClientSuccess,
  getWorksSuccess,
  addClientSuccess,
  getScriptsSuccess,
  deleteClientSuccess,
  addScriptSuccess,
  addObjectSuccess,
  modifyObjectSuccess,
  addWorkSuccess,
  selectObject,
  loginSuccess,
  logoutSuccess,
  modifyClientSuccess,
} from "../store/actions/actions"; // Frissítsd az elérési utat, ha szükséges

const amazonDNS = "ec2-100-27-218-52.compute-1.amazonaws.com";

const BASE_URL = `http://${amazonDNS}:9000`; // Az API alapértelmezett URL-je

// Helper function to get the token from localStorage
const getToken = () => localStorage.getItem("userToken");
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
      localStorage.setItem("userToken", token);
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
// Data fetching actions

////////////////////
//Getters for clients
const getClients = () => {
  return async (dispatch) => {
    // A függvény visszatérési értéke egy aszinkron függvény
    try {
      const response = await axiosInstance.get("/clients");
      dispatch(getClientsSuccess(response.data)); // API válasz feldolgozása és diszpácselése a store-ba
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  };
};

const getClientFromStore = (clientId) => {
  return (dispatch) => {
    const clients = store.getState().clients;
    const client = clients.find((client) => client.clientId === clientId);
    return client; // Visszaadja az ügyfelek adatait
  };
};

const getClientFromBackend = (clientId) => {
  return async (dispatch) => {
    // A függvény visszatérési értéke egy aszinkron függvény
    try {
      const response = await axiosInstance.get(`/clients/${clientId}`);
      dispatch(getClientSuccess(response.data)); // API válasz feldolgozása és diszpácselése a store-ba
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  };
};

// Getters for works
const getWorkById = (workId) => {
  return async (dispatch) => {
    try {
      const response = await axiosInstance.get(`/works/${workId}`);
      dispatch(getWorksSuccess(response.data)); // Adatok diszpatchelése a store-ba
    } catch (error) {
      console.error(`Error fetching work ${workId}:`, error);
      throw error;
    }
  };
};

const getAllWorks = () => {
  return async (dispatch) => {
    try {
      const response = await axiosInstance.get("/works");
      console.log(response.data);
      dispatch(getWorksSuccess(response.data));
      return response.data;
    } catch (error) {
      console.error("Error fetching all works:", error);
      throw error;
    }
  };
};

const getWorksByClient = (clientId) => {
  return async (dispatch) => {
    try {
      const response = await axiosInstance.get(`/clients/${clientId}/works`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching works for client ${clientId}:`, error);
      throw error;
    }
  };
};

//////////////////

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
/*
const getWorks = () => {
  return (dispatch) => {
    const works = store.getState().works; // Az ügyfelek állapotának lekérése a store-ból
    return works; // Visszaadja az ügyfelek adatait
  };
};
*/
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

///////////////////////
//Deleting section
const deleteClient = (clientId) => {
  return async (dispatch) => {
    try {
      console.log(clientId);
      await axiosInstance.delete(`/clients/${clientId}`);
      console.log("Client deleted successfully.");
      dispatch(deleteClientSuccess(clientId));
    } catch (error) {
      console.error("Error while deleting client:", error);
      throw error;
    }
  };
};

export default deleteClient;

////////////////////
// Updating section
const updateClient = (clientId, updatedClientData) => {
  return async (dispatch) => {
    try {
      await axiosInstance.put(`/clients/${clientId}`, updatedClientData);
      dispatch(modifyClientSuccess(updatedClientData));
    } catch (error) {
      console.error("Error while updating client:", error);
      throw error;
    }
  };
};

const addClient = (clientData) => {
  return async (dispatch) => {
    try {
      const response = await axiosInstance.post(`/clients`, clientData);
      console.log("Client added successfully:", response.data);

      // Frissítjük a kliensek állapotát a frissen hozzáadott klienssel
      dispatch(getClientsSuccess([...store.getState().clients, response.data]));

      return response.data;
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
  getClientFromStore,
  getClientFromBackend,
  getWorkById,
  getAllWorks,
  getWorksByClient,
  getObject,
  getScript,
  getClients,
  getScripts,
  getObjects,
  deleteClient,
  addClient,
  addWork,
  addColor,
  updateClient,
  addScript,
  addObject,
  modifyObject,
  logout,
};
