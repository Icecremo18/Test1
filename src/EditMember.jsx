import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import EditUserForm from './EditUserForm';
import RefreshIcon from '@mui/icons-material/Refresh';
import Swal from 'sweetalert2';
import { jwtDecode as jwt_decode } from 'jwt-decode';
import './index.css';
import { Box } from '@mui/material';

const EditMember = ({ open, onClose }) => {
  const [users, setUsers] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    // Fetch users data from API
    axios.get('http://localhost:3333/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleRefresh = () => {
    axios.get('http://localhost:3333/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  };

  const handleDelete = (userId) => {
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
      const decodedToken = jwt_decode(token);
      const userRole = decodedToken.Role;
      console.log(userRole);

      if (userRole === 'admin') {
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
            axios.delete(`http://localhost:3333/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
              .then(response => {
                console.log('User deleted successfully:', response.data);
                Swal.fire({
                  title: "Deleted!",
                  text: "Your user has been deleted.",
                  icon: "success"
                });
                return axios.get('http://localhost:3333/users', {
                  headers: { Authorization: `Bearer ${token}` }
                });
              })
              .then(response => {
                setUsers(response.data);
              })
              .catch(error => {
                console.error('Error deleting user:', error);
                Swal.fire({
                  title: "Error",
                  text: "เกิดข้อผิดพลาดในการลบผู้ใช้",
                  icon: "error"
                });
              });
          }
        });
      } else {
        Swal.fire({
          title: "Permission Denied",
          text: "คุณไม่ได้รับอนุญาตให้ลบผู้ใช้",
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
  };

  const handleEdit = (userId) => {
    setSelectedUserId(userId); 
    setOpenEdit(true); 
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <Box sx={{backgroundColor:'#f5f5dc'}} >
      <DialogTitle>Edit Member</DialogTitle>
      <DialogContent   >
        {/* <Button onClick={handleRefresh} endIcon={<RefreshIcon />} sx={{alignItems :'center'}}  >Refresh</Button> */}
        <TableContainer component={Paper}   sx={{backgroundColor:'#f5f5dc'}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Role</TableCell>
                
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Edit</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users && users.map((user) => (
                <TableRow key={user.ID}>
                  <TableCell>{user.ID}</TableCell>
                  <TableCell>{user.Role}</TableCell>
                
                  <TableCell>{user.First_name}</TableCell>
                  <TableCell>{user.Last_name}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(user.ID)}>Edit</Button>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleDelete(user.ID)} sx={{ color: 'red' }}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>

      {openEdit && (
        <EditUserForm
          open={openEdit}
          onClose={() => {
            setOpenEdit(false);
            handleRefresh(); // Refresh data after closing the edit form
          }}
          userId={selectedUserId}
        />
      )}
      </Box>
    </Dialog>
  );
};

export default EditMember;
