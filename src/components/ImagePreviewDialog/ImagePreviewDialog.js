import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from "@mui/material";

const ImagePreviewDialog = ({ open, onClose, imageSrc }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Report Image</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: "center" }}>
          <img
            src={imageSrc}
            alt="Report"
            style={{ width: "100%", maxHeight: "500px", objectFit: "cover", borderRadius: "8px" }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImagePreviewDialog;
