import React, { useEffect, useState, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Button } from '@mui/material';

const ITEM_HEIGHT = 48;

export default function LongMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [books, setBooks] = useState([]);

  const fetchBooks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decodedToken = jwtDecode(token);
      const userID = decodedToken.ID;

      const response = await axios.get(`http://localhost:3333/api/favorites/${userID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);


  const displayPdfFromId = useCallback((bookpath) => {
    const cleanBookPath = bookpath.startsWith('/') ? bookpath.slice(1) : bookpath;
    const encodedPath = encodeURIComponent(cleanBookPath);
    const url = `http://localhost:3002/${encodedPath}`;
    window.open(url, '_blank');
  }, []);





  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 20,
            width: '40ch',
            backgroundColor: '#f5f5dc', // สีพื้นหลังที่ดูเหมือนกระดาษ
            border: '1px solid #8B4513', // สีกระดาษสีน้ำตาล
            borderRadius: '8px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        {books.map((book) => (
          <MenuItem
            key={book.favorite_ID}
            onClick={handleClose}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: '#e0e0e0', // เปลี่ยนสีเมื่อ hover
              },
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={book.cover_image}
                alt={`Cover for book ${book.bookID}`}
                style={{ width: '50px', marginRight: '10px', borderRadius: '5px' }} // รูปภาพมุมมน
              />
              <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#8B4513' }}>{book.name}</span>
            </div>
            <Button onClick={() => displayPdfFromId(book.PDF)}
              sx={{
                marginLeft: 'auto',
                backgroundColor: '#8B4513',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#15b37e', // สีเมื่อ hover
                  
                },
              }}
            >
              READ
            </Button>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
