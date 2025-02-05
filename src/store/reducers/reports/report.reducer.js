import {
    FETCH_REPORTS_START,
    FETCH_REPORTS_SUCCESS,
    FETCH_REPORTS_FAILED,
    DELETE_REPORT_START,
    DELETE_REPORT_SUCCESS,
    DELETE_REPORT_FAILED,
    ADD_REPORT_START,
    ADD_REPORT_SUCCESS,
    ADD_REPORT_FAILED
  } from "../../actionTypes/report.actiontypes";
  
  const initialState = {
    reports: [],
    loading: false,
    error: null
  };
  
  const reportReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_REPORTS_START:
      case DELETE_REPORT_START:
      case ADD_REPORT_START:
        return { ...state, loading: true, error: null };
  
      case FETCH_REPORTS_SUCCESS:
        return { ...state, loading: false, reports: action.payload.reports };
  
      case DELETE_REPORT_SUCCESS:
        return { 
          ...state, 
          loading: false, 
          reports: state.reports.filter(report => report._id !== action.payload.reportId) 
        };
  
      case ADD_REPORT_SUCCESS:
        return { ...state, loading: false, reports: [...state.reports, action.payload.report] };
  
      case FETCH_REPORTS_FAILED:
      case DELETE_REPORT_FAILED:
      case ADD_REPORT_FAILED:
        return { ...state, loading: false, error: action.payload.error };
  
      default:
        return state;
    }
  };
  
  export default reportReducer;
  