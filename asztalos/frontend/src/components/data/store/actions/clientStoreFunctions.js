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

export const loadClientById = (clientId) => ({
  type: "LOAD_CLIENT_BY_ID",
  payload: clientId,
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
    case "LOAD_CLIENTS":
      console.log("loading clients from store");
      return action.payload; // Assuming action.payload is an array of clients
    case "LOAD_CLIENT_BY_ID":
      const client = state.find((client) => client.clientId === action.payload);
      return {
        client,
      };
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
      console.log("updation a client wtih: ", action.payload);
      return state.map((client) => {
        if (client.clientId === action.payload.clientId) {
          console.log("bingo");
        }
        client =
          client.clientId === action.payload.clientId ? action.payload : client;
        return client;
      });
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
