import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import { Typography, Box, Collapse, Alert, Backdrop, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material'; 
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment-timezone";
import io from "socket.io-client"; 
import DataTable from '../DataTable';
import AddRuleDialog from '../../components/AddRuleDialog/AddRuleDialog';
import { SERVER_URL } from "../../consts";
import AuthContext from "../../contexts/AuthContext"; 
import ReportCard from "../../components/ReportCard/ReportCard"; 
import LoadingIndicator from "../../components/LoadingIndicator/LoadingIndicator"; 

const socket = io(SERVER_URL);
const ReportTable = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openCollapse, setOpenCollapse] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate(); 
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const locationCache = useRef(new Map()); // 🔥 Cache for location names
  const [selectedReport, setSelectedReport] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // 🔊 Audio references for sound notifications
  const reportAddedSound = useRef(new Audio("/sounds/reportAdded.mp3"));
  const reportUpdatedSound = useRef(new Audio("/sounds/reportUpdated.mp3"));
  const reportDeletedSound = useRef(new Audio("/sounds/reportDeleted.mp3"));

  useEffect(() => {
    const setupAudio = () => {
      reportAddedSound.current = new Audio("/sounds/reportAdded.mp3");
      reportUpdatedSound.current = new Audio("/sounds/reportUpdated.mp3");
      reportDeletedSound.current = new Audio("/sounds/reportDeleted.mp3");
  
      // Force the browser to start loading the file
      [reportAddedSound.current, reportUpdatedSound.current, reportDeletedSound.current].forEach(audio => {
        audio.preload = "auto"; // Ensures file is preloaded
        audio.load(); // Forces loading the audio
      });
  
      console.log("🔊 Audio initialized:", {
        added: reportAddedSound.current.readyState,
        updated: reportUpdatedSound.current.readyState,
        deleted: reportDeletedSound.current.readyState
      });
    };
  
    setupAudio();
  }, []);
  
  
