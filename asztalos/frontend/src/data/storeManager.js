//storeManager.js
import clientApi from "./api/clientApi";
import objectApi from "./api/objectApi";
import scriptApi from "./api/scriptApi";
import colorApi from "./api/colorApi";
import imageApi from "./api/imageApi";
import scriptItemApi from "./api/scriptItemApi";
import tableApi from "./api/tableApi";
import workApi from "./api/workApi";
import createdItemApi from "./api/createdItemApi";
import settingsApi from "./api/settingsApi";
import authApi from "./api/authApi";
import store from "./store/store";

// users
export const fetchUsers = () => {
  authApi.getAllUsersApi();
};

// clients
export const fetchClients = () => {
  clientApi.getAllClientsApi();
};

// works
export const fetchWorks = () => {
  workApi.getAllWorksApi();
};

// tables
export const fetchTables = (workId) => {
  tableApi.getAllTableOfWorkApi(workId);
};

// scripts
export const fetchScripts = () => {
  scriptApi.getAllScriptsApi();
};

// colors
export const fetchColors = () => {
  colorApi.getAllColorsApi();
};

// images
export const fetchImages = () => {
  imageApi.getAllImagesApi();
};

// script Items
export const fetchScriptItemsForScript = (selectedScript) => {
  scriptItemApi.getAllScriptItemsForScriptApi(selectedScript);
};

// objects
export const fetchObjects = () => {
  objectApi.getAllObjectsApi();
};

// created items for object
export const fetchCreatedItemsForObject = (objectId) => {
  createdItemApi.getAllCreatedItemsForObjectApi(objectId);
};

// created items for work
export const fetchCreatedItemsForWork = (workId) => {
  createdItemApi.getAllCreatedItemsForWorkApi(workId);
};

// objects for work
export const fetchObjectsForWork = (selectedWork) => {
  objectApi.getObjectOfWorkApi(selectedWork);
};

// settings
export const fetchSettings = () => {
  settingsApi.getAllSettingsApi();
};

// settings by work
export const fetchSettingsByWork = () => {
  settingsApi.getAllSettingOfWorkApi();
};

// settings
export const fetchSettingsByList = () => {
  settingsApi.getAllSettingOfListOfIdsApi();
};

/////////////
export const fetchAll = async () => {
  const currentUser = store.getState().auth.user;

  try {
    if (currentUser.role === "admin") {
      await fetchUsers();
    }
    await fetchColors();
    await fetchImages();
    await fetchClients();
    await fetchWorks();
    await fetchScripts();
    await fetchSettings();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
