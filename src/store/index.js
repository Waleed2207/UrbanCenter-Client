import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers'; 

// ==============================|| REDUX TOOLKIT - MAIN STORE ||============================== //

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production", 
});

export default store;
export const dispatch = store.dispatch; 