useEffect(() => {
  const unlockAudio = async () => {
    setUserInteracted(true);

    try {
      // Attempt to play a silent sound to unlock autoplay
      await reportUpdatedSound.current.play();
      reportUpdatedSound.current.pause();
      console.log("✅ Audio unlocked");
    } catch (error) {
      console.warn("🚨 Audio unlock failed:", error);
    }

    // Remove event listeners after first interaction
    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("keydown", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
  };

  // Add event listeners for user interaction
  document.addEventListener("click", unlockAudio, { once: true });
  document.addEventListener("keydown", unlockAudio, { once: true });
  document.addEventListener("touchstart", unlockAudio, { once: true });

  return () => {
    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("keydown", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
  };
}, []);

  
  

  useEffect(() => {
    if (user && user._id) {
      socket.emit("registerUser", user._id);
    }
  }, [user]);

  const fetchReports = useCallback(async () => {
    if (!user || !user._id) return;
  
    const controller = new AbortController();
    const signal = controller.signal;
  
    try {
      setIsLoading(true);
      setError(null);
      
      let endpoint = `${SERVER_URL}/api/reports/report/user/${user._id}`;
  
      if (user.role === "authority") {
        endpoint = `${SERVER_URL}/api/reports/report/category/${user._id}`;
      }
  
      const response = await axios.get(endpoint, { signal });
      if (response.status !== 200) {
        throw new Error("Failed to fetch reports");
      }
      const data = response.data;
  
      if (Array.isArray(data.reports)) {
        const locationPromises = data.reports.map(async (report) => {
          const location_name = await fetchLocationName(report.location_lat, report.location_long);
          return {
            ...report,
            location_name,
            id: report._id,
            created_at: report.created_at ? moment(report.created_at).format("YYYY-MM-DD HH:mm:ss") : "N/A",
            updated_at: report.updated_at ? moment(report.updated_at).format("YYYY-MM-DD HH:mm:ss") : "N/A",
          };
        });
  
        const locations = await Promise.allSettled(locationPromises);
        setReports(locations.filter(p => p.status === "fulfilled").map(p => p.value));
      } else {
        setReports([]);
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Request canceled:", err.message);
      } else {
        setError(err.message);
        setOpenCollapse(true);
      }
    } finally {
      setIsLoading(false);
    }
  
    return () => controller.abort(); // Cleanup
  }, [user]);
  

    useEffect(() => {
    socket.on("reportAdded", (newReport) => {
      if (user?.role === "authority" && newReport.category === user.related_category) {
        setMessage(`📢 A new report has been added! \n
          Category: ${newReport.category} \n
          Reported by: ${newReport.citizen_name}`);
                  fetchReports();
        setOpenCollapse(true);
      }
      setReports((prev) => [...prev, newReport]);
      if (userInteracted) {
        reportAddedSound.current.play().catch(err => console.error("Error playing sound:", err));
      }    
    });

    socket.on("reportUpdated", (updatedReport) => {
      // ✅ Notify authority users about the update if they are responsible for this category
      if (user?.role === "authority" && updatedReport.category === user.related_category) {
        setMessage(`📢 A report has been updated! \n
          Category: ${updatedReport.category} \n
          Updated by: ${updatedReport.citizen_name}`);
        fetchReports(); // Refresh reports
        setOpenCollapse(true);
      }
  
      // ✅ Notify citizens if their report status is updated
      if (user?.role === "citizen" && updatedReport.citizen_id === user._id) {
        setMessage(`🔔 Your report status has been updated! \n
          📌 Category: ${updatedReport.category || "Unknown Category"} > ${updatedReport.subcategory || "Unknown Subcategory"} \n
          📝 Description: ${updatedReport.description || "No description provided"} \n
          🔥 Priority: ${updatedReport.priority || "Not specified"} \n
          ✅ New Status: ${updatedReport.status}`);
        fetchReports();
        setOpenCollapse(true);
      }
      // ✅ Update the state to reflect the new status
      setReports((prev) =>
        prev.map((report) =>
          report._id === updatedReport.report_id
            ? { ...report, status: updatedReport.status }
            : report
        )
      );
      // 🔥 Play sound only when user has interacted and audio is ready
      if (userInteracted && reportUpdatedSound.current.readyState >= 2) {
        console.log("🎵 Playing report updated sound...");
        reportUpdatedSound.current.play().catch(err => console.error("❌ Error playing sound:", err));
      } else {
        console.warn("🚨 Sound not playing: userInteracted =", userInteracted, " | readyState =", reportUpdatedSound.current.readyState);
      }
    });

    socket.on("reportDeleted", (deletedReportId) => {
      if (user?.role === "authority") {
        setMessage(`📢 A report has been deleted! \n
        Category: ${deletedReportId.category} \n
        Deleted by: ${deletedReportId.citizen_name}`);    
        fetchReports();    
        setOpenCollapse(true);
      }
      setReports((prev) => prev.filter((report) => report._id !== deletedReportId));
      if (userInteracted) {
        reportDeletedSound.current.play().catch(err => console.error("Error playing sound:", err));
      }
    });

    return () => {
      socket.off("reportAdded");
      socket.off("reportUpdated");
      socket.off("reportDeleted");
    };
  }, [user, fetchReports, userInteracted]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);


  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setOpenCollapse(true);
    }
    if (location.state?.error) {
      setError(location.state.error);
      setOpenCollapse(true);
    }
  }, [location.state]);

  const handleImageClick = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenImageDialog(true);
  }, []);

  // 🔥 Use `useMemo` to prevent re-creating the `columns` array
  const columns = useMemo(() => [
    { field: "id", headerName: "Report ID", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "subcategory", headerName: "SubCategory", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "image_url",
      headerName: "Image",
      flex: 1,
      renderCell: (params) => (
        params.value ? (
          <img 
            src={params.value} 
            alt="Report" 
            style={{ width: "50px", height: "50px", objectFit: "cover", cursor: "pointer" }} 
            onClick={() => handleImageClick(params.value)}
          />
        ) : "No Image"
      ),
    },
    { field: "location_name", headerName: "Location", flex: 2 },
    { 
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const statusColors = {
          pending: "orange",
          in_progress: "blue",
          resolved: "green",
        };
        return <span style={{ color: statusColors[params.value] }}>{params.value}</span>;
      },
    },
    { 
      field: "priority",
      headerName: "Priority",
      flex: 1,
      renderCell: (params) => {
        const priorityColors = {
          low: "green",
          medium: "orange",
          high: "red",
        };
        return <span style={{ color: priorityColors[params.value], fontWeight: "bold" }}>{params.value}</span>;
      },
    },
    { 
      field: "created_at", 
      headerName: "Created At", 
      flex: 1,
      renderCell: (params) => (
        params.value !== "N/A" ? moment(params.value).format("MM/DD/YYYY hh:mm A") : "N/A"
      ),
    },
    { 
      field: "updated_at", 
      headerName: "Updated At", 
      flex: 1,
      renderCell: (params) => (
        params.value !== "N/A" ? moment(params.value).format("MM/DD/YYYY hh:mm A") : "N/A"
      ),
    },
  ], [handleImageClick]);

  // 🔥 Optimized function to fetch location names with caching
  const fetchLocationName = async (latitude, longitude) => {
    const key = `${latitude},${longitude}`;
    if (locationCache.current.has(key)) {
      return locationCache.current.get(key);
    }
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      if (response.data && response.data.display_name) {
        locationCache.current.set(key, response.data.display_name);
        return response.data.display_name;
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
    }
    return "Unknown Location";
  };



  const [newRule, setNewRule] = useState({
    source_ip: '',
    destination_ip: '',
    source_port: '',
    destination_port: '',
    protocol: '',
    state: '',
    action: '',
    rate_limit: '',
    log_action: '', // Set to empty string initially
  });
  
  const handleCloseCollapse = () => {
    setOpenCollapse(false);
  };

  const handleClickGoToReportPage = () => {
    navigate("/reports/api");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRule((prev) => ({
      ...prev,
      [name]: name === 'log_action' ? value === 'true' : value, // Handle boolean conversion
    }));
  };

  const handleSubmit = async () => {
    try {
      setOpenBackdrop(true);
      console.log('Submitting new rule:', newRule);

      // Validate required fields
      const requiredFields = ['source_ip', 'destination_ip', 'source_port', 'destination_port','rate_limit','limit_window', 'protocol', 'state', 'action'];
      for (const field of requiredFields) {
        if (!newRule[field]) {
          throw new Error(`Field ${field} is required`);
        }
      }

      const response = await fetch(`${SERVER_URL}/api-rule/rule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRule),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add new rule: ${errorData.error}`);
      }

      // fetchData();
      handleCloseDialog();
      setMessage("Rule added successfully");
      setOpenCollapse(true);
      setOpenBackdrop(false);

    } catch (err) {
      setError(err.message);
      setOpenCollapse(true);
      setOpenBackdrop(false);
    }
  };

  const handleOpenUpdateDialog = (report) => {
    setSelectedReport(report);
  };

