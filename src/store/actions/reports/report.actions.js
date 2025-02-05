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
  
  import { getUserReportsApi, deleteReportApi, addReportApi } from "../../api/report.api";
  
  /** 🔥 Fetch Reports */
  export const fetchReports = (userId) => async (dispatch) => {
    dispatch(fetchReportsStart());
    try {
      const response = await getUserReportsApi(userId);
      dispatch(fetchReportsSuccess(response.data.reports));
    } catch (error) {
      dispatch(fetchReportsFailed({ message: "Error fetching reports" }));
    }
  };
  
  export const fetchReportsStart = () => ({ type: FETCH_REPORTS_START });
  
  export const fetchReportsSuccess = (reports) => ({
    type: FETCH_REPORTS_SUCCESS,
    payload: { reports }
  });
  
  export const fetchReportsFailed = (error) => ({
    type: FETCH_REPORTS_FAILED,
    payload: { error }
  });
  
  /** 🔥 Delete Report */
  export const deleteReport = (reportId) => async (dispatch) => {
    dispatch(deleteReportStart());
    try {
      await deleteReportApi(reportId);
      dispatch(deleteReportSuccess(reportId));
    } catch (error) {
      dispatch(deleteReportFailed({ message: "Error deleting report" }));
    }
  };
  
  export const deleteReportStart = () => ({ type: DELETE_REPORT_START });
  
  export const deleteReportSuccess = (reportId) => ({
    type: DELETE_REPORT_SUCCESS,
    payload: { reportId }
  });
  
  export const deleteReportFailed = (error) => ({
    type: DELETE_REPORT_FAILED,
    payload: { error }
  });
  
  /** 🔥 Add Report */
  export const addReport = (reportData) => async (dispatch) => {
    dispatch(addReportStart());
    try {
      const response = await addReportApi(reportData);
      dispatch(addReportSuccess(response.data));
    } catch (error) {
      dispatch(addReportFailed({ message: "Error adding report" }));
    }
  };
  
  export const addReportStart = () => ({ type: ADD_REPORT_START });
  
  export const addReportSuccess = (report) => ({
    type: ADD_REPORT_SUCCESS,
    payload: { report }
  });
  
  export const addReportFailed = (error) => ({
    type: ADD_REPORT_FAILED,
    payload: { error }
  });
  