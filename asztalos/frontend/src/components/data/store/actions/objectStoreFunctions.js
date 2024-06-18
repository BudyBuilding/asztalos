// objectStoreFunctions.js
///////////
// Actions
export const addObject = (object) => ({
  type: "ADD_OBJECT",
  payload: object,
});

export const addMoreObjects = (objects) => ({
  type: "ADD_MORE_OBJECTS",
  payload: objects,
});

export const updateObject = (modifiedObject) => ({
  type: "UPDATE_OBJECT",
  payload: modifiedObject,
});

export const selectObject = (objectId) => ({
  type: "SELECT_OBJECT",
  payload: objectId,
});

export const setObjectLoading = (loading) => ({
  type: "SET_OBJECT_LOADING",
  payload: loading,
});

export const addcreatedItem = (createdItem) => ({
  type: "ADD_CREATED_ITEMS",
  payload: createdItem,
});

export const addMoreCreatedItems = (createdItems) => ({
  type: "ADD_MORE_CREATED_ITEMS",
  payload: createdItems,
});

///////////
// Initialstate
const initialState = {
  objects: [],
  selectedObject: "0",
  createdItems: [],
  objectLoading: false,
};

///////////
// Reducers
export const objectReducer = (state = initialState.objects, action) => {
  switch (action.type) {
    case "ADD_OBJECT":
      if (!state.some((obj) => obj.objectId === action.payload.objectId)) {
        return [...state, action.payload];
      }
    case "ADD_MORE_OBJECTS":
      const newObjects = action.payload.filter(
        (object) =>
          !state.some(
            (existingObject) => existingObject.objectId == object.objectId
          )
      );
      return [...state, ...newObjects];
    case "UPDATE_OBJECT":
      return state.map((obj) =>
        obj.objectId === action.payload.objectId ? action.payload : obj
      );
    default:
      return state;
  }
};

export const selectedObjectReducer = (
  state = initialState.selectedObject,
  action
) => {
  switch (action.type) {
    case "SELECT_OBJECT":
      return action.payload;
    default:
      return state;
  }
};

export const createdItemsReducer = (
  state = initialState.createdItems,
  action
) => {
  switch (action.type) {
    case "ADD_CREATED_ITEM":
      if (
        !state.some(
          (createdItem) => createdItem.itemId === action.payload.itemId
        )
      ) {
        return [...state, action.payload];
      }
      return state;
    case "ADD_MORE_CREATED_ITEMS":
      return [
        ...state,
        ...action.payload.filter(
          (createdItem) => !state.some((s) => s.itemId === createdItem.itemId)
        ),
      ];
    default:
      return state;
  }
};
export const objectLoadingReducer = (
  state = initialState.objectLoading,
  action
) => {
  switch (action.type) {
    case "SET_OBJECT_LOADING":
      return action.payload;
    default:
      return state;
  }
};
