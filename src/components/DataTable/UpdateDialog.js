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
  Typography
} from "@mui/material";
import MyLocationIcon from '@mui/icons-material/MyLocation';
import DEFAULT_IMAGE from "../../assets/defult_image.gif";
import classes from "./UpdateDialog.module.scss"; // Import styles

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const steps = ["Report Details","Upload Image","Location Details", "Confirm Update"];

const priorityLevels = ["Low", "Medium", "High"];

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
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE);

  useEffect(() => {
    if (selectedReport && open) {
  
      // Capitalize priority value from backend ("low" → "Low")
      const capitalizePriority = (priority) => 
        priority ? priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase() : "";
  
      setUpdatedReport((prev) => ({
        ...prev,
        ...selectedReport,
        priority: capitalizePriority(selectedReport.priority),
      }));
  
      if (selectedReport.image_url) {
        setImagePreview(selectedReport.image_url);
      }
  
      if (selectedReport.category) {
        setSubcategories(categoryData[selectedReport.category] || []);
      }
    }
  }, [selectedReport, open]);
  
  


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
  
        // Save the new image in updatedReport
        setUpdatedReport((prev) => ({ ...prev,
            image_url: file,
            image_file: reader.result
          }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(DEFAULT_IMAGE);
  
    // Clear image reference from updatedReport
    setUpdatedReport((prev) => ({ ...prev, image_url: "" }));
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

  const validateFields = () => {
    let tempErrors = {};
    if (activeStep === 0) {
      if (!updatedReport.category) tempErrors.category = "Category is required";
      if (!updatedReport.subcategory) tempErrors.subcategory = "Subcategory is required";
      if (!updatedReport.description) tempErrors.description = "Description is required";
    }
    if (activeStep === 1) {
      if (!updatedReport.location_lat) tempErrors.location_lat = "Latitude is required";
      if (!updatedReport.location_long) tempErrors.location_long = "Longitude is required";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (validateFields()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    if (validateFields()) {
      const updatedData = { 
        ...updatedReport, 
        priority: updatedReport.priority?.toLowerCase() // Convert to lowercase
      };
  
      handleUpdate(updatedData);
      handleClose();
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
              error={!!errors.description}
              helperText={errors.description}
              margin="normal"
            />
            <TextField
            fullWidth
            select
            label="Priority"
            name="priority"
            value={updatedReport.priority || ""}
            onChange={handleChange}
            margin="normal"
            error={!!errors.priority}
            helperText={errors.priority}
            required
            >
            {priorityLevels.map((level) => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
            ))}
            </TextField>

          </Box>
        )}
        {activeStep === 1 && (
          <Box sx={{ mt: 3, textAlign: "center" }}>
          {/* ✅ Show Image Preview Above Upload Button */}
          <div className={classes.imagePreviewContainer}>
            <img src={imagePreview} alt="Preview" className={classes.imagePreview} />
            {image !== null && (
              <button className={classes.closeButton} onClick={handleRemoveImage}>✖</button> // ❌ Close Button
            )}
          </div>

          <div className={classes.imageUploadContainer}>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} id="upload-image" />
            <label htmlFor="upload-image">
              <Button variant="contained" component="span">Upload Image</Button>
            </label>

            {/* ✅ Camera Input for Mobile Devices */}
            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: "none" }} id="take-photo" />
            <label htmlFor="take-photo">
              <Button variant="contained" component="span" sx={{ mt: 2 }}>Take Photo</Button>
            </label>
          </div>
          {errors.image && <Typography color="error">{errors.image}</Typography>}
        </Box>
        )}
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
                error={!!errors.location_lat}
                helperText={errors.location_lat}
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
              error={!!errors.location_long}
              helperText={errors.location_long}
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
        {activeStep === 3 && (
        <Box sx={{ mt: 2 }}>
            <DialogContentText>
            <strong>Category:</strong>{" "}
            <span style={{ color: updatedReport.category !== selectedReport.category ? "red" : "black" }}>
                {updatedReport.category || "N/A"}
            </span>
            <br />

            <strong>Subcategory:</strong>{" "}
            <span style={{ color: updatedReport.subcategory !== selectedReport.subcategory ? "red" : "black" }}>
                {updatedReport.subcategory || "N/A"}
            </span>
            <br />

            <strong>Description:</strong>{" "}
            <span style={{ color: updatedReport.description !== selectedReport.description ? "red" : "black" }}>
                {updatedReport.description || "N/A"}
            </span>
            <br />

            <strong>Priority:</strong>{" "}
            <span style={{ color: updatedReport.priority !== selectedReport.priority ? "red" : "black" }}>
                {updatedReport.priority || "N/A"}
            </span>
            <br />

            <strong>Latitude:</strong>{" "}
            <span style={{ color: updatedReport.location_lat !== selectedReport.location_lat ? "red" : "black" }}>
                {updatedReport.location_lat || "N/A"}
            </span>
            <br />

            <strong>Longitude:</strong>{" "}
            <span style={{ color: updatedReport.location_long !== selectedReport.location_long ? "red" : "black" }}>
                {updatedReport.location_long || "N/A"}
            </span>
            <br />

            <strong>Location Name:</strong>{" "}
            <span style={{ color: updatedReport.location_name !== selectedReport.location_name ? "red" : "black" }}>
                {updatedReport.location_name || "N/A"}
            </span>
            <br />

            <strong>Image:</strong>
            <br />
            <img
                src={imagePreview || updatedReport.image_file || DEFAULT_IMAGE}
                alt="Report"
                style={{
                maxWidth: "200px",
                maxHeight: "150px",
                border: updatedReport.image_file !== selectedReport.image_file ? "3px solid red" : "3px solid black",
                borderRadius: "5px",
                marginTop: "10px",
                objectFit: "contain",
                display: "block",
                }}
            />
            </DialogContentText>
        </Box>
        )}
      </DialogContent>
      <DialogActions>
        {activeStep > 0 && <Button onClick={handleBack} color="primary">Back</Button>}
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} color="secondary" variant="contained">Next</Button>
        ) : (
          <Button onClick={handleSubmit} color="secondary" variant="contained">Update</Button>
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
