// workStoreFunctions.js
///////////
// Actions
export const deleteWorkSuccess = (workId) => ({
  type: "DELETE_WORK_SUCCESS",
  payload: workId,
});

export const addWorkSuccess = (work) => ({
  type: "ADD_WORK_SUCCESS",
  payload: work,
});

export const modifyWorkSuccess = (modifiedWork) => ({
  type: "MODIFY_WORK_SUCCESS",
  payload: modifiedWork,
});

///////////
// Initialstate
const initialState = {
  works: [],
};

///////////
// Reducers
const worksReducer = (state = initialState.works, action) => {
  switch (action.type) {
    case "ADD_WORK_SUCCESS":
      if (!state.some((work) => work.workId === action.payload.workId)) {
        return [...state, action.payload];
      } else {
        return state; // Visszatérés az állapottal, ha a feltétel nem teljesül
      }
    case "DELETE_WORK_SUCCESS":
      return state.filter((work) => work.workId !== action.payload);
    case "MODIFY_WORK_SUCCESS":
      return state.map((work) =>
        work.workId === action.payload.workId ? action.payload : work
      );
    default:
      return state;
  }
};

export default worksReducer;

///////////
// Getters
export const getAllWorks = (state) => state.works;

export const getWorkById = (state, workId) =>
  state.works.find((work) => work.workId === workId);
