import React, { useEffect, useState } from 'react';
import { TextField, Box, Button, Select, MenuItem, Card, CardContent, CardMedia, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {jwtDecode} from 'jwt-decode';
import { styled } from '@mui/system';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';

const VisuallyHiddenInput = styled('input')({
  display: 'none',
});

function BookForm() {
  const [name, setName] = useState('');
  const [write, setWrite] = useState('');
  const [detail, setDetail] = useState('');
  const [publish, setPublish] = useState('');
  const [typing, setTyping] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [pdfFileName, setPdfFileName] = useState('Upload PDF');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      const ID = decodedToken.ID;
      setUserId(ID);
    }
  }, []);

  const addBook = async (e) => {
    e.preventDefault();

    if (!name || !write || !detail || !publish || !typing || !coverImage || !pdfFile) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('write', write);
      formData.append('detail', detail);
      formData.append('publish', publish);
      formData.append('typing', typing);
      formData.append('coverImage', coverImage);
      formData.append('pdfFile', pdfFile);
      formData.append('userid', userId);

      await axios.post('http://localhost:3333/addbook', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire({
        title: "Add book successful",
        icon: "success"
      });

      navigate('/album');
    } catch (error) {
      console.error('Error adding book:', error);
      setError('Error adding book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          // Create an off-screen canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set the desired size
          const desiredWidth = 190;
          const desiredHeight = 269;

          canvas.width = desiredWidth;
          canvas.height = desiredHeight;

          // Draw the image onto the canvas
          ctx.drawImage(img, 0, 0, desiredWidth, desiredHeight);

          // Convert the canvas to a file
          canvas.toBlob((blob) => {
            setCoverImage(blob);
          }, file.type);
        };
      };

      reader.readAsDataURL(file);
    }
  };
  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
    if (file && file.name) {
      setPdfFileName(file.name);
    } else {
      setPdfFileName('Upload PDF');
    }
  };

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
    setTyping(selectedValue.toString());
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f5f5dc',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          width: '100%',
          backgroundColor: '#FFA500',
          padding: '2rem',
          border: '1px solid #ccc',
          borderRadius: 8,
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{
            marginBottom: 3,
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Add a New Book
        </Typography>
        <form onSubmit={addBook}>
          <TextField
            id="name"
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            id="write"
            label="Author"
            variant="outlined"
            fullWidth
            value={write}
            onChange={(e) => setWrite(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            id="detail"
            label="Detail"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            id="publish"
            label="Publish Date"
            variant="outlined"
            fullWidth
            value={publish}
            onChange={(e) => setPublish(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>Select Category</Typography>
          <Select
            label="Select Option"
            variant="outlined"
            fullWidth
            value={selectedOption}
            onChange={handleSelectChange}
            sx={{ marginBottom: 3 }}
          >
            <MenuItem value="นิยาย">นิยาย</MenuItem>
            <MenuItem value="การ์ตูน">การ์ตูน</MenuItem>
            <MenuItem value="วรรณกรรม">วรรณกรรม</MenuItem>
            <MenuItem value="นิทาน">นิทาน</MenuItem>
          </Select>
          {coverImage && (
            <Card sx={{ maxWidth: 345, marginBottom: 2 }}>
              <CardMedia
                component="img"
                height="140"
                image={URL.createObjectURL(coverImage)}
                alt="Cover Image"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Cover Image Preview
                </Typography>
              </CardContent>
            </Card>
          )}
          <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>Cover Image  (190x269) </Typography>
          <label htmlFor="cover-image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<ImageIcon />}
              sx={{ marginBottom: 2 }}
            >
              Upload Cover Image
            </Button>
          </label>
          <VisuallyHiddenInput
            id="cover-image-upload"
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
          />
          <br />
          <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>Book PDF</Typography>
          <label htmlFor="pdf-file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<PictureAsPdfIcon />}
              sx={{ marginBottom: 2 }}
            >
              {pdfFileName}
            </Button>
          </label>
          <VisuallyHiddenInput
            id="pdf-file-upload"
            type="file"
            accept=".pdf"
            onChange={handlePdfFileChange}
          />
          <br /><br />
          {error && <Typography color="error" sx={{ marginBottom: 2 }}>{error}</Typography>}
          <Box display="flex" justifyContent="space-between">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ padding: 1, fontSize: '1rem', flexGrow: 1, marginRight: 1 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Book'}
            </Button>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              onClick={() => navigate('/album')}
              sx={{ padding: 1, fontSize: '1rem', flexGrow: 1 }}
            >
              Main
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}

export default BookForm;
