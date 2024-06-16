import store from "./store/store";
/////////////
//client
export const getClientById = (clientId) => {
  return (dispatch) => {
    const clients = store.getState().clients;
    const client = clients.find((client) => client.clientId == clientId);
    return client;
  };
};

export const getAllClients = () => {
  return (dispatch) => {
    const clients = store.getState().clients;
    return clients;
  };
};
////////////////
//work
export const getWorkById = (workId) => {
  return (dispatch) => {
    const works = store.getState().works;
    const work = works.find((work) => work.workId == workId);
    return work;
  };
};

export const getAllWorks = () => {
  return (dispatch) => {
    const works = store.getState().works;
    return works;
  };
};
////////////////
//table
export const getTableById = (tableId) => {
  return (dispatch) => {
    const tables = store.getState().tables;
    const table = tables.find((table) => table.tableId == tableId);
    return table;
  };
};

export const getAllTables = () => {
  return (dispatch) => {
    const tables = store.getState().tables;
    return tables;
  };
};
