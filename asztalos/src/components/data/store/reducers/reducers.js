//reducers.js
import { combineReducers } from "redux";
import { GET_CLIENTS_SUCCESS, GET_WORKS_SUCCESS } from "../constants";

const clientsReducer = (state = [], action) => {
  switch (action.type) {
    case GET_CLIENTS_SUCCESS:
      return action.payload;
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

const reducers = combineReducers({
  clients: clientsReducer,
  works: worksReducer,
  auth: authReducer,
});

export default reducers;
