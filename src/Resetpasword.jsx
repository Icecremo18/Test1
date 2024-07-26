import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container, Box, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Custom theme to match the provided image
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF7F50', // Red color similar to buttons
    },
    secondary: {
      main: '#ffeb3b', // Yellow background
    },
    background: {
      default: '#fafafa', // Light background color
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h4: {
      fontWeight: 'bold',
      color: '#ffeb3b', // Yellow text color for headers
    },
    body1: {
      color: '#fff', // White text color for descriptions
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px', // Rounded buttons
        },
      },
    },
  },
});

function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await axios.post('http://localhost:3333/reset-password-request', { email });
      setMessage('OTP has been sent to your email.');
    } catch (error) {
      console.error(error);
      setError('Failed to send OTP. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ mt: 5, p: 3, backgroundColor: theme.palette.primary.main, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Request Password Reset
          </Typography>
          <Typography variant="body1">
            Enter your email address below to receive an OTP for resetting your password.
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ backgroundColor: '#fff' }} // White background for text field
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Send OTP
          </Button>
        </Box>
        {message && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default RequestPasswordReset;
