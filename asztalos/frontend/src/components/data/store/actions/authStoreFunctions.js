//authStoreFunctions.js
///////////
// Actions
export const login = () => ({
  type: "auth/loginStart",
});

export const loginSuccess = (user) => ({
  type: "auth/loginSuccess",
  payload: user,
});

export const loginFailure = (error) => ({
  type: "auth/loginFailure",
  payload: error,
});

export const logoutFailure = (error) => ({
  type: "auth/loginFailure",
  payload: error,
});

export const logoutSuccess = () => ({
  type: "auth/logout",
});

///////////
// Initialstate
const initialState = {};

///////////
// Reducers
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
    case "auth/logoutFailure":
      return {
        ...state,
        isLoggedIn: true,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;

///////////
// Getters
