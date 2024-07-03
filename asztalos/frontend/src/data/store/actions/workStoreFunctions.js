// workStoreFunctions.js

///////////
// Actions
export const addWork = (work) => ({
  type: "ADD_WORK",
  payload: work,
});

export const loadWorks = (works) => ({
  type: "LOAD_WORK",
  payload: works,
});

export const loadWorkById = (workId) => ({
  type: "LOAD_WORK_BY_ID",
  payload: workId,
});

export const addMoreWorks = (works) => ({
  type: "ADD_MORE_WORKS",
  payload: works,
});

export const updateWork = (modifiedWork) => ({
  type: "UPDATE_WORK",
  payload: modifiedWork,
});

export const selectWork = (work) => ({
  type: "SELECT_WORK",
  payload: work,
});

export const deleteWork = (workId) => ({
  type: "DELETE_WORK",
  payload: workId,
});

///////////
// Initialstate
const initialState = {
  works: [],
  selectedWork: null,
};

///////////
// Reducers
export const worksReducer = (state = initialState.works, action) => {
  switch (action.type) {
    case "LOAD_WORKS":
      console.log("loading works from store");
      return action.payload; // Assuming action.payload is an array of works
    case "LOAD_WORK_BY_ID":
      const work = state.find((work) => work.workId === action.payload);
      return {
        work,
      };
    case "ADD_WORK":
      if (!state.some((work) => work.workId === action.payload.workId)) {
        return [...state, action.payload];
      }
      return state;
    case "ADD_MORE_WORKS":
      const newWorks = action.payload.filter(
        (work) =>
          !state.some((existingWork) => existingWork.workId === work.workId)
      );
      return [...state, ...newWorks];
    case "UPDATE_WORK":
      console.log("updation a work wtih: ", action.payload);
      return state.map((work) => {
        if (work.workId === action.payload.workId) {
          console.log("bingo");
        }
        work = work.workId === action.payload.workId ? action.payload : work;
        return work;
      });
    case "DELETE_WORK":
      return state.filter((work) => work.workId !== action.payload);
    default:
      return state;
  }
};

export const selectedWorkReducer = (
  state = initialState.selectedWork,
  action
) => {
  switch (action.type) {
    case "SELECT_WORK":
      return action.payload;
    default:
      return state;
  }
};

///////////
// Getters
export const getAllWorks = (state) => state.works;

export const getWorkById = (state, workId) =>
  state.works.find((work) => work.workId === workId);

export const getSelectedWork = (state) => state.selectedWork;
