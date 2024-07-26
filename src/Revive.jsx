import React, { useEffect, useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Avatar, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2'; // นำเข้า SweetAlert2

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 850,
  maxHeight: '80vh', // เพิ่ม maxHeight เพื่อให้ Box component ไม่สูงเกินหน้า
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  overflow: 'auto', // เพิ่ม overflow เพื่อให้ Box component สามารถเลื่อนขึ้นลงได้
};

export default function ReviewPopup({ open, handleClose, book }) {
  const [review, setReview] = useState('');
  const [userId, setUserId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:3333/reviews?bookId=${book}`);
      setReviews(response.data);
      console.log('Fetched reviews:', response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:3333/my_reviews/${userId}/${book}`);
      setMyReviews(response.data);
      console.log('My reviews fetched:', response.data);
    } catch (error) {
      console.error('Error fetching my reviews:', error);
    }
  };

  useEffect(() => {
    const fetchUserId = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decodedToken = jwtDecode(token);
      const userID = decodedToken.ID;
      setUserId(userID);
      console.log('User ID:', userID);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetchReviews();
    fetchMyReviews();
  }, [book, userId]);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:3333/reviews', {
        bookId: book,
        review,
        userId,
      });
      if (response.status === 200) {
        alert('Review submitted successfully');
        const newReview = { book_ID: book, user_ID: userId, review,  };
        setReviews([...reviews, newReview]); // Update local state
        console.log('New review added:', newReview);
        setReview(''); // Clear the review input
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred');
    }
    handleClose();
  };

  const handleDeleteReview = async (reviewId) => {
    // ใช้ SweetAlert2 เพื่อยืนยันการลบ
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });
  
    if (result.isConfirmed) {
      console.log('Attempting to delete review with ID:', reviewId); // Debugging line
      try {
        const response = await axios.delete(`http://localhost:3333/reviews/${reviewId}`);
        console.log('API response:', response); // Debugging line
        if (response.status === 200) {
          // รีเฟรชข้อมูลรีวิวหลังจากลบ
          await fetchReviews();
          await fetchMyReviews();
          Swal.fire(
            'Deleted!',
            'Your review has been deleted.',
            'success'
          );
          handleClose(); // ปิด popup หลังจากลบสำเร็จ
        } else {
          Swal.fire(
            'Failed!',
            'Failed to delete the review.',
            'error'
          );
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        Swal.fire(
          'Error!',
          'An error occurred while deleting the review.',
          'error'
        );
      }
    }
  };
  const getProfileImagePath = (profilePath) => {
    return `/${profilePath.replace(
      "C:\\Users\\Cite\\Downloads\\โปรเจ็คท้าย\\myapp\\react-login\\public\\",
      ""
    )}`;
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          Write a Review
        </Typography>
        <TextField
          id="review"
          label="Review"
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          value={review}
          onChange={(e) => setReview(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ mt: 2 }}
          fullWidth
        >
          Submit Review
        </Button>

        <Typography id="reviews-title" variant="h6" component="h2" sx={{ mt: 4 }}>
          My Reviews
        </Typography>

        <List style={{ maxHeight: 200, overflow: 'auto' }}>
          {myReviews.map((rev) => (
            <ListItem key={rev.id} alignItems="flex-start" style={{ position: 'relative' }}>
              <Avatar
                src={rev.profile ? getProfileImagePath(rev.profile) : ""}
                sx={{
                  width: 50,
                  height: 50,
                  mb: 2,
                  mx: "flex",
                  marginTop: "15px",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.2)",
                  },
                }}
              >
                H
              </Avatar>
              <ListItemText
                primary={`${rev.First_name}:`}
                secondary={rev.review}
              />
              <Tooltip title="Delete">
                <IconButton
                  onClick={() => handleDeleteReview(rev.Review_ID)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'error.main',
                    zIndex: 1,
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>

        <Typography id="reviews-title" variant="h6" component="h2" sx={{ mt: 4 }}>
          Reviews
        </Typography>

        <List style={{ maxHeight: 200, overflow: 'auto' }}>
          {reviews.map((rev) => (
            <ListItem key={rev.id} alignItems="flex-start" style={{ position: 'relative' }}>
              <Avatar
                src={rev.profile ? getProfileImagePath(rev.profile) : ""}
                sx={{
                  width: 50,
                  height: 50,
                  mb: 2,
                  mx: "flex",
                  marginTop: "15px",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.2)",
                  },
                }}
              >
                H
              </Avatar>
              <ListItemText
                primary={`${rev.First_name}:`}
                secondary={rev.review}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Modal>
  );
}
