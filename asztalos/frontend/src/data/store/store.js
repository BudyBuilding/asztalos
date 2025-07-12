import { configureStore } from "@reduxjs/toolkit";
import reducers from "./reducers/reducers";

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false // ← ezt kapcsolod ki
    })
});

export default store;
