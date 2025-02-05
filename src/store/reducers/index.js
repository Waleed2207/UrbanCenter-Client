// third-party
import { combineReducers } from "redux";

// project imports
import menu from "./menu";
import reportReducer from "./reports/report.reducer"; // ✅ Import reports reducer

// ==============================|| COMBINE REDUCERS ||============================== //

const rootReducer = combineReducers({
  menu, // ✅ Menu reducer
  reports: reportReducer, // ✅ Reports reducer

});

export default rootReducer;
