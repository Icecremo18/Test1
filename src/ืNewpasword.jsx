import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container } from '@mui/material';
import { useLocation } from 'react-router-dom';

function SetNewPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const token = queryParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3333/set-new-password', { token, password });
      
      setMessage('Password has been reset successfully.');
    } catch (error) {
      setMessage('Failed to reset password. Please try again.');
      console.log(error);
    }
  };

  return (
    <Container>
      <Typography variant="h5">Set New Password</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="New Password"
          variant="outlined"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Reset Password
        </Button>
      </form>
      {message && <Typography>{message}</Typography>}
    </Container>
  );
}

export default SetNewPassword;
