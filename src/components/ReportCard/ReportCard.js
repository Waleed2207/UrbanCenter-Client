import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Typography,
  Card,
  // CardContent,
  Grid,
  Box,
  Collapse,
  Alert,
  IconButton,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardMedia,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import moment from "moment-timezone";
import axios from "axios";
import { SERVER_URL } from "../../consts";

const ReportCard = ({ report, user, onUpdateStatus }) => {
  const [status, setStatus] = useState(report.status);
  const [openDialog, setOpenDialog] = useState(false); // 🔥 Dialog Control
  const [openCollapse, setOpenCollapse] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [error, setError] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // ✅ Close Alert
  const handleCloseCollapse = () => {
    setOpenCollapse(false);
  };

const handleStatusChange = async () => {
  try {
    let storedUserId = sessionStorage.getItem("sessionUserId");

    // 🔥 If sessionStorage is empty (e.g., after a refresh), restore from localStorage
    if (!storedUserId) {
      storedUserId = localStorage.getItem("lastUserId");
      if (storedUserId) {
        sessionStorage.setItem("sessionUserId", storedUserId); // Restore session
      }
    }

    console.log("Stored User ID:", storedUserId);

    if (!storedUserId) {
      setError(true);
      setAlertMessage("🚨 No active user found. Please log in again.");
      setOpenCollapse(true);
      return;
    }

    const token = localStorage.getItem(`token_${storedUserId}`);
    const storedUser = JSON.parse(localStorage.getItem(`user_${storedUserId}`));

    if (!token || !storedUser) {
      setError(true);
      setAlertMessage("🚨 Authentication error. Please log in again.");
      setOpenCollapse(true);
      return;
    }

    const response = await axios.put(
      `${SERVER_URL}/api/reports/report/status/${report._id}`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "User-ID": storedUser._id, 
        },
      }
    );

    if (response.status === 200) {
      console.log("✅ Status updated successfully:", response.data);
      onUpdateStatus(report._id, status);
      setAlertMessage("✅ Report status updated successfully!");
      setError(false);
      setOpenCollapse(true);
      setOpenDialog(false); // 🔥 Close Dialog after update
    }
  } catch (error) {
    console.error("🚨 Failed to update status:", error.response?.data || error);
    setError(true);
    setAlertMessage("❌ Failed to update report status. Please try again.");
    setOpenCollapse(true);
  }
};



return (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 3, width: "100%" }}>
    <Collapse in={openCollapse} sx={{ width: "100%" }}>
      <Alert severity={error ? "error" : "success"} onClose={handleCloseCollapse}>
        {alertMessage}
      </Alert>
    </Collapse>

    <Grid container justifyContent="center">
      <Grid item xs={12}>
        <Card
          sx={{
            boxShadow: 2,
            borderRadius: 3,
            overflow: "hidden",
            padding: 2,
            display: "flex",
            alignItems: "start",
            gap: 2,
          }}
        >
          {report.image_url && (
            <CardMedia
              component="img"
              sx={{ width: 100, height: 100, borderRadius: 2, objectFit: "cover", cursor: "pointer" }}
              image={report.image_url}
              alt="Report"
              onClick={() => {
                setSelectedImage(report.image_url);
                setOpenImageDialog(true);
              }}
            />
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {report.category}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>📅 Created:</strong>{" "}
              <span>{moment(report.created_at).format("DD/MM/YYYY hh:mm A")}</span>
            </Typography>
            <Typography variant="body2" fontWeight="bold" mt={1}>
              <strong>📌 Status:</strong>{" "}
              <Chip
                label={report.status}
                color={
                  report.status === "pending"
                    ? "warning"
                    : report.status === "in_progress"
                    ? "primary"
                    : "success"
                }
              />
            </Typography>
            <Typography variant="body2" fontWeight="bold" mt={1}>
              <strong>⚠️ Priority:</strong>{" "}
              <Chip
                label={report.priority}
                color={
                  report.priority === "high"
                    ? "error"
                    : report.priority === "medium"
                    ? "warning"
                    : "success"
                }
              />
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenDialog(true)}>
            <EditIcon color="primary" />
          </IconButton>
        </Card>
      </Grid>
    </Grid>

    {/* Status Update Dialog */}
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle>Update Status</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleStatusChange} color="primary" variant="contained">
          Update
        </Button>
      </DialogActions>
    </Dialog>

    {/* Image Preview Dialog */}
    <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Image Preview</DialogTitle>
      <DialogContent>
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Selected Report"
            style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenImageDialog(false)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);
};

ReportCard.propTypes = {
report: PropTypes.shape({
  _id: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
  status: PropTypes.oneOf(["pending", "in_progress", "resolved"]).isRequired,
  priority: PropTypes.oneOf(["low", "medium", "high"]).isRequired,
  image_url: PropTypes.string,
}).isRequired,
user: PropTypes.shape({ role: PropTypes.string.isRequired }),
onUpdateStatus: PropTypes.func.isRequired,
};

export default ReportCard;

