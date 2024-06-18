// scriptStoreFunctions.js
///////////
// Actions
export const addScript = (script) => ({
  type: "ADD_SCRIPT",
  payload: script,
});

export const addMoreScripts = (scripts) => ({
  type: "ADD_MORE_SCRIPTS",
  payload: scripts,
});

export const updateScript = (modifiedScript) => ({
  type: "UPDATE_SCRIPT",
  payload: modifiedScript,
});

export const deleteScript = (scriptId) => ({
  type: "DELETE_SCRIPT",
  payload: scriptId,
});

export const selectScript = (scriptId) => ({
  type: "SELECT_SCRIPT",
  payload: scriptId,
});
export const addScriptItem = (sciptItem) => ({
  type: "ADD_SCRIPT_ITEM",
  payload: sciptItem,
});

export const addMoreScriptItems = (sciptItems) => ({
  type: "ADD_MORE_SCRIPT_ITEMS",
  payload: sciptItems,
});

export const clearSelectedScriptItems = () => ({
  type: "CLEAR_SELECTED_SCRIPT_ITEMS",
});

///////////
// Initialstate
const initialState = {
  scripts: [],
  selectedScript: [],
  selectedScriptItems: [],
};

///////////
// Reducers
export const scriptReducer = (state = initialState.scripts, action) => {
  switch (action.type) {
    case "ADD_SCRIPT":
      if (
        !state.some((script) => script.scriptId === action.payload.scriptId)
      ) {
        return [...state, action.payload];
      }
      return state;
    case "ADD_MORE_SCRIPTS":
      return [
        ...state,
        ...action.payload.filter(
          (script) => !state.some((s) => s.scriptId === script.scriptId)
        ),
      ];
    case "UPDATE_SCRIPT":
      return state.map((script) =>
        script.scriptId === action.payload.scriptId
          ? { ...script, ...action.payload }
          : script
      );
    case "DELETE_SCRIPT":
      return state.filter((script) => script.scriptId !== action.payload);
    default:
      return state;
  }
};

export const selectedScriptReducer = (state = "0", action) => {
  switch (action.type) {
    case "SELECT_SCRIPT":
      return action.payload;
    default:
      return state;
  }
};

export const selectedScriptItemsReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_SCRIPT_ITEM":
      return [
        ...state,
        ...action.payload.filter(
          (scriptItem) => !state.some((s) => s.itemId === scriptItem.itemId)
        ),
      ];
    case "ADD_MORE_SCRIPT_ITEMS":
      return [
        ...state,
        ...action.payload.filter(
          (scriptItem) => !state.some((s) => s.itemId === scriptItem.itemId)
        ),
      ];
    case "CLEAR_SELECTED_SCRIPT_ITEMS":
      return [];
    default:
      return state;
  }
};

///////////
// Getters
export const getAllScripts = (state) => state.scripts;

export const getScriptById = (state, scriptId) =>
  state.scripts.find((script) => script.scriptId === scriptId);
