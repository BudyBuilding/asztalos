//storeManager.js
import clientApi from "../../data/api/clientApi";
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

export const fetchAll = () => {
  console.log("fetching");
  fetchClients();
  fetchWorks();
};
