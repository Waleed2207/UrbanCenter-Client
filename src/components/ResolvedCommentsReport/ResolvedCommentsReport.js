import React, { useEffect, useState, useContext, useCallback } from "react";
import {
    Typography,
    Card,
    Grid,
    Box,
    Alert,
    CircularProgress,
    IconButton,
    Chip,
    Collapse,
    CardMedia,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from "@mui/material";
import moment from "moment-timezone";
import axios from "axios";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import UserContext from "../../contexts/UserContext";
import { SERVER_URL } from "../../consts";

const ResolvedCommentsReport = () => {
  const { user } = useContext(UserContext);
  const userId = user._id;
  const category = user.related_category;
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [openCollapse, setOpenCollapse] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${SERVER_URL}/api/comments/report/category_comment/${userId}/${category}`
      );
      setComments(response.data.comments || []);
    } catch (err) {
      setError("🚨 Failed to fetch resolved comments or no resolved comments are available. Please try again.");
    } finally {
      setLoading(false);
    }
    }, [userId, category]);

  const handleDeleteComment = async () => {
    try {
      const response = await axios.delete(`${SERVER_URL}/api/comments/report/category_comment/${commentToDelete}`);
      if (response.status === 200) {
        // Immediately remove the comment from state
        setComments((prevComments) => prevComments.filter(comment => comment.report_id !== commentToDelete));

        setAlertMessage("✅ Comment report deleted successfully.");
        setOpenCollapse(true);
      }
      setOpenDeleteDialog(false);
    } catch (err) {
      setError("🚨 Failed to delete comment. Please try again.");
    }
  };

  const handleCloseCollapse = () => {
    setOpenCollapse(false);
  };

  const confirmDelete = (reportId) => {
    setCommentToDelete(reportId);
    setOpenDeleteDialog(true);
  };


  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 3, width: "100%" }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Collapse in={openCollapse} sx={{ width: "100%" }}>
        <Alert severity="success" onClose={handleCloseCollapse}>{alertMessage}</Alert>
      </Collapse>
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Resolved Comments Report
        </Typography>
        <IconButton onClick={fetchComments} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          {comments.length > 0 ? (
            comments
            .filter((comment) => comment.status === "resolved")
            .map((comment) => (
              <Grid item xs={12} sm={10} md={8} key={comment._id} display="flex" justifyContent="center">
                <Card
                  sx={{
                    boxShadow: 3,
                    borderRadius: 3,
                    overflow: "hidden",
                    padding: { xs: 2, sm: 3, md: 4 },
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    width: "100%",
                    minWidth: "280px", 
                    justifyContent: "center",
                  }}
                >
                  {comment.image_url && (
                    <CardMedia
                      component="img"
                      sx={{ width: 150, height: 150, borderRadius: 2, objectFit: "cover", cursor: "pointer" }}
                      image={comment.image_url}
                      alt="Report"
                      onClick={() => {
                        setSelectedImage(comment.image_url);
                        setOpenImageDialog(true);
                      }}
                    />
                  )}  
                  <Box sx={{ flexGrow: 1, width: '100%', maxWidth: '600px'}}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {comment.category}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1}}>
                      <Box sx={{ display: "flex", alignItems: 'center', justifyContent: "space-between", mt: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          <strong>📅 Created:</strong> {moment(comment.created_at).format("DD/MM/YYYY hh:mm A")}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>👤 Reported by:</strong> {comment.citizen_name || "Unknown"}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        <strong>📝 Comment:</strong> {comment.comment_text || "No comment provided"}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: 'center', justifyContent: "space-between", mt: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          <strong>📞 Phone Number:</strong> {comment.phone_number || "No number provided"}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          <strong>📌 Status:</strong>{" "}
                          <Chip
                            label={comment.status}
                            sx={{ width: "110px"}}
                            color={
                              comment.status === "pending"
                                ? "warning"
                                : comment.status === "in_progress"
                                ? "primary"
                                : "success"
                            }
                          />
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start", flexGrow: 1 }}>
                        <IconButton onClick={() => confirmDelete(comment.report_id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                        </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>No resolved comments found.</Typography>
          )}
        </Grid>
      )}
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false) } maxWidth="sm">
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center" }}>
            <img src={selectedImage} alt="Report" style={{ width: "100%", maxHeight: "500px", objectFit: "cover", borderRadius: "8px" }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
            <Typography>Are you sure you want to delete this comment?</Typography>
            </DialogContent>
            <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)} color="primary">Cancel</Button>
            <Button onClick={handleDeleteComment} color="error">Delete</Button>
            </DialogActions>
    </Dialog>
    </Box>
  );
};


export default ResolvedCommentsReport;
