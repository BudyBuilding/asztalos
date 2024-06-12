// clientStoreFunctions.js;
///////////
// Actions
export const addClient = (client) => ({
  type: "ADD_CLIENT",
  payload: client,
});

export const modifyClient = (modifiedClient) => ({
  type: "MODIFY_CLIENT",
  payload: modifiedClient,
});

export const selectClient = (client) => ({
  type: "SELECT_CLIENT",
  payload: client,
});

export const deleteClient = (clientId) => ({
  type: "DELETE_CLIENT",
  payload: clientId,
});

///////////
// Initialstate
const initialState = {
  clients: [],
};

///////////
// Reducers
const clientsReducer = (state = initialState.clients, action) => {
  switch (action.type) {
    case "GET_CLIENTS":
      return action.payload;
    case "ADD_CLIENT":
      if (
        !state.some((client) => client.clientId === action.payload.clientId)
      ) {
        return [...state, action.payload];
      }
      return state;
    case "MODIFY_CLIENT":
      return state.map((client) =>
        client.clientId === action.payload.clientId ? action.payload : client
      );
    case "DELETE_CLIENT":
      return state.filter((client) => client.clientId !== action.payload);
    default:
      return state;
  }
};

const selectedClientReducer = (state = null, action) => {
  switch (action.type) {
    case "SELECT_CLIENT":
      return action.payload;
    default:
      return state;
  }
};

export default { clientsReducer, selectedClientReducer };

///////////
// Getters
export const getAllClients = (state) => state.clients;

export const getClientById = (state, clientId) =>
  state.clients.find((client) => client.clientId === clientId);

export const getSelectedClient = (state) => state.selectedClient;
