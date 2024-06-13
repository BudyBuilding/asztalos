//reducers.js
import { combineReducers } from "redux";
import worksReducer from "../actions/workStoreFunctions";
import { clientsReducer } from "../actions/clientStoreFunctions";
import authReducer from "../actions/authStoreFunctions";
import objectReducer from "../actions/objectStoreFunctions";
import selectedObjectReducer from "../actions/objectStoreFunctions";
import colorReducer from "../actions/colorStoreFunctions";
import scriptReducer from "../actions/scriptStoreFunctions";

const initialState = {
  colors: {
    door: [],
    side: [],
    countertop: [],
    saved: [],
  },
  settings: [],
  items: [],
  objects: [],
  clients: [],
  works: [],
};

const settingsReducer = (state = initialState.settings, action) => {
  switch (action.type) {
    case "UPDATE_SETTINGS":
      return action.payload;
    default:
      return state;
  }
};

const itemsReducer = (state = initialState.items, action) => {
  switch (action.type) {
    case "UPDATE_ITEMS":
      return action.payload;
    default:
      return state;
  }
};

const reducers = combineReducers({
  clients: clientsReducer,
  works: worksReducer,
  auth: authReducer,
  colors: colorReducer,
  scripts: scriptReducer,
  selectedObject: selectedObjectReducer,
  settings: settingsReducer,
  items: itemsReducer,
  objects: objectReducer,
});

export default reducers;
