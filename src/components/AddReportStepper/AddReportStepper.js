import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Box, Stepper, Step, StepLabel, Button, TextField, Typography, CircularProgress, MenuItem, IconButton } from "@mui/material";
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AuthContext from "../../contexts/AuthContext";
import { SERVER_URL } from "../../consts";
import axios from "axios";
import classes from "./AddReportStepper.module.scss"; // Import styles
import DEFAULT_IMAGE from "../../assets/defult_image.gif";

const steps = ["Report Details", "Upload Image", "Citizen Details"];
const priorityLevels = ["low", "medium", "high"];

const categoryData = {
  "Road Hazards": ["Potholes", "Fallen Trees", "Damaged Traffic Signs"],
  "Public Safety": ["Suspicious Activity", "Vandalism", "Noise Complaints"],
  "Environmental Issues": ["Illegal Dumping", "Air Pollution", "Water Pollution"],
  "Infrastructure Problems": ["Broken Streetlights", "Faulty Power Lines", "Water Pipe Leaks"],
  "Animal Control": ["Stray Animals", "Animal Abuse", "Dead Animals on Roads"],
  "Health & Sanitation": ["Overflowing Trash Bins", "Hazardous Waste Disposal", "Public Restrooms Issues"],
  "Weather-Related Issues": ["Flooding", "Storm Damage", "Snow/Ice Accumulation"]
};

const AddReportStepper = ({ onReportSubmit }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); 
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE); // Default GIF
  const [fieldErrors, setFieldErrors] = useState({});
  const [subcategories, setSubcategories] = useState([]);
  const [reportData, setReportData] = useState({
    category: "",
    subcategory: "",
    description: "",
    location_lat: "",
    location_long: "",
    location_name: "", // New field for readable location
    priority: "medium",
    user_id: user ? user._id : "",
    email: user ? user.email : "",
    phone_number: user?.phone_number || "",

  });
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReportData((prevReport) => ({ ...prevReport, [name]: value }));
  };


  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setReportData((prev) => ({
      ...prev,
      category: selectedCategory,
      subcategory: categoryData[selectedCategory]?.[0] || "", // Set first subcategory as default
    }));
    setSubcategories(categoryData[selectedCategory] || []);
  };
  

  // 📍 Retrieve user location
  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          setReportData((prev) => ({ ...prev, location_lat: lat, location_long: long }));

          try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`);
            if (response.data && response.data.display_name) {
              setReportData((prev) => ({ ...prev, location_name: response.data.display_name }));
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

  // Handle image selection
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

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const validateStep = () => {
    let errors = {};

    if (activeStep === 0) {
      if (!reportData.category) errors.category = "Category is required";
      if (!reportData.category) errors.category = "Category is required";
      if (!reportData.description) errors.description = "Description is required";
      if (!reportData.location_lat) errors.location_lat = "Latitude is required";
      if (!reportData.location_long) errors.location_long = "Longitude is required";
        
    } else if (activeStep === 1) {
      if (!image) errors.image = "Image upload or Take Photo is required";
    } else if (activeStep === 2) {
      if (!reportData.priority) errors.priority = "Priority is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(DEFAULT_IMAGE);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(reportData).forEach(([key, value]) => formData.append(key, value));
      if (image) formData.append("image", image);

      const response = await axios.post(`${SERVER_URL}/api/reports/report`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Report Created:", response.data);
      onReportSubmit(response.data);
      navigate("/reports", { state: { message: "Report added successfully!" } });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={classes.container}>
      <Box sx={{ width: "100%" }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box sx={{ mt: 3 }} className={classes.formContainer}>
            {/* Category Dropdown */}
            <TextField
              fullWidth
              select
              label="Category (Optional)"
              name="category"
              value={reportData.category}
              onChange={handleCategoryChange}
              margin="normal"
              helperText={fieldErrors.category}
              error={!!fieldErrors.category}
            >
              <MenuItem value="">None</MenuItem>
              {Object.keys(categoryData).map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>

            {/* Subcategory Dropdown (Auto-select first option) */}
            {subcategories.length > 0 && (
              <TextField
                fullWidth
                select
                label="Subcategory"
                name="subcategory"
                value={reportData.subcategory}
                onChange={handleChange}
                margin="normal"
              >
                {subcategories.map((sub) => (
                  <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                ))}
              </TextField>
            )}
            {/* Description Field */}
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={reportData.description}
              onChange={handleChange}
              margin="normal"
              error={!!fieldErrors.description}
              helperText={fieldErrors.description}
              required
              multiline
              rows={3}
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField fullWidth label="Latitude" name="location_lat" value={reportData.location_lat} onChange={handleChange} margin="normal" 
              error={!!fieldErrors.location_lat} helperText={fieldErrors.location_lat} required />
              <IconButton onClick={handleGetLocation} color="primary">
                <MyLocationIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField fullWidth label="Longitude" name="location_long" value={reportData.location_long} onChange={handleChange} margin="normal"
              error={!!fieldErrors.location_long} helperText={fieldErrors.location_long}  required />
            </Box>

            <TextField fullWidth label="Location Name" name="location_name" value={reportData.location_name} onChange={handleChange} margin="normal" disabled />
          </Box>
        )}

        {/* Step 2: Upload Image */}
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
            {fieldErrors.image && <Typography color="error">{fieldErrors.image}</Typography>}
          </Box>
        )}
        {/* Step 3: Citizen Details */}
        {activeStep === 2 && (
          <Box sx={{ mt: 3 }}>
            <TextField 
              fullWidth 
              label="Email" 
              name="email" 
              value={reportData.email || ''}  
              disabled
              margin="normal" 
            />
            <TextField 
              fullWidth 
              label="Phone Number" 
              name="phone_number" 
              value={reportData.phone_number} 
              onChange={handleChange} 
              margin="normal" 
              required 
            />
            <TextField 
              fullWidth 
              select 
              label="Priority" 
              name="priority" 
              value={reportData.priority || 'medium'} 
              onChange={handleChange} 
              margin="normal"
              error={!!fieldErrors.priority} 
              helperText={fieldErrors.priority} 
              required
            >
              {priorityLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )}


        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

        {/* Stepper Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          {activeStep > 0 && <Button onClick={() => setActiveStep(activeStep - 1)}>Back</Button>}
          {activeStep < steps.length - 1 ? (
            <Button onClick={handleNext} variant="contained">Next</Button>
          ) : (
            <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

AddReportStepper.propTypes = {
  onReportSubmit: PropTypes.func.isRequired,
};

export default AddReportStepper;
