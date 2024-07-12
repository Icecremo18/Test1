// Album.js

import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import logo from "./logo1.jpg";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import Book from "./book";
import EditMember from "./EditMember";
import { jwtDecode } from "jwt-decode";
import MyBookPopup from './MyBookPopup';
import backgroundImage from "./assets/images/photo-1521587760476-6c12a4b040da.avif";
import Avatar from "@mui/material/Avatar";
import EditProfilePopup from "./EditProfilePopup";
import axios from "axios";
import Favorite from "./Favorite";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
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
          // alert('authen success')
        } else {
          alert("โปรดเข้าสู้ระบบอีกครั้ง");
          localStorage.removeItem("token");
          window.location = "/login";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    window.location = "/";
  };

  const handleOpen = () => {
    window.location = "/addbook";
  };

  const handleOpenpopup = () => {
    // เปิด Popup

    if (Role === "admin") {
      setEditMemberOpen(true);
    } else {
      alert("คุณไม่ได้รับอนุญาต");
    }
  };

  const handleclosepopup = () => {
    // เปิด Popup
    setEditMemberOpen(false);
  };

  const [name, setname] = useState("");
  const [Role, setRole] = useState("");

  useEffect(() => {
    // ดึง token จาก localStorage
    const token = localStorage.getItem("token"); // แทน 'your_token_key' ด้วยคีย์ที่คุณใช้เก็บ token
    console.log(token);

    if (token) {
      // Decode token เพื่อดึงข้อมูล
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);

      // ดึง username จาก decodedToken
     
      const Role = decodedToken.Role;
      const ID = decodedToken.ID;
      const name =decodedToken.First_name;

      // เซ็ต state เพื่อแสดงผลบนหน้าเว็บ
      setname(name);
      setRole(Role);
      setUserId(ID);
    }
  }, []);
  const [isEditMemberOpen, setEditMemberOpen] = useState(false);

  const handleAvatarClick = () => {
    setOpenProfile(true);
  };

  const handleProfileClose = () => {
    setOpenProfile(false);
  };

  const [userId, setUserId] = useState(null);
  const [openmybook, setOpenmybook] = useState(false);
  
  const handleOpenmybook = () => {
    setOpenmybook(true);
  };

  const handleclosemybook = () => {
    setOpenmybook(false);
  };

const [pathprofile,setpathprofile]= useState("");
useEffect(() => {
  // Example API call to fetch image path based on userId
  axios.get(`http://localhost:3333/get_img/${userId}`)
    .then(response => {
      setpathprofile(response.data); 
      // Assuming response.data contains the path to the image
      
    })
    .catch(error => {
      console.error('Error fetching image path:', error);
      // Handle error state if needed
    });
}, [userId]);
console.log(userId);

console.log(pathprofile);

  // },[userId])
  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          bgcolor: "#FF7F50", // สีเขียว
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
            // color="white"
            height="167px"
          >
            เว็บอ่าน E BOOK ฟรี
            <Typography
              align="left"
              sx={{
                padding: 1,
                fontSize: "1rem",
                marginLeft: "-680px",
                marginTop: "-145px",
              }}
            >
              <img
                src={logo}
                alt="Logo"
                style={{ height: "300px", marginRight: "10px" }}
              />
            </Typography>
          </Typography>
          {/* ... ส่วนอื่น ๆ ... */}
        </Container>
      </Box>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar
          sx={{
            bgcolor: "#FFA500 ",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",

          }}
        >
         <Avatar onClick={handleAvatarClick} src={pathprofile ? `/${pathprofile.profile.replace('C:\\Users\\Cite\\Downloads\\โปรเจ็คท้าย\\myapp\\react-login\\public\\', '')}` : ''}
         sx={{ width: 70, height: 70, mb: 2, mx: 'flex' ,marginTop : '15px' }} >
            H
          </Avatar>
          <Typography
            variant="h6"
            color="inherit"
            noWrap
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Button
              variant="contained"
              color="error"
              onClick={handleOpen}
              sx={{ mr: 1, fontSize: "1rem" }}
            >
              addbook <AddTwoToneIcon />
            </Button>
            {Role === "admin" && (
              <Button
                variant="contained"
                color="error"
                onClick={handleOpenpopup}
                sx={{ mr: 1, fontSize: "1rem" }} // เพิ่ม mr เพื่อทำให้มีระยะห่างกับปุ่มถัดไป
              >
                Edit member
              </Button>
            )}

            <Button variant="contained" color="error" sx={{ fontSize: "1rem" }}  onClick={handleOpenmybook}  >
              MY BOOK <AddTwoToneIcon />
            </Button>
          </Typography>

          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", fontStyle: "italic", fontSize: "1.5rem" }}
          >
            E BOOK

            <Favorite></Favorite>
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        {/* Hero unit */}
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
              ยินดีต้อนรับคุณ
              <Typography
                variant="h5"
                align="center"
                color="error"
                paragraph
                sx={{ fontWeight: "bold" }}
              >
                {name}  {Role}
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
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* End hero unit */}
          <Book />
        </Container>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
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
      {/* End footer */}
      <EditMember open={isEditMemberOpen} onClose={handleclosepopup} />
      <EditProfilePopup
        open={openProfile}
        onClose={handleProfileClose}
        userId={userId}
      />

      <MyBookPopup open={openmybook} handleClose={handleclosemybook} />
    </ThemeProvider>
  );
}


