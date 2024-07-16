//reducers.js
import { combineReducers } from "redux";
import {
  worksReducer,
  selectedWorkReducer,
} from "../actions/workStoreFunctions";
import {
  clientsReducer,
  selectedClientReducer,
} from "../actions/clientStoreFunctions";
import authReducer from "../actions/authStoreFunctions";
import {
  objectReducer,
  selectedObjectReducer,
  objectLoadingReducer,
  createdItemsReducer,
} from "../actions/objectStoreFunctions";
import { colorReducer } from "../actions/colorStoreFunctions";
import { imageReducer } from "../actions/imageStoreFunctions";
import {
  scriptReducer,
  selectedScriptReducer,
  selectedScriptItemsReducer,
} from "../actions/scriptStoreFunctions";
import { tablesReducer } from "../actions/tableStoreFunctions";
import { settingReducer } from "../actions/settingStoreFunctions";
const initialState = {
  colors: [],
  images: [],
  settings: [],
  items: [],
  objects: [],
  clients: [],
  works: [],
  tables: [],
  selectedWork: null,
  selectedClient: null,
  selectedScript: null,
  selectedScriptItems: [],
  objectLoading: false,
};

const settingsReducer = (state = initialState.settings, action) => {
  switch (action.type) {
    case "UPDATE_SETTINGS":
      return action.payload;
    default:
      return state;
  }
};

const itemsReducer = (state = initialState.items, action) => {
  switch (action.type) {
    case "UPDATE_ITEMS":
      return action.payload;
    default:
      return state;
  }
};

const reducers = combineReducers({
  selectedClient: selectedClientReducer,
  selectedWork: selectedWorkReducer,
  selectedScript: selectedScriptReducer,
  selectedScriptItems: selectedScriptItemsReducer,
  clients: clientsReducer,
  works: worksReducer,
  auth: authReducer,
  colors: colorReducer,
  images: imageReducer,
  scripts: scriptReducer,
  selectedObject: selectedObjectReducer,
  settings: settingsReducer,
  items: itemsReducer,
  objects: objectReducer,
  objectLoading: objectLoadingReducer,
  createdItems: createdItemsReducer,
  tables: tablesReducer,
  settings: settingReducer,
});

export default reducers;
