import React, { useEffect, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Link,
  Stack,
  Toolbar,
  Typography,
  createTheme,
  ThemeProvider,
  Grid,
} from "@mui/material";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import logo from "./logo1.jpg";
import backgroundImage from "./assets/images/photo-1521587760476-6c12a4b040da.avif";
import Book from "./book";
import EditMember from "./EditMember";
import EditProfilePopup from "./EditProfilePopup";
import MyBookPopup from "./MyBookPopup";
import Favorite from "./Favorite";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { useNavigate } from 'react-router-dom';

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function Album() {
  const [openProfile, setOpenProfile] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState(null);
  const [isEditMemberOpen, setEditMemberOpen] = useState(false);
  const [openMyBook, setOpenMyBook] = useState(false);
  const [pathProfile, setPathProfile] = useState("");

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3333/authen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "ok") {
            const decodedToken = jwtDecode(token);
            setName(decodedToken.First_name);
            setRole(decodedToken.Role);
            setUserId(decodedToken.ID);
          } else {
            alert("โปรดเข้าสู้ระบบอีกครั้ง");
            localStorage.removeItem("token");
            window.location = "/login";
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, []);

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:3333/get_img/${userId}`)
        .then((response) => {
          setPathProfile(response.data);
        })
        .catch((error) => {
          console.error("Error fetching image path:", error);
        });
    }
  }, [userId]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:3333/usersprofile/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError(error.response?.data?.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
  
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);


  const fetchUserProfile = async () => {
    console.log(userId);
    if (!userId) return; // Ensure userId is defined
    try {
      const response = await axios.get(`http://localhost:3333/usersprofile/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    window.location = "/";
  };

  const handleOpen = () => {
    window.location = "/addbook";
  };

  const handleOpenPopup = () => {
    if (role === "admin") {
      setEditMemberOpen(true);
    } else {
      alert("คุณไม่ได้รับอนุญาต");
    }
  };

  const handleClosePopup = () => {
    setEditMemberOpen(false);
  };

  const handleAvatarClick = () => {
    setOpenProfile(true);
  };

  const handleProfileClose = () => {
    setOpenProfile(false);
    
    fetchUserProfile();
    
  };

  const handleOpenMyBook = () => {
    setOpenMyBook(true);
  };

  const handleCloseMyBook = () => {
    setOpenMyBook(false);
  };

  const navigate = useNavigate();
  const handleLinkClick = () => {
    navigate('/reset-password-request'); // Navigate to the login page
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box sx={{ bgcolor: "#FF7F50", pt: 8, pb: 6 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              backgroundColor: "#FF7043",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              textAlign: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <img
                src={logo}
                alt="Logo"
                style={{
                  height: "100px",
                  marginBottom: { xs: "20px", md: "0" },
                }}
              />
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  color: "white",
                  marginLeft: { md: "20px" },
                  fontSize: { xs: "1.5rem", md: "2.5rem" },
                }}
              >
                เว็บอ่าน E BOOK ฟรี
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
      <AppBar position="sticky">
        <Toolbar
          sx={{
            bgcolor: "#FFA500",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              onClick={handleAvatarClick}
              src={
                pathProfile
                  ? `/${pathProfile.profile.replace(
                      "C:\\Users\\Cite\\Downloads\\โปรเจ็คท้าย\\myapp\\react-login\\public\\",
                      ""
                    )}`
                  : ""
              }
              sx={{
                width: 70,
                height: 70,
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

            {user ? (
              <Typography sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                {user.First_name} {role}
              </Typography>
            ) : (
              <Typography sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                Loading...
              </Typography>
            )}
            
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleOpen}
              sx={{ mr: 1, fontSize: "1rem" }}
            >
              addbook <AddTwoToneIcon />
            </Button>
            {role === "admin" && (
              <Button
                variant="contained"
                color="error"
                onClick={handleOpenPopup}
                sx={{ mr: 1, fontSize: "1rem" }}
              >
                Edit member
              </Button>
            )}
            <Button
              variant="contained"
              color="error"
              onClick={handleOpenMyBook}
              sx={{ fontSize: "1rem" }}
            >
              MY BOOK <AddTwoToneIcon />
            </Button>
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", fontStyle: "italic", fontSize: "1.5rem" }}
          >
            E BOOK
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography>Favorite Book</Typography>
              <Favorite />
            </Box>
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        <Box
          sx={{
            bgcolor: "background.paper",
            pt: 8,
            pb: 6,
            backgroundImage: `url(${backgroundImage})`,
          }}
        >
          <Container
            maxWidth="sm"
            sx={{
              backgroundColor: "#F5DEB3",
              borderRadius: "20px",
              border: "5px solid #FF0000",
            }}
          >
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            ></Typography>
            <Typography
              variant="h5"
              align="center"
              color="text.secondary"
              paragraph
            >
              ยินดีต้อนรับ
              <Typography
                variant="h5"
                align="center"
                color="error"
                paragraph
                sx={{ fontWeight: "bold" }}
              >
             
              </Typography>{" "}
              นี้คือเว็บที่ออกแบบมาเพื่อคนชอบอ่านหนังสือบนเว็บไซต์ E BOOK
              ใช้ฟรีไม่เสียตัง
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button variant="contained" onClick={handleLogout}>
                Logout
              </Button>
            </Stack>
          </Container>
        </Box>
        <Box sx={{ backgroundColor: "#f5f5dc" }}>
          <Container sx={{ py: 8 }} maxWidth="md">
            <Book />
          </Container>
        </Box>
      </main>
      <Box
        sx={{ bgcolor: "background.paper", p: 6, backgroundColor: "#F4A460" }}
        component="footer"
      >
        <Typography variant="h6" align="center" gutterBottom>
          Footer
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Something here to give the footer a purpose!
        </Typography>
        <Copyright />
      </Box>
      <EditMember open={isEditMemberOpen} onClose={handleClosePopup} />
      <EditProfilePopup
        open={openProfile}
        onClose={handleProfileClose}
        userId={userId}
      />
      <MyBookPopup open={openMyBook} handleClose={handleCloseMyBook} />
    </ThemeProvider>
  );
}
