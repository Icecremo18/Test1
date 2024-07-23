import React, { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Container,
  Avatar,
  TextField,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function Book() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredBooks, setFilteredBooks] = useState([]);

  const fetchBooks = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3333/books');
      const booksWithProfiles = await Promise.all(response.data.map(async (book) => {
        try {
          const profileResponse = await axios.get(`http://localhost:3333/get_img_mybook/${book.userupload}`);
          const profilePath = profileResponse.data.replace('C:\\Users\\Cite\\Downloads\\โปรเจ็คท้าย\\myapp\\react-login\\public\\', '');

          const reactionResponse = await axios.get(`http://localhost:3333/books/${book.bookID}/${book.userupload}/reaction`);
          const reaction = reactionResponse.data.reaction;

          return {
            ...book,
            profile: profilePath,
            like: reaction === 'like',
            dislike: reaction === 'dislike'
          };
        } catch (error) {
          console.error('Error fetching image path or reaction:', error);
          return { ...book, profile: '', like: false, dislike: false };
        }
      }));
      setBooks(booksWithProfiles);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    const results = books.filter(
      (book) =>
        book.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === 'All' || book.categoryname === selectedCategory)
    );
    setFilteredBooks(results);
    setCurrentPage(1); // Reset to first page on search or category change
  }, [searchTerm, selectedCategory, books]);
  

  const handleDelete = useCallback(async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        title: "Error",
        text: "กรุณาเข้าสู่ระบบก่อน",
        icon: "error"
      });
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.Role;

      if (userRole === 'admin') {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3584EB",
          confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
          await axios.delete(`http://localhost:3333/booksdelete/${id}`);
          await fetchBooks();
          Swal.fire({
            title: "Deleted!",
            text: "Your book has been deleted.",
            icon: "success"
          });
        }
      } else {
        Swal.fire({
          title: "Permission Denied",
          text: "คุณไม่ได้รับอนุญาตให้ลบหนังสือ",
          icon: "error"
        });
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      Swal.fire({
        title: "Error",
        text: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์",
        icon: "error"
      });
    }
  }, [fetchBooks]);

  const displayPdfFromId = useCallback((bookpath) => {
    const cleanBookPath = bookpath.startsWith('/') ? bookpath.slice(1) : bookpath;
    const encodedPath = encodeURIComponent(cleanBookPath);
    const url = `http://localhost:3002/${encodedPath}`;
    window.open(url, '_blank');
  }, []);

  const BookReactions = ({ book }) => {
    const [userReactions, setUserReactions] = useState({ like: false, dislike: false });
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
      const fetchLikeCount = async () => {
        try {
          const response = await axios.get(`http://localhost:3333/books/${book}/like-count`);
          setLikeCount(response.data.likeCount);
        } catch (error) {
          console.error('Error fetching like count:', error);
        }
      };
      fetchLikeCount();
    }, [book]);

    useEffect(() => {
      const fetchUserReactions = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decodedToken = jwtDecode(token);
        const userID = decodedToken.ID;

        try {
          const response = await axios.get(`http://localhost:3333/reactions/${userID}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const userReaction = response.data.find(reaction => reaction.bookID === book);
          if (userReaction) {
            setUserReactions({
              like: userReaction.reaction === 'like',
              dislike: userReaction.reaction === 'dislike'
            });
          }
        } catch (error) {
          console.error('Failed to fetch user reactions', error);
        }
      };
      fetchUserReactions();
    }, [book]);

    const handleReaction = async (reaction) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decodedToken = jwtDecode(token);
      const userID = decodedToken.ID;

      try {
        await axios.post(
          `http://localhost:3333/books/${book}/${userID}/reaction_test`,
          { reaction },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const likeResponse = await axios.get(`http://localhost:3333/books/${book}/like-count`);
        setLikeCount(likeResponse.data.likeCount);

        setUserReactions(prev => ({
          like: reaction === 'like' ? !prev.like : false,
          dislike: reaction === 'dislike' ? !prev.dislike : false
        }));
      } catch (error) {
        console.error('Error handling reaction:', error);
      }
    };

    return (
      <div>
        <Button
          onClick={() => handleReaction(userReactions.like ? null : 'like')}
          style={{ color: userReactions.like ? 'blue' : 'inherit' }}
        >
          <ThumbUpIcon /> Like [{likeCount}]
        </Button>
        <Button
          onClick={() => handleReaction(userReactions.dislike ? null : 'dislike')}
          style={{ color: userReactions.dislike ? 'red' : 'inherit' }}
        >
          <ThumbDownAltIcon /> Dislike
        </Button>
      </div>
    );
  };

  const Favorite_Button = ({ book }) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const checkFavoriteStatus = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const decodedToken = jwtDecode(token);
          const userID = decodedToken.ID;

          const response = await axios.get(`http://localhost:3333/api/favorites/${userID}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const favorites = response.data;
          setIsFavorited(favorites.some(favorite => favorite.bookID === book));
        } catch (error) {
          console.error('Failed to fetch favorite status', error);
        }
      };
      checkFavoriteStatus();
    }, [book]);

    const toggleFavorite = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decodedToken = jwtDecode(token);
      const userID = decodedToken.ID;

      setIsLoading(true);

      try {
        if (isFavorited) {
          console.log(userID,book);
          await axios.delete('http://localhost:3333/api/favorite', {
            data: { userID, book },
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          await axios.post(`http://localhost:3333/api/favorite/${book}`, { userID }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        setIsFavorited(!isFavorited);
      } catch (error) {
        console.error('Failed to update favorite status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Button
        variant="contained"
        style={{ backgroundColor: isFavorited ? 'orange' : '#2196F3', color: 'white' }}
        onClick={toggleFavorite}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : (isFavorited ? 'Remove from Favorites' : 'Add to Favorites')}
      </Button>
    );
  };

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const categories = ['All', 'นิยาย', 'การ์ตูน', 'วรรณกรรม', 'นิทาน'];

  


  return (
    <Container sx={{ py: 8 }} maxWidth="md">
      <TextField
        label="Search Books"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          label="Category"
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Grid container spacing={4}>
        {currentBooks.map((book) => (
          <Grid item key={book.bookID} xs={12} sm={6} md={4}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
              },
              transition: 'transform 0.3s, box-shadow 0.3s',
            }}>
              <CardMedia component="div" sx={{ pt: '0%' }}>
                <img
                  alt={book.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  src={book.cover_image}
                />
              </CardMedia>
              <Avatar
                src={book.profile ? `/${book.profile}` : ''}
                sx={{ width: 70, height: 70, mb: 2, mx: 'auto', marginTop: '15px' }}
              >
                H
              </Avatar>
              <Box sx={{ textAlign:"center",}} >{book.First_name}</Box>
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  {book.name}
                </Typography>
                <Typography sx={{ fontWeight: 'bold' }}>
                  Author: {book.write}
                </Typography>
                <Typography>
                  Publisher: {book.publish}
                </Typography>
                <Typography>
                  Synopsis: {book.detail}...
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => displayPdfFromId(book.PDF)}
                  sx={{ color: 'black', backgroundColor: '#2196F3' }}
                >
                  Read
                </Button>
                <Button
                  size="small"
                  onClick={() => handleDelete(book.bookID)}
                  sx={{ color: 'black', backgroundColor: 'red' }}
                >
                  DELETE
                </Button>
              </CardActions>
              <CardActions>
                <BookReactions book={book.bookID} />
                <Favorite_Button book={book.bookID} />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            renderItem={(item) => (
              <PaginationItem
                slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                {...item}
              />
            )}
          />
        </Stack>
      </Box>
    </Container>
  );
};

export default Book;
