// settingStoreFunctions.js
///////////
// Actions
export const addSetting = (setting) => ({
  type: "ADD_SETTING",
  payload: setting,
});

export const addMoreSettings = (settings) => ({
  type: "ADD_MORE_SETTINGS",
  payload: settings,
});

export const updateSetting = (modifiedSetting) => ({
  type: "UPDATE_SETTING",
  payload: modifiedSetting,
});

export const deleteSetting = (settingId) => ({
  type: "DELETE_SETTING",
  payload: settingId,
});

export const selectSetting = (settingId) => ({
  type: "SELECT_SETTING",
  payload: settingId,
});
export const addSettingItem = (sciptItem) => ({
  type: "ADD_SETTING_ITEM",
  payload: sciptItem,
});

export const addMoreSettingItems = (sciptItems) => ({
  type: "ADD_MORE_SETTING_ITEMS",
  payload: sciptItems,
});

export const clearSelectedSettingItems = () => ({
  type: "CLEAR_SELECTED_SETTING_ITEMS",
});

///////////
// Initialstate
const initialState = {
  settings: [],
  selectedSetting: [],
  selectedSettingItems: [],
};

///////////
// Reducers
export const settingReducer = (state = initialState.settings, action) => {
  switch (action.type) {
    case "ADD_SETTING":
      if (
        !state.some((setting) => setting.settingId === action.payload.settingId)
      ) {
        return [...state, action.payload];
      }
      return state;
    case "ADD_MORE_SETTINGS":
      return [
        ...state,
        ...action.payload.filter(
          (setting) => !state.some((s) => s.settingId === setting.settingId)
        ),
      ];
    case "UPDATE_SETTING":
      return state.map((setting) =>
        setting.settingId === action.payload.settingId
          ? { ...setting, ...action.payload }
          : setting
      );
    case "DELETE_SETTING":
      return state.filter((setting) => setting.settingId !== action.payload);
    default:
      return state;
  }
};

export const selectedSettingReducer = (state = "0", action) => {
  switch (action.type) {
    case "SELECT_SETTING":
      return action.payload;
    default:
      return state;
  }
};

export const selectedSettingItemsReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_SETTING_ITEM":
      return [
        ...state,
        ...action.payload.filter(
          (settingItem) => !state.some((s) => s.itemId === settingItem.itemId)
        ),
      ];
    case "ADD_MORE_SETTING_ITEMS":
      return [
        ...state,
        ...action.payload.filter(
          (settingItem) => !state.some((s) => s.itemId === settingItem.itemId)
        ),
      ];
    case "CLEAR_SELECTED_SETTING_ITEMS":
      return [];
    default:
      return state;
  }
};

///////////
// Getters
export const getAllSettings = (state) => state.settings;

export const getSettingById = (state, settingId) =>
  state.settings.find((setting) => setting.settingId === settingId);
