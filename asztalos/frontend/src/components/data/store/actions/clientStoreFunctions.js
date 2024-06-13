// clientStoreFunctions.js

///////////
// Actions
export const addClient = (client) => ({
  type: "ADD_CLIENT",
  payload: client,
});

export const loadClients = (clients) => ({
  type: "LOAD_CLIENT",
  payload: clients,
});

export const addMoreClients = (clients) => ({
  type: "ADD_MORE_CLIENTS",
  payload: clients,
});

export const updateClient = (modifiedClient) => ({
  type: "UPDATE_CLIENT",
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
  selectedClient: null,
};

///////////
// Reducers
export const clientsReducer = (state = initialState.clients, action) => {
  switch (action.type) {
    case "GET_CLIENTS":
      return action.payload;
    case "LOAD_CLIENTS":
      console.log("loading clients from store");
      return action.payload; // Assuming action.payload is an array of clients
    case "ADD_CLIENT":
      if (
        !state.some((client) => client.clientId === action.payload.clientId)
      ) {
        return [...state, action.payload];
      }
      return state;
    case "ADD_MORE_CLIENTS":
      const newClients = action.payload.filter(
        (client) =>
          !state.some(
            (existingClient) => existingClient.clientId === client.clientId
          )
      );
      return [...state, ...newClients];
    case "UPDATE_CLIENT":
      return state.map((client) =>
        client.clientId === action.payload.clientId ? action.payload : client
      );
    case "DELETE_CLIENT":
      return state.filter((client) => client.clientId !== action.payload);
    default:
      return state;
  }
};

export const selectedClientReducer = (
  state = initialState.selectedClient,
  action
) => {
  switch (action.type) {
    case "SELECT_CLIENT":
      return action.payload;
    default:
      return state;
  }
};

///////////
// Getters
export const getAllClients = (state) => state.clients;

export const getClientById = (state, clientId) =>
  state.clients.find((client) => client.clientId === clientId);

export const getSelectedClient = (state) => state.selectedClient;
