import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import axios from 'axios';
import { Box } from '@mui/material';
const Editmybook = ({ open, onClose, book }) => {
    const [formData, setFormData] = useState({
        name: '',
        typing: '',
        detail: '',
        write: '',
        publish: ''
    });

    useEffect(() => {
        if (book) {
            setFormData({
                name: book.name || '',
                typing: book.category_name || '',
                detail: book.detail || '',
                write: book.write || '',
                publish: book.publish || ''
            });
        }
    }, [book]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSave = () => {
        const { bookID } = book;
        axios.patch(`http://localhost:3333/books/${bookID}`, formData)
            .then(response => {
                console.log('Book updated successfully:', response.data);
                onClose();
            })
            .catch(error => {
                console.error('Error updating book:', error);
            });
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <Box sx={{backgroundColor: '#f5f5dc'}}  >
            <DialogTitle>Edit Book</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    name="name"
                    label="Name"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange}
                />
                <FormControl fullWidth margin="dense">
                    <InputLabel>Typing</InputLabel>
                    <Select
                        name="typing"
                        value={formData.typing}
                        onChange={handleChange}
                    >
                        <MenuItem value="นิยาย">นิยาย</MenuItem>
                        <MenuItem value="การ์ตูน">การ์ตูน</MenuItem>
                        <MenuItem value="วรรณกรรม">วรรณกรรม</MenuItem>
                        <MenuItem value="นิทาน">นิทาน</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    margin="dense"
                    name="detail"
                    label="Detail"
                    fullWidth
                    value={formData.detail}
                    onChange={handleChange}
                />
                <TextField
                    margin="dense"
                    name="write"
                    label="Write"
                    fullWidth
                    value={formData.write}
                    onChange={handleChange}
                />
                <TextField
                    margin="dense"
                    name="publish"
                    label="Publish"
                    fullWidth
                    value={formData.publish}
                    onChange={handleChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
            </Box>
        </Dialog>
    );
};

export default Editmybook;
