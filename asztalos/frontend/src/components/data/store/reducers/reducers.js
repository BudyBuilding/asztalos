//reducers.js
import { combineReducers } from "redux";

import {
  GET_SCRIPTS_SUCCESS,
  GET_OBJECT_SUCCESS,
  SELECT_OBJECT,
  ADD_CLIENT_SUCCESS,
  MODIFY_OBJECT_SUCCESS,
} from "../constants";
import { act } from "react";

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

const clientsReducer = (state = initialState.clients, action) => {
  switch (action.type) {
    case "GET_CLIENTS_SUCCESS":
      return action.payload;
    case ADD_CLIENT_SUCCESS:
      if (
        !state.some((client) => client.ClientId === action.payload.ClientId)
      ) {
        return [...state, action.payload];
      } else {
        return state; // Visszatérés az állapottal, ha a feltétel nem teljesül
      }
    case "MODIFY_CLIENT_SUCCESS":
      return state.map((client) =>
        client.ClientId === action.payload.ClientId ? action.payload : client
      );
    case "DELETE_CLIENT_SUCCESS":
      return state.filter((client) => client.ClientId !== action.payload);
    default:
      return state;
  }
};

const worksReducer = (state = initialState.works, action) => {
  switch (action.type) {
    case "GET_WORK_SUCCESS":
      return action.payload;
    case "ADD_WORK_SUCCESS":
      if (!state.some((work) => work.workId === action.payload.workId)) {
        return [...state, action.payload];
      } else {
        return state; // Visszatérés az állapottal, ha a feltétel nem teljesül
      }
    case "MODIFY_WORK_SUCCESS":
      return state.map((work) =>
        work.workId === action.payload.workId ? action.payload : work
      );
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
    case "GET_SCRIPTS_SUCCESS":
      return action.payload;
    case "ADD_SCRIPT_SUCCESS":
      if (
        !state.some((script) => script.scriptId === action.payload.scriptId)
      ) {
        return [...state, action.payload];
      }
    case "MODIFY_SCRIPT_SUCCESS":
      return state.map((script) =>
        script.scriptId === action.payload.scriptId ? action.payload : script
      );
    default:
      return state;
  }
};

const objectsReducer = (state = [], action) => {
  switch (action.type) {
    case "GET_OBJECT_SUCCESS":
      return action.payload;

    case "ADD_OBJECT_SUCCESS":
      if (!state.some((obj) => obj.key === action.payload.key)) {
        return [...state, action.payload];
      }

    case "MODIFY_OBJECT_SUCCESS":
      return state.map((obj) =>
        obj.key === action.payload.key ? action.payload : obj
      );
    default:
      return state;
  }
};

const selectedObjectReducer = (state = "0", action) => {
  switch (action.type) {
    case SELECT_OBJECT:
      return action.payload;
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
