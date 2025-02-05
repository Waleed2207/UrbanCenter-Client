import React, { useState, useEffect, forwardRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  DialogContentText,
  Slide,
  TextField,
  Box,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  MenuItem,
} from "@mui/material";
import MyLocationIcon from '@mui/icons-material/MyLocation';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const steps = ["Report Details", "Upload Image", "Location Details", "Confirm Update"];

const categoryData = {
    "Road Hazards": ["Potholes", "Fallen Trees", "Damaged Traffic Signs"],
    "Public Safety": ["Suspicious Activity", "Vandalism", "Noise Complaints"],
    "Environmental Issues": ["Illegal Dumping", "Air Pollution", "Water Pollution"],
    "Infrastructure Problems": ["Broken Streetlights", "Faulty Power Lines", "Water Pipe Leaks"],
    "Animal Control": ["Stray Animals", "Animal Abuse", "Dead Animals on Roads"],
    "Health & Sanitation": ["Overflowing Trash Bins", "Hazardous Waste Disposal", "Public Restrooms Issues"],
    "Weather-Related Issues": ["Flooding", "Storm Damage", "Snow/Ice Accumulation"]
};

const UpdateDialog = ({ open, handleClose, handleUpdate, selectedReport }) => {
  const [updatedReport, setUpdatedReport] = useState({});
  const [subcategories, setSubcategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (open && selectedReport) {
      setUpdatedReport(selectedReport);
      if (selectedReport.category) {
        setSubcategories(categoryData[selectedReport.category] || []);
      }
    }
  }, [open, selectedReport]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedReport((prevReport) => ({ ...prevReport, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setUpdatedReport((prev) => ({
      ...prev,
      category: selectedCategory,
      subcategory: categoryData[selectedCategory]?.[0] || "",
    }));
    setSubcategories(categoryData[selectedCategory] || []);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(file);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          setUpdatedReport((prev) => ({ ...prev, location_lat: lat, location_long: long }));

          try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`);
            if (response.data && response.data.display_name) {
              setUpdatedReport((prev) => ({ ...prev, location_name: response.data.display_name }));
            }
          } catch (error) {
            console.error("Error fetching location name:", error);
          }
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Failed to retrieve location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <Dialog open={open} TransitionComponent={Transition} onClose={handleClose}>
      <DialogTitle>Update Report</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0: Report Details */}
        {activeStep === 0 && (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              select
              label="Category"
              name="category"
              value={updatedReport.category || ""}
              onChange={handleCategoryChange}
              error={!!errors.category}
              helperText={errors.category}
              margin="normal"
            >
              <MenuItem value="">None</MenuItem>
              {Object.keys(categoryData).map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>

            {subcategories.length > 0 && (
              <TextField
                fullWidth
                select
                label="Subcategory"
                name="subcategory"
                value={updatedReport.subcategory || ""}
                onChange={handleChange}
                margin="normal"
              >
                {subcategories.map((sub) => (
                  <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={updatedReport.description || ""}
              onChange={handleChange}
              multiline
              rows={3}
              margin="normal"
            />
          </Box>
        )}

        {/* Step 1: Upload Image */}
        {activeStep === 1 && (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <div>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%" }} />
              {image !== null && (
                <button onClick={handleRemoveImage}>✖</button>
              )}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} id="upload-image" />
              <label htmlFor="upload-image">
                <Button variant="contained" component="span">Upload Image</Button>
              </label>
              <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: "none" }} id="take-photo" />
              <label htmlFor="take-photo">
                <Button variant="contained" component="span" sx={{ mt: 2 }}>Take Photo</Button>
              </label>
            </div>
          </Box>
        )}

        {/* Step 2: Location Details */}
        {activeStep === 2 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                fullWidth
                label="Latitude"
                name="location_lat"
                value={updatedReport.location_lat || ""}
                onChange={handleChange}
                margin="normal"
              />
              <IconButton onClick={handleGetLocation} color="primary">
                <MyLocationIcon />
              </IconButton>
            </Box>

            <TextField
              fullWidth
              label="Longitude"
              name="location_long"
              value={updatedReport.location_long || ""}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Location Name"
              name="location_name"
              value={updatedReport.location_name || ""}
              margin="normal"
              disabled
            />
          </Box>
        )}

        {/* Step 3: Confirmation */}
        {activeStep === 3 && (
            <Box sx={{ mt: 2, p: 2 }}>
            <DialogContentText>
                <strong>Category:</strong> {updatedReport.category || "N/A"} <br />
                <strong>Subcategory:</strong> {updatedReport.subcategory || "N/A"} <br />
                <strong>Description:</strong> {updatedReport.description || "N/A"} <br />
                <strong>Latitude:</strong> {updatedReport.location_lat || "N/A"} <br />
                <strong>Longitude:</strong> {updatedReport.location_long || "N/A"} <br />
                <strong>Location Name:</strong> {updatedReport.location_name || "N/A"} <br />
            </DialogContentText>
            </Box>
        )}
      </DialogContent>
      <DialogActions>
        {activeStep > 0 && <Button onClick={() => setActiveStep(activeStep - 1)}>Back</Button>}
        {activeStep < steps.length - 1 ? (
          <Button onClick={() => setActiveStep(activeStep + 1)} variant="contained">Next</Button>
        ) : (
          <Button onClick={() => handleUpdate(updatedReport)} variant="contained" color="primary">Update</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

UpdateDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleUpdate: PropTypes.func.isRequired,
    selectedReport: PropTypes.object,
  };
export default UpdateDialog;
