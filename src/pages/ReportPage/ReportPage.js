import React, { useState } from "react";
import AddReportStepper from "../../components/AddReportStepper/AddReportStepper";
import classes from "./ReportPage.module.scss";

const ReportPage = () => {
  const [reports, setReports] = useState([]); // Store submitted reports

  const handleReportSubmit = (report) => {
    console.log("New Report Added:", report);
    setReports((prevReports) => [report, ...prevReports]); // Add new report to list
  };

  return (
    <div className={classes.container}>
      <h2>Submit a New Report</h2>

      {/* ✅ AddReportStepper is now shown directly in the page */}
      <AddReportStepper onReportSubmit={handleReportSubmit} />

      {/* ✅ Display submitted reports */}
      {reports.length > 0 && (
        <div className={classes.reportsList}>
          <h3>Submitted Reports</h3>
          <ul>
            {reports.map((report, index) => (
              <li key={index}>{report.category} - {report.description}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
