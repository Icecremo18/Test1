import React, { useEffect, useState, useCallback } from 'react';
import { Container, Grid, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';
import Bar from './bar'; // นำเข้า SearchBar

function Book() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBooks = useCallback(async () => {
    const response = await axios.get('http://localhost:3333/books');
    setBooks(response.data);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (a.name.toLowerCase() === searchTerm.toLowerCase()) return -1; // นำอันที่ค้นหาขึ้นมาอันแรก
    return 0;
  });

  return (
    <Container sx={{ py: 8 }} maxWidth="md">
      <Bar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Grid container spacing={4}>
        {sortedBooks.map((book) => (
          <Grid item key={book.bookID} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5">{book.name}</Typography>
                <Typography>Author: {book.write}</Typography>
                <Typography>Publisher: {book.publish}</Typography>
                <Typography>Synopsis: {book.detail}...</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Book;
