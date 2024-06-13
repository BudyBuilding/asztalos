//storeManager.js
import clientApi from "../../data/api/clientApi";
import { getAllClients } from "../../data/api/clientApi";

export const fetchClients = () => {
  console.log("fetching the clients");
  clientApi.getAllClients();
};

export const fetchAll = () => {
  console.log("fetching");
  fetchClients();
};
