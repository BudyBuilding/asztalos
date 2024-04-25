//reducers.js
import { combineReducers } from "redux";

import {
  GET_CLIENTS_SUCCESS,
  GET_WORKS_SUCCESS,
  GET_SCRIPTS_SUCCESS,
  ADD_SCRIPT_SUCCESS,
  GET_OBJECT_SUCCESS,
  ADD_OBJECT_SUCCESS,
} from "../constants";
const clientsReducer = (state = [], action) => {
  switch (action.type) {
    case GET_CLIENTS_SUCCESS:
      return action.payload;
    case "ADD_CLIENT_SUCCESS":
      return [...state, action.payload];
    default:
      return state;
  }
};

const worksReducer = (state = [], action) => {
  switch (action.type) {
    case GET_WORKS_SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

const authReducer = (
  state = { isLoggedIn: false, user: null, error: null },
  action
) => {
  switch (action.type) {
    case "auth/loginSuccess":
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload,
        error: null,
      };
    case "auth/loginFailure":
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        error: action.payload,
      };
    case "auth/logout":
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      };
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

const initialState = {
  colors: {
    door: [],
    side: [],
    countertop: [],
    saved: [],
  },
  selectedObject: null,
  settings: [],
  items: [],
  objects: [],
};

const colorReducer = (state = initialState, action) => {
  switch (action.type) {
    case "UPDATE_COLORS":
      console.log("Updating colors with:", action.payload);
      return {
        ...state,
        colors: {
          ...state.colors,
          [action.payload.category]: [
            ...(state.colors[action.payload.category] || []),
            ...action.payload.colors,
          ],
        },
      };

    default:
      return state;
  }
};

const selectedObjectReducer = (state = initialState.selectedObject, action) => {
  switch (action.type) {
    case "SELECT_OBJECT":
      return action.payload;
    default:
      return state;
  }
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
const scriptsReducer = (state = [], action) => {
  switch (action.type) {
    case GET_SCRIPTS_SUCCESS:
      return action.payload;
    case "ADD_SCRIPT_SUCCESS":
      if (!state.includes(action.payload)) {
        return [...state, action.payload];
      }
    default:
      return state;
  }
};

const objectsReducer = (state = [], action) => {
  switch (action.type) {
    case GET_OBJECT_SUCCESS:
      return action.payload;
    case "ADD_OBJECT_SUCCESS":
      if (!state.some((obj) => obj.key === action.payload.key)) {
        return [...state, action.payload];
      }
    default:
      return state;
  }
};

const reducers = combineReducers({
  clients: clientsReducer,
  works: worksReducer,
  auth: authReducer,
  selectedClient: selectedClientReducer,
  colors: colorReducer,
  scripts: scriptsReducer,
  selectedObject: selectedObjectReducer,
  settings: settingsReducer,
  items: itemsReducer,
  objects: objectsReducer,
});

export default reducers;
