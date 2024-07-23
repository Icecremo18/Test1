import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container } from '@mui/material';

function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3333/reset-password-request', { email });
      setMessage('OTP has been sent to your email.');
      

    } catch (error) {
        console.error(error);
      setMessage('Failed to send OTP. Please try again.');
    }
  };

  return (
    <Container>
      <Typography variant="h5">Request Password Reset</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Send OTP
        </Button>
      </form>
      {message && <Typography>{message}</Typography>}
    </Container>
  );
}

export default RequestPasswordReset;
