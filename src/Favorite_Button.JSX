// FavoriteButton.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const Favorite_Button = ({ userId, bookId }) => {
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        // ตรวจสอบว่า bookId นี้อยู่ในรายการโปรดหรือไม่
        const checkFavoriteStatus = async () => {
            try {
                const response = await axios.get(`/api/favorites/${userId}`);
                const favorites = response.data;
                setIsFavorited(favorites.some(favorite => favorite.bookID === bookId));
            } catch (error) {
                console.error('Failed to fetch favorite status', error);
            }
        };
        checkFavoriteStatus();
    }, [userId, bookId]);

    const toggleFavorite = async () => {
        const method = isFavorited ? 'DELETE' : 'POST';
        try {
            await axios({
                method,
                url: '/api/favorite',
                data: { userId, bookId },
            });
            setIsFavorited(!isFavorited);
        } catch (error) {
            console.error('Failed to update favorite status', error);
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

export default Favorite_Button;
