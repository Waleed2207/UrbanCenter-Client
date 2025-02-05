import axios from "axios";
import { SERVER_URL } from "../../consts";

export const getUserReportsApi = (userId) => axios.get(`${SERVER_URL}/api/reports/report/user/${userId}`);

export const deleteReportApi = (reportId) => axios.delete(`${SERVER_URL}/api/reports/report/${reportId}`);

export const addReportApi = (reportData) => axios.post(`${SERVER_URL}/api/reports/report`, reportData);
