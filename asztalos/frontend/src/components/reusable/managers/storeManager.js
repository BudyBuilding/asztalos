//storeManager.js
import clientApi from "../../data/api/clientApi";
import workApi from "../../data/api/workApi";

export const fetchClients = () => {
  console.log("fetching the clients");
  clientApi.getAllClientsApi();
};

export const fetchWorks = () => {
  console.log("fetching the works");
  workApi.getAllWorksApi();
};

export const fetchAll = () => {
  console.log("fetching");
  fetchClients();
  fetchWorks();
};
