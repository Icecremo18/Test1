import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      if (searchTerm.length > 0) {
        try {
          const response = await axios.get('http://localhost:3333/search', {
            params: { name: searchTerm },
          });
          setResults(response.data);
        } catch (error) {
          console.error('Error searching books:', error);
        }
      } else {
        setResults([]); // Clear results when searchTerm is empty
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 300); // Delay to limit API calls while typing

    return () => clearTimeout(delayDebounceFn); // Cleanup timeout
  }, [searchTerm]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
      <TextField
        variant="outlined"
        placeholder="Search for a book..."
        sx={{ width: { xs: '100%', sm: '400px' } }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ mt: 2, width: '100%', maxWidth: 400  , backgroundColor:"yello"}    }>
        <Typography variant="h6">Search Results:</Typography>
        <List>
          {results.map((book) => (
            <ListItem key={book.id} button>
              <ListItemText primary={book.name} />

            </ListItem>
          ))}
        </List>
        {results.length === 0 && searchTerm && (
          <Typography variant="body2" color="text.secondary">
            No results found.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
