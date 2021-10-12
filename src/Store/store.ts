import { configureStore } from "@reduxjs/toolkit";
import quizReducer from "./quizSlice";
import { useDispatch } from "react-redux";

const store = configureStore({
  reducer: {
    quiz: quizReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
