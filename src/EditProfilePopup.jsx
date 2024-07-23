import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import Avatar from "@mui/material/Avatar";
import { styled } from '@mui/material/styles';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function EditProfilePopup({ open, onClose, userId }) {
    const [user, setUser] = useState({ First_name: '', Last_name: '', email: '', phone: '' });
    const [profile, setProfile] = useState(null);
    const [currentProfile, setCurrentProfile] = useState("");

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:3333/usersprofile/${userId}`)
                .then(response => {
                    const userData = response.data;
                    setUser({
                        First_name: userData.First_name,
                        Last_name: userData.Last_name,
                        email: userData.email,
                        phone: userData.phone,
                    });
                })
                .catch(error => console.error('Error fetching user:', error));
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:3333/get_img/${userId}`)
                .then(response => {
                    setCurrentProfile(response.data.profile); // สมมติว่า response.data มี property profile ที่เก็บ URL รูปภาพ
                })
                .catch(error => console.error('Error fetching image path:', error));
        }
    }, [userId]);

    const handleSave = async () => {
        try {
            const userData = { ...user };

            const updateResponse = await axios.patch(`http://localhost:3333/userprofileedit/${userId}`, userData);

            if (updateResponse.data.message === 'DONE') {
                if (profile) {
                    const formData = new FormData();
                    formData.append('profileImage', profile);
                    formData.append('userId', userId);

                    const uploadResponse = await axios.post(`http://localhost:3333/uploadProfileImage/${userId}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    if (uploadResponse.data.message === 'Profile image uploaded successfully') {
                        onClose();
                    } else {
                        console.error('Error uploading profile image:', uploadResponse.data.error);
                    }
                } else {
                    onClose();
                }
            } else {
                console.error('Error updating user profile:', updateResponse.data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfile(file); // ตั้งค่าโปรไฟล์เป็นไฟล์จริง
        }
    };

    const navigate = useNavigate();
    const handleChangePasswordClick = () => {
        navigate('/reset-password-request'); // Navigate to the reset password page
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <Box sx={{ backgroundColor:'#f5f5dc' }}>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    <Avatar
                        alt="Profile Image"
                        src={profile ? URL.createObjectURL(profile) : currentProfile ? `/${currentProfile.replace('C:\\Users\\Cite\\Downloads\\โปรเจ็คท้าย\\myapp\\react-login\\public\\', '')}` : ''}
                        sx={{ width: 100, height: 100, mb: 2, mx: 'auto' }}
                    >
                        H
                    </Avatar>
                    <Button
                        component="label"
                        variant="contained"
                        startIcon={<AccountBoxIcon />}
                        onChange={handleAvatarChange}
                    >
                        Upload Profile
                        <VisuallyHiddenInput type="file" accept="image/*" />
                    </Button>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="First Name"
                        type="text"
                        fullWidth
                        value={user.First_name}
                        onChange={(e) => setUser({ ...user, First_name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Last Name"
                        type="text"
                        fullWidth
                        value={user.Last_name}
                        onChange={(e) => setUser({ ...user, Last_name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Phone"
                        type="text"
                        fullWidth
                        value={user.phone}
                        onChange={(e) => {
                            const phoneNumber = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setUser({ ...user, phone: phoneNumber });
                        }}
                    />
                    <Button onClick={handleChangePasswordClick} sx={{ mt: 2 }}>
                        Change Password
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default EditProfilePopup;
