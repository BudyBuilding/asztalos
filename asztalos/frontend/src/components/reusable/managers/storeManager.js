//storeManager.js
import clientApi from "../../data/api/clientApi";
import objectApi from "../../data/api/objectApi";
import scriptApi from "../../data/api/scriptApi";
import scriptItemApi from "../../data/api/scriptItemApi";
import tableApi from "../../data/api/tableApi";
import workApi from "../../data/api/workApi";
import createdItemApi from "../../data/api/createdItemApi";
import settingsApi from "../../data/api/settingsApi";

export const fetchClients = () => {
  console.log("fetching the clients");
  clientApi.getAllClientsApi();
};

export const fetchWorks = () => {
  console.log("fetching the works");
  workApi.getAllWorksApi();
};

export const fetchTables = (workId) => {
  console.log("fetching the tables");
  tableApi.getAllTableOfWorkApi(workId);
};

export const fetchScripts = () => {
  console.log("fetching the scripts");
  scriptApi.getAllScriptsApi();
};

export const fetchScriptItemsForScript = (selectedScript) => {
  console.log("fetching the scripts for: ", selectedScript);
  scriptItemApi.getAllScriptItemsForScriptApi(selectedScript);
};

export const fetchObjects = () => {
  console.log("fetching the objects");
  scriptApi.getAllObjectsApi();
};

export const fetchCreatedItemsForObject = (objectId) => {
  console.log("fetching the scripts for object: ", objectId);
  createdItemApi.getAllCreatedItemsForObjectApi(objectId);
};

export const fetchCreatedItemsForWork = (workId) => {
  console.log("fetching the scripts for work: ", workId);
  createdItemApi.getAllCreatedItemsForWorkApi(workId);
};

export const fetchObjectsForWork = (selectedWork) => {
  console.log("fetching objects for the ", selectedWork);
  objectApi.getObjectOfWorkApi(selectedWork);
};

export const fetchSettings = () => {
  console.log("fetching the settings");
  settingsApi.getAllSettingsApi();
};

export const fetchSettingsByWork = () => {
  console.log("fetching the settings");
  settingsApi.getAllSettingOfWorkApi();
};
/*
export const fetchSettingsByObject = () => {
  console.log("fetching the settings");
  settingsApi.getAllSettingsApi();
};

export const fetchSettingsByScript = () => {
  console.log("fetching the settings");
  settingsApi.getAllSettingsApi();
};
*/
export const fetchSettingsByList = () => {
  console.log("fetching the settings");
  settingsApi.getAllSettingOfListOfIdsApi();
};

/////////////
export const fetchAll = () => {
  console.log("fetching");
  fetchClients();
  fetchWorks();
  fetchScripts();
  fetchSettings();
};
