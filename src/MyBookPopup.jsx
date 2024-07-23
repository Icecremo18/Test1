import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import Editmybook from './editmybook';
import Swal from 'sweetalert2';
import { Box } from '@mui/material';

const MyBookPopup = ({ open, handleClose }) => {
    const [books, setBooks] = useState([]);
    const [booksopen, setBooksopen] = useState(false);
    const [userId, setUserId] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        
         fetchBooks();
        


    },[selectedBook])



    const handleDelete = (bookID) => () => {
        // ดึง token จาก localStorage
        const token = localStorage.getItem("token");
    
        if (!token) {
            Swal.fire({
                title: "Error",
                text: "กรุณาเข้าสู่ระบบก่อน",
                icon: "error"
            });
            return;
        }
    
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3584EB",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://localhost:3333/booksdelete/${bookID}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(response => {
                    console.log('Book deleted successfully:', response.data);
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your book has been deleted.",
                        icon: "success"
                    });
                    // Update books list after deletion
                    fetchBooks();
                })
                .catch(error => {
                    console.error('Error deleting book:', error);
                    Swal.fire({
                        title: "Error",
                        text: "เกิดข้อผิดพลาดในการลบหนังสือ",
                        icon: "error"
                    });
                });
            }
        });
    };
    

    const fetchBooks = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const decodedToken = jwtDecode(token);
                const IDuser = decodedToken.ID;
                setUserId(IDuser);
                if (IDuser) {
                    const response = await axios.get(`http://localhost:3333/mybooksuser/${IDuser}`);
                    setBooks(response.data);
                    
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (open) {
            fetchBooks();
        }
    }, [open]);

    const handleEditClick = (book) => {
        setSelectedBook(book);
        setBooksopen(true);
    };

    const handleCloseEdit = () => {
        setBooksopen(false);
        setSelectedBook(null);
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <Box sx={{backgroundColor: '#f5f5dc'}}  >
            <DialogTitle>MY BOOK</DialogTitle>
            <DialogContent    >
                <TableContainer component={Paper}   sx={{backgroundColor: '#f5f5dc'}} >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Typing</TableCell>
                                <TableCell>Detail</TableCell>
                                <TableCell>Write</TableCell>
                                <TableCell>Publish</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {books && books.map((book) => (
                                <TableRow key={book.bookID}>
                                    <TableCell>{book.bookID}</TableCell>
                                    <TableCell>{book.name}</TableCell>
                                    <TableCell>{book.category_name}</TableCell>
                                    <TableCell>{book.detail}</TableCell>
                                    <TableCell>{book.write}</TableCell>
                                    <TableCell>{book.publish}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleEditClick(book)}>Edit</Button>
                                        <Button onClick={handleDelete(book.bookID)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Close
                </Button>
                
            </DialogActions>
            <Editmybook
                open={booksopen}
                onClose={handleCloseEdit}
                book={selectedBook}
            />
            </Box>
        </Dialog>
    );
};

export default MyBookPopup;
