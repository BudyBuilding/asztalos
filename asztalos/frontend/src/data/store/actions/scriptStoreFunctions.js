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

export const updateScriptItem = (modifiedScriptItem) => ({
  type: "UPDATE_SCRIPT_ITEM",
  payload: modifiedScriptItem,
});

export const deleteScriptItem = (itemId) => ({
  type: "DELETE_SCRIPT_ITEM",
  payload: itemId,
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
            (script) => !state.some(
              (s) => s.script_Id === script.scriptId || s.scriptId === script.scriptId
            )
          ),
        ];
        case "UPDATE_SCRIPT":    
          const updatedState = state.map((script) =>
            script.scriptId == action.payload.script_id
              ? { ...script, ...action.payload }
              : script
          );
                
          return updatedState;
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

export const scriptItemsReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_SCRIPT_ITEM":
      // egyszerűen hozzáfűz egy új elemet a tömbhöz
      return [...state, action.payload];

    case "ADD_MORE_SCRIPT_ITEMS":
      // csak azokat az elemeket adjuk hozzá, amik még nincsenek benne
      return [
        ...state,
        ...action.payload.filter(
          (item) => !state.some((s) => s.itemId === item.itemId)
        ),
      ];

    case "UPDATE_SCRIPT_ITEM":
      // a meglévő elemeket cseréli ki, ahol az ID egyezik
      return state.map((item) =>
        item.itemId == action.payload.itemId
          ? { ...item, ...action.payload }
          : item
      );

      case "DELETE_SCRIPT_ITEM":  
      // eltávolítja az adott ID-jű elemet    
      return state.filter((item) => item.itemId !== action.payload);        

    case "CLEAR_SELECTED_SCRIPT_ITEMS":
      // teljesen üríti a listát
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
