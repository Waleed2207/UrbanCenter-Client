import React, { useState } from "react";
import axios from "axios";
import styles from "./SignInForm.module.scss";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Grid,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Email, Visibility, VisibilityOff, Person, Work, Phone } from "@mui/icons-material";
import { SERVER_URL } from "../../consts";
import logo from "../../assets/urban-city-logo.png";

const SignInForm = ({ onSignIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("citizen");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${SERVER_URL}/api/users/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        console.log("✅ Login Successful, Token Received:", response.data.token);
        
        // ✅ Store token in localStorage
        localStorage.setItem("token", response.data.token); 
        localStorage.setItem("user", JSON.stringify(response.data.user)); 

        // ✅ Set the token in axios headers for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

        onSignIn(response.data.token, response.data.user); // ✅ Pass token to global state
      }
    } catch (error) {
      console.error("🚨 Sign in failed:", error.response?.data || error);
      setErrorMessage("Invalid email or password");
    }
};


  const handleSignUp = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      return;
    }
  
    try {
      const response = await axios.post(`${SERVER_URL}/api/users/register`, {
        username,
        email,
        password,
        role,
        phone_number: role === "citizen" ? phoneNumber : undefined,
      });
  
      if (response.status === 200) {
        setSuccessMessage("User registered successfully. Please log in.");
        setErrorMessage("");
  
        // Wait for 2 seconds before switching back to the login form
        setTimeout(() => {
          setIsSignUp(false);
          setSuccessMessage(""); // Clear the success message
        }, 2000);
      }
    } catch (error) {
      console.error("Sign up failed:", error);
      setErrorMessage(error.response?.data?.error || "Failed to register user");
      setSuccessMessage("");
    }
  };
  
  return (
    <Box className={styles.gradientBackground}>
      <Container maxWidth="lg" disableGutters className={styles.container}>
        <Grid container>
          {/* Left Section */}
          <Grid item xs={12} md={6} className={styles.leftSection}>
            <Box textAlign="center" mb={4}>
              <img src={logo} alt="Urban City Logo" className={styles.logo} />
              <Typography variant="h5" fontWeight="bold" color="textDisabled" mt={2}>
                Welcome to Urban City
              </Typography>
            </Box>
            {isSignUp ? (
              <>
                <Typography textAlign="center" mb={2}>
                  Create a new Urban City account
                </Typography>

                {errorMessage && (
                  <Typography textAlign="center" className={styles.errorMessage} color="error">
                    {errorMessage}
                  </Typography>
                )}

                {successMessage && (
                  <Typography textAlign="center" className={styles.successMessage} color="success">
                    {successMessage}
                  </Typography>
                )}

                <form onSubmit={handleSignUp}>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    variant="outlined"
                    margin="normal"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required={role === "citizen"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ cursor: "pointer" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </span>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    margin="normal"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ cursor: "pointer" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </span>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Role"
                    variant="outlined"
                    margin="normal"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Work />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box textAlign="center" my={3}>
                    <Button
                      type="submit"
                      variant="contained"
                      className={styles.gradientButton}
                    >
                      SIGN UP
                    </Button>
                  </Box>
                </form>
                <Box textAlign="center" mt={4}>
                  <Button
                    variant="text"
                    onClick={() => setIsSignUp(false)}
                    sx={{
                      marginTop: '16px',
                      textTransform: 'none', // Corrected from 'text-transform'
                      fontWeight: 'bold', // Corrected from 'font-weight'
                      textDecoration: 'none', // Corrected from 'text-decoration'
                      color: '#4caf50', // Green color
                      border: '1px solid #4caf50', // Green border
                      padding: '0.5rem 1rem', // Corrected from the syntax error
                      display: 'inline-block',
                      textAlign: 'center', // Corrected from 'text-align'
                      borderRadius: '4px', // Rounded corners for consistency with MUI
                      transition: 'background-color 0.3s ease, color 0.3s ease', // Corrected transition syntax
                    }}
                  >                  
                    Back to Login
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography textAlign="center" mb={2}>
                  Please login to your Urban City account
                </Typography>

                {errorMessage && (
                  <Typography className={styles.errorMessage}>
                    {errorMessage}
                  </Typography>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Show Password"
                  />

                  <Box textAlign="center" my={3}>
                    <Button
                      type="submit"
                      variant="contained"
                      className={styles.gradientButton}
                    >
                      LOG IN
                    </Button>
                  </Box>
                </form>

                <Box textAlign="center" mt={4}>
                  <Typography variant="body2">Don't have an account?</Typography>
                  <Button
                    variant="text"
                    onClick={() => setIsSignUp(true)}
                    sx={{
                      marginTop: '16px',
                      textTransform: 'none', // Corrected from 'text-transform'
                      fontWeight: 'bold', // Corrected from 'font-weight'
                      textDecoration: 'none', // Corrected from 'text-decoration'
                      color: '#4caf50', // Green color
                      border: '1px solid #4caf50', // Green border
                      padding: '0.5rem 1rem', // Corrected from the syntax error
                      display: 'inline-block',
                      textAlign: 'center', // Corrected from 'text-align'
                      borderRadius: '4px', // Rounded corners for consistency with MUI
                      transition: 'background-color 0.3s ease, color 0.3s ease', // Corrected transition syntax
                    }}
                  >
                    CREATE NEW
                  </Button>

                </Box>
              </>
            )}
          </Grid>

          {/* Right Section */}
          <Grid
            item
            xs={12}
            md={6}
            className={styles.rightSection}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              mb={2}
              textAlign="center"
            >
              Discover the Future of Urban Living
            </Typography>
            <Typography textAlign="center" maxWidth="400px">
              Join Urban City to explore smart solutions for modern city life.
              Enhance your experience with seamless technology and innovation.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SignInForm;
