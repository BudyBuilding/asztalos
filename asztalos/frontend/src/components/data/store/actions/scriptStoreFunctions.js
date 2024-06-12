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

export const modifyScript = (modifiedScript) => ({
  type: "MODIFY_SCRIPT",
  payload: modifiedScript,
});

export const deleteScript = (scriptId) => ({
  type: "DELETE_SCRIPT",
  payload: scriptId,
});

///////////
// Initialstate
const initialState = {
  scripts: [],
};

///////////
// Reducers
const scriptReducer = (state = initialState.scripts, action) => {
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
    case "MODIFY_SCRIPT":
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

export default scriptReducer;

///////////
// Getters
export const getAllScripts = (state) => state.scripts;

export const getScriptById = (state, scriptId) =>
  state.scripts.find((script) => script.scriptId === scriptId);
