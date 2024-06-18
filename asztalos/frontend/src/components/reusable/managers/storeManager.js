//storeManager.js
import clientApi from "../../data/api/clientApi";
import scriptApi from "../../data/api/scriptApi";
import tableApi from "../../data/api/tableApi";
import workApi from "../../data/api/workApi";

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
  console.log("fetching the tables");
  scriptApi.getAllScriptsApi();
};

/////////////
export const fetchAll = () => {
  console.log("fetching");
  fetchClients();
  fetchWorks();
};
