// objectStoreFunctions.js
///////////
// Actions
export const addObject = (object) => ({
  type: "ADD_OBJECT",
  payload: object,
});

export const modifyObject = (modifiedObject) => ({
  type: "MODIFY_OBJECT",
  payload: modifiedObject,
});

export const selectObject = (objectKey) => ({
  type: "SELECT_OBJECT",
  payload: objectKey,
});

///////////
// Initialstate
const initialState = {
  objects: [],
  selectedObject: "0",
};

///////////
// Reducers
const objectReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_OBJECT":
      if (!state.some((obj) => obj.key === action.payload.key)) {
        return [...state, action.payload];
      }

    case "MODIFY_OBJECT":
      return state.map((obj) =>
        obj.key === action.payload.key ? action.payload : obj
      );
    default:
      return state;
  }
};

const selectedObjectReducer = (state = "0", action) => {
  switch (action.type) {
    case "SELECT_OBJECT":
      return action.payload;
    default:
      return state;
  }
};

export default { objectReducer, selectedObjectReducer };

///////////
// Getters
export const getAllObjects = (state) => state.objects;

export const getObjectById = (state, objectId) =>
  state.objects.find((object) => object.objectId === objectId);

export const getSelectedObject = (state) => state.selectedObject;
