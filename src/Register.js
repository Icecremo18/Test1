import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import { TextField, InputAdornment } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import backgroundImage from "./assets/images/backgroundImage.webp";
import Swal from "sweetalert2";
import axios from "axios";

const defaultTheme = createTheme();

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    password: "",
    email: "",
    phone: "",
  });

  const [validationStatus, setValidationStatus] = useState({
    firstName: false,
    lastName: false,
    userName: false,
    password: false,
    email: false,
    phone: false,
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    validateInput(name, value);
  };

  const validateInput = (name, value) => {
    let isValid = false;
    switch (name) {
      case "firstName":
      case "lastName":
      case "userName":
        isValid = value.trim().length > 0;
        break;
      case "password":
        isValid = value.length >= 6; // You can adjust the validation criteria
        break;
      case "email":
        isValid = /\S+@\S+\.\S+/.test(value);
        break;
      case "phone":
        isValid = /^[0-9]{10}$/.test(value); // Assuming a 10-digit phone number
        break;
      default:
        break;
    }
    setValidationStatus({ ...validationStatus, [name]: isValid });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const jsonData = {
      fname: data.get("firstName"),
      lname: data.get("lastName"),
      username: data.get("userName"),
      password: data.get("password"),
      email_address: data.get("email"),
      phone: data.get("phone"),
    };

    try {
      console.log(jsonData);
      const response = await axios.post(
        "http://localhost:3333/register",
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "ok") {
        localStorage.setItem("token", response.data.token);
        Swal.fire("Success", "Register success", "success");
        window.location = "/login";
      } else {
        Swal.fire("Error", "Register failed: email ซ้ำ หรือ กรุณากรอกข้อมูลให้ครบถ้วน", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "An error occurred during registration", "error");
    }
  };

  const handlePhoneInput = (event) => {
    const input = event.target.value;
    event.target.value = input.replace(/[^0-9]/g, "");
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CssBaseline />
        <Box
          sx={{
            padding: 4,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "20px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
            Register
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  value={formData.firstName}
                  onChange={handleInputChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {formData.firstName.length > 0 && (
                          validationStatus.firstName ? (
                            <CheckIcon color="success" />
                          ) : (
                            <CloseIcon color="error" />
                          )
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {formData.lastName.length > 0 && (
                          validationStatus.lastName ? (
                            <CheckIcon color="success" />
                          ) : (
                            <CloseIcon color="error" />
                          )
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="userName"
                  label="Username"
                  name="userName"
                  autoComplete="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {formData.userName.length > 0 && (
                          validationStatus.userName ? (
                            <CheckIcon color="success" />
                          ) : (
                            <CloseIcon color="error" />
                          )
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {formData.password.length > 0 && (
                          validationStatus.password ? (
                            <CheckIcon color="success" />
                          ) : (
                            <CloseIcon color="error" />
                          )
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {formData.email.length > 0 && (
                          validationStatus.email ? (
                            <CheckIcon color="success" />
                          ) : (
                            <CloseIcon color="error" />
                          )
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="phone"
                  label="Phone"
                  name="phone"
                  autoComplete="phone"
                  value={formData.phone}
                  onChange={(event) => {
                    const input = event.target.value;
                    const formattedInput = input.replace(/[^0-9]/g, "");
                    setFormData({ ...formData, phone: formattedInput });
                    validateInput("phone", formattedInput);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {formData.phone.length > 0 && (
                          validationStatus.phone ? (
                            <CheckIcon color="success" />
                          ) : (
                            <CloseIcon color="error" />
                          )
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox value="allowExtraEmails" color="primary" />
                  }
                  label="I want to receive inspiration, marketing promotions and updates via email."
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
