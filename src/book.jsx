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
  Avatar
} from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import AddCircleIcon from '@mui/icons-material/AddCircle';

function Book() {
  const [books, setBooks] = useState([]);

  const fetchBooks = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3333/books');
      const booksWithProfiles = await Promise.all(response.data.map(async (book) => {
        try {
          const profileResponse = await axios.get(`http://localhost:3333/get_img_mybook/${book.userupload}`);
          const profilePath = profileResponse.data.replace('C:\\Users\\Cite\\Downloads\\โปรเจ็คท้าย\\myapp\\react-login\\public\\', '');

          // Fetch the current reaction for each book
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
          try {
            await axios.delete(`http://localhost:3333/booksdelete/${id}`);
            await fetchBooks();
            Swal.fire({
              title: "Deleted!",
              text: "Your book has been deleted.",
              icon: "success"
            });
          } catch (error) {
            console.error('Error deleting book:', error);
            Swal.fire({
              title: "Error",
              text: "เกิดข้อผิดพลาดในการลบหนังสือ",
              icon: "error"
            });
          }
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

  const handleReaction = async (bookID, reaction) => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const userID = decodedToken.ID;

      const currentBook = books.find(book => book.bookID === bookID);
      const currentLike = currentBook.like;
      const currentDislike = currentBook.dislike;

      const newReaction = (reaction === 'like' && currentLike) || (reaction === 'dislike' && currentDislike) ? null : reaction;

      await axios.post(
        `http://localhost:3333/books/${bookID}/${userID}/reaction_test`,
        { reaction: newReaction },
        {
          headers: { Authorization: token }
        }
      );

      setBooks(prevBooks =>
        prevBooks.map(book =>
          book.bookID === bookID
            ? {
              ...book,
              like: newReaction === 'like',
              dislike: newReaction === 'dislike'
            }
            : book
        )
      );

      // Save button state to localStorage
      const savedLikes = localStorage.getItem('bookLikes');
      const likesObject = savedLikes ? JSON.parse(savedLikes) : {};
      likesObject[bookID] = { like: newReaction === 'like', dislike: newReaction === 'dislike' };
      localStorage.setItem('bookLikes', JSON.stringify(likesObject));

      console.log('Saved to localStorage:', localStorage.getItem('bookLikes')); // Debug log

    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  useEffect(() => {
    const savedLikes = localStorage.getItem('bookLikes');
    if (savedLikes) {
      const parsedLikes = JSON.parse(savedLikes);
      setBooks(prevBooks =>
        prevBooks.map(book => ({
          ...book,
          like: parsedLikes[book.bookID]?.like || false,
          dislike: parsedLikes[book.bookID]?.dislike || false
        }))
      );
      console.log('Loaded from localStorage:', parsedLikes); // Debug log
    }

    fetchBooks(); // Fetch books to load book data
  }, [fetchBooks]);




  const [isActive, setIsActive] = useState(false);

  const handleButtonClick = () => {
    setIsActive(prevState => !prevState);
  };


  const Favorite_Button = ({ book }) => {
    const [isFavorited, setIsFavorited] = useState(false);
  
    useEffect(() => {
      const checkFavoriteStatus = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found');
            return;
          }
          const decodedToken = jwtDecode(token);
          const userID = decodedToken.ID;
          const response = await axios.get(`/api/favorites/${userID}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const favorites = response.data;
          setIsFavorited(favorites.some(favorite => favorite.bookID === book.bookID));
        } catch (error) {
          console.error('Failed to fetch favorite status', error);
        }
      };
      checkFavoriteStatus();
    }, [book.bookID]);
  
    const toggleFavorite = async () => {
      const token = localStorage.getItem('token');
  
      if (!token) {
        console.error('No token found');
        return;
      }
  
      const decodedToken = jwtDecode(token);
      const userID = decodedToken.ID;
  
      try {
        if (isFavorited) {
          // Remove from favorites
          await axios.delete('http://localhost:3333/api/favorite', {
            data: { userID, book },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          // Add to favorites
          await axios.post('http://localhost:3333/api/favorite', {
            userID,
            book,
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
        }
        setIsFavorited(!isFavorited);
      } catch (error) {
        console.error('Failed to update favorite status:', error);
      }
    };
  
    return (
      <Button
        variant="contained"
        color={isFavorited ? "secondary" : "primary"}
        startIcon={<AddCircleIcon />}
        onClick={toggleFavorite}
      >
        {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
      </Button>
    );
  };




    return (
      <Container sx={{ py: 8 }} maxWidth="md">
        <Grid container spacing={4}>
          {books.map((book) => (
            <Grid item key={book.bookID} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '5px solid #FF0000' }}>
                <CardMedia
                  component="div"
                  sx={{ pt: '0%' }}
                >
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

                <CardContent sx={{ flexGrow: 1 }}>
                  <Favorite_Button  book={book.bookID}></Favorite_Button>
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
                    style={{ color: 'white', backgroundColor: '#2196F3' }}
                  >
                    Read
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleDelete(book.bookID)}
                    style={{ color: 'white', backgroundColor: 'red' }}
                  >
                    DELETE
                  </Button>
                </CardActions>
                <CardActions>
                  <Button onClick={() => handleReaction(book.bookID, 'like')} style={{ color: book.like ? 'blue' : 'inherit', backgroundColor: book.like ? '#2196F3' : 'inherit' }}>
                    <ThumbUpIcon /> Like
                  </Button>
                  <Button onClick={() => handleReaction(book.bookID, 'dislike')} style={{ color: book.dislike ? 'blue' : 'inherit', backgroundColor: book.dislike ? '#FF0000' : 'inherit' }}>
                    <ThumbDownAltIcon /> Dislike
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  export default Book;
