// colorStoreFunctions.js
///////////
// Actions
export const addColor = (color) => ({
  type: "ADD_COLOR",
  payload: color,
});

export const addMoreColors = (colors) => ({
  type: "ADD_MORE_COLORS",
  payload: colors,
});

export const replaceStoreWithColor = (color) => ({
  type: "REPLACE_COLOR",
  payload: color,
});

export const replaceStoreWithMoreColors = (colors) => ({
  type: "REPLACE_MORE_COLORS",
  payload: colors,
});

export const updateColor = (modifiedColor) => ({
  type: "UPDATE_COLOR",
  payload: modifiedColor,
});

export const deleteColor = (colorId) => ({
  type: "DELETE_COLOR",
  payload: colorId,
});

export const selectColor = (colorId) => ({
  type: "SELECT_COLOR",
  payload: colorId,
});

export const setColorLoading = (loading) => ({
  type: "SET_COLOR_LOADING",
  payload: loading,
});

///////////
// Initialstate
const initialState = {
  colors: [],
  selectedColor: "0",
};

///////////
// Reducers
export const colorReducer = (state = initialState.colors, action) => {
  switch (action.type) {
    case "ADD_COLOR":
      if (!state.some((obj) => obj.colorId === action.payload.colorId)) {
        return [...state, action.payload];
      }
    case "ADD_MORE_COLORS":
      if (Array.isArray(action.payload)) {
        const newColors = action.payload.filter(
          (color) =>
            !state.some(
              (existingColor) => existingColor.colorId === color.colorId
            )
        );
        return [...state, ...newColors];
      }
      return state;
    case "REPLACE_COLOR":
      return action.payload;
    case "REPLACE_MORE_COLORS":
      return action.payload;
    case "UPDATE_COLOR":
      return state.map((obj) =>
        obj.colorId === action.payload.colorId ? action.payload : obj
      );
    case "DELETE_COLOR":
      return state.filter((obj) => obj.colorId !== action.payload);
    default:
      return state;
  }
};

export const selectedColorReducer = (
  state = initialState.selectedColor,
  action
) => {
  switch (action.type) {
    case "SELECT_COLOR":
      return action.payload;
    default:
      return state;
  }
};
