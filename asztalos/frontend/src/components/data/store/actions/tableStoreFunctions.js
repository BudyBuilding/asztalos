// tableStoreFunctions.js

///////////
// Actions
export const addTable = (table) => ({
  type: "ADD_TABLE",
  payload: table,
});

export const loadTables = (tables) => ({
  type: "LOAD_TABLE",
  payload: tables,
});

export const loadTableById = (tableId) => ({
  type: "LOAD_TABLE_BY_ID",
  payload: tableId,
});

export const addMoreTables = (tables) => ({
  type: "ADD_MORE_TABLES",
  payload: tables,
});

export const updateTable = (modifiedTable) => ({
  type: "UPDATE_TABLE",
  payload: modifiedTable,
});

export const selectTable = (table) => ({
  type: "SELECT_TABLE",
  payload: table,
});

export const deleteTable = (tableId) => ({
  type: "DELETE_TABLE",
  payload: tableId,
});

///////////
// Initialstate
const initialState = {
  tables: [],
  selectedTable: null,
};

///////////
// Reducers
export const tablesReducer = (state = initialState.tables, action) => {
  switch (action.type) {
    case "LOAD_TABLES":
      console.log("loading tables from store");
      return action.payload; // Assuming action.payload is an array of tables
    case "LOAD_TABLE_BY_ID":
      const table = state.find((table) => table.tableId === action.payload);
      return {
        table,
      };
    case "ADD_TABLE":
      if (!state.some((table) => table.tableId === action.payload.tableId)) {
        return [...state, action.payload];
      }
      return state;
    case "ADD_MORE_TABLES":
      const newTables = action.payload.filter(
        (table) =>
          !state.some(
            (existingTable) => existingTable.tableId === table.tableId
          )
      );
      return [...state, ...newTables];
    case "UPDATE_TABLE":
      console.log("updation a table wtih: ", action.payload);
      return state.map((table) => {
        if (table.tableId === action.payload.tableId) {
          console.log("bingo");
        }
        table =
          table.tableId === action.payload.tableId ? action.payload : table;
        return table;
      });
    case "DELETE_TABLE":
      return state.filter((table) => table.tableId !== action.payload);
    default:
      return state;
  }
};

export const selectedTableReducer = (
  state = initialState.selectedTable,
  action
) => {
  switch (action.type) {
    case "SELECT_TABLE":
      return action.payload;
    default:
      return state;
  }
};

///////////
// Getters
export const getAllTables = (state) => state.tables;

export const getTableById = (state, tableId) =>
  state.tables.find((table) => table.tableId === tableId);

export const getSelectedTable = (state) => state.selectedTable;