const handleUpdateReport = async (updatedReport) => {
  try {
    setOpenBackdrop(true);

    const formData = new FormData();

    // Append text fields
    formData.append("user_id", updatedReport.user_id);
    formData.append("category", updatedReport.category);
    formData.append("subcategory", updatedReport.subcategory);
    formData.append("description", updatedReport.description);
    formData.append("location_lat", updatedReport.location_lat);
    formData.append("location_long", updatedReport.location_long);
    formData.append("priority", updatedReport.priority);
    formData.append("status", updatedReport.status);

    // Append image ONLY if it has changed
    if (updatedReport.image_url && updatedReport.image_url instanceof File) {
      formData.append("image", updatedReport.image_url);
    }

    const response = await axios.put(`${SERVER_URL}/api/reports/report/${updatedReport.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200) {
      // socket.emit("updateReport", response.data.report); // 🔥 Emit event to server
      setMessage("Report updated successfully");
      setOpenCollapse(true);
      await fetchReports();
    }
  } catch (err) {
    setError(err.message);
    setOpenCollapse(true);
  } finally {
    setOpenBackdrop(false);
  }
};
const handleDelete = async (selectedIds) => {
  try {
    setOpenBackdrop(true); // Show loading indicator

    // Use Promise.all to delete reports concurrently
    const deleteResponses = await Promise.all(
      selectedIds.map(async (id) => {
        try {
          const response = await fetch(`${SERVER_URL}/api/reports/report/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to delete report ${id}: ${errorData.error}`);
          }

          return id; // Return deleted report ID for confirmation
        } catch (err) {
          console.error(`Error deleting report ${id}:`, err.message);
          return null; // Ensure continued execution for other reports
        }
      })
    );

    // Filter out successfully deleted reports
    const successfullyDeleted = deleteResponses.filter((id) => id !== null);

    if (successfullyDeleted.length > 0) {
      setMessage(`Successfully deleted ${successfullyDeleted.length} report(s).`);

      // Update state without calling fetchReports() if all reports are removed
      setReports((prevReports) => {
        const updatedReports = prevReports.filter((report) => !successfullyDeleted.includes(report._id));
        return updatedReports.length > 0 ? updatedReports : []; // Ensure empty array if no reports left
      });
    } else {
      setMessage("No reports were deleted.");
    }

    setOpenCollapse(true);
    
    // Only fetch reports if there are reports left to prevent 404
    if (reports.length - successfullyDeleted.length > 0) {
      await fetchReports(); // Refresh only if necessary
    } else {
      setReports([]); // Clear reports to show "No reports found"
    }
    
  } catch (err) {
    console.error("Delete error:", err);
    setError(err.message);
    setOpenCollapse(true);
  } finally {
    setOpenBackdrop(false); // Hide loading indicator
  }
};
useEffect(() => {
  if (message || error) {
    setOpenCollapse(true); // Ensure the alert is visible when a message appears
    const timer = setTimeout(() => {
      setOpenCollapse(false);
    }, 20000); // Auto-hide after 20 seconds

    return () => clearTimeout(timer); // Cleanup function
  }
}, [message, error]);

  const handleStatusUpdate = (reportId, newStatus) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report._id === reportId ? { ...report, status: newStatus } : report
      )
    );
  };

  return (
    <Box>
      <Typography variant="h4">Reports</Typography>
      {user?.role === "citizen" ? (
      <Box display="flex" justifyContent="flex-end" mb={2} mt={4}>
        <Button variant="contained" color="primary" sx={{background: '#4caf50'}} fontWeight= 'bold' size='Bold' onClick={handleClickGoToReportPage}>
          Add New Report
        </Button>
      </Box>
     ) : null}
      <Collapse in={openCollapse}>
        <Alert variant="filled" severity={error ? 'error' : 'info'} sx={{ color: 'white', my: 3 }} onClose={handleCloseCollapse}>
          {error ? `${error}.` : message}
        </Alert>
      </Collapse>

      <LoadingIndicator isLoading={isLoading} />
      {user?.role === "authority" ? (
        <Grid 
          container 
          spacing={2} 
          justifyContent="center" 
          sx={{ 
            mt: 3, 
            margin: "10px auto", 
          }}
        >
          {reports.length > 0 ? (
            reports.map((report) => (
                <Box key={report._id} sx={{ display: "flex", justifyContent: "center", width: "75%" }}>
                  <ReportCard report={report} user={user} onUpdateStatus={handleStatusUpdate} />
                </Box>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="h6" color="textSecondary" sx={{ textAlign: "center", mt: 3 }}>
                No reports found in your category.
              </Typography>
            </Grid>
          )}
        </Grid>

      ) : (
      <> 
      <DataTable  
        data={reports} 
        columns={columns} 
        loading={isLoading}  
        handleDelete={handleDelete} 
        handleUpdate={handleOpenUpdateDialog}
        handleUpdateSubmit={handleUpdateReport}
        selectedReport={selectedReport}
        handleImageClick={handleImageClick}
        reloadHandler={fetchReports}
        />
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent>
          {selectedImage && <img src={selectedImage} alt="Selected Report" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
      <Backdrop sx={{ color: '#fff', zIndex: 2000 }} open={openBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <AddRuleDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onChange={handleChange}
        onSubmit={handleSubmit}
        newRule={newRule}
      />
      </>
      )}
    </Box>
  );
};

export default ReportTable;
