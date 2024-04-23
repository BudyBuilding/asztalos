//reducers.js
import { combineReducers } from "redux";
import {
  GET_CLIENTS_SUCCESS,
  GET_WORKS_SUCCESS,
  GET_SCRIPTS_SUCCESS,
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
const reducers = combineReducers({
  clients: clientsReducer,
  works: worksReducer,
  auth: authReducer,
  selectedClient: selectedClientReducer,
  colors: colorReducer,
  scripts: scriptsReducer,
});

export default reducers;
