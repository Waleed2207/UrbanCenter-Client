import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from "@mui/material";
import DEFAULT_IMAGE from "../../assets/defult_image.gif";

const ImageUploadDialog = ({ open, onClose, onImageSelect }) => {
  const [selectedImage, setSelectedImage] = useState([DEFAULT_IMAGE]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // Create preview URL
      onImageSelect(file); // Pass image to parent component
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    onImageSelect(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Report Image</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          {/* ✅ Show Image Preview Above Upload Button */}
          {selectedImage && (
            <Box sx={{ position: "relative", display: "inline-block", textAlign: "center", mb: 2 }}>
              <img
                src={selectedImage}
                alt="Preview"
                style={{ width: "100%", maxHeight: "500px", objectFit: "cover", borderRadius: "8px" }}
              />
              <Button
                onClick={handleRemoveImage}
                sx={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(0, 0, 0, 0.6)",
                  color: "#fff",
                  borderRadius: "50%",
                  minWidth: "24px",
                  height: "24px",
                  fontSize: "16px",
                  lineHeight: "20px",
                  "&:hover": { background: "rgba(0, 0, 0, 0.8)" },
                }}
              >
                ✖
              </Button>
            </Box>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            {/* ✅ Upload Image from Device */}
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} id="upload-image" />
            <label htmlFor="upload-image">
              <Button variant="contained" component="span">Upload Image</Button>
            </label>

            {/* ✅ Capture Photo from Mobile Camera */}
            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: "none" }} id="take-photo" />
            <label htmlFor="take-photo">
              <Button variant="contained" component="span" sx={{ mt: 2 }}>Take Photo</Button>
            </label>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploadDialog;
