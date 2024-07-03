// colorStoreFunctions.js
///////////
// Actions
export const addColorStart = () => ({
  type: "ADD_COLOR_START",
});

export const addColorSuccess = (color) => ({
  type: "ADD_COLOR_SUCCESS",
  payload: color,
});

///////////
// Initialstate
const initialState = {
  colors: {
    door: [],
    side: [],
    countertop: [],
    saved: [],
  },
};

///////////
// Reducers
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

export default colorReducer;

///////////
// Getters
export const getAllColors = (state) => state.colors;

export const getColorById = (state, colorId) =>
  state.colors.find((color) => color.colorId === colorId);
