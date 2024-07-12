import React, { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Swal from 'sweetalert2';

import { jwtDecode } from "jwt-decode";
function BookForm() {
    const [name , setname] = useState('')
    const [write , setwrite] = useState('')
    const [detail , setdetail] = useState('')
    const [publish , setpublish] = useState('')
    const [typing,settypeing] = useState('')
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
  
  

    useEffect(() => {
      // ดึง token จาก localStorage
      const token = localStorage.getItem("token"); // แทน 'your_token_key' ด้วยคีย์ที่คุณใช้เก็บ token
      console.log(token);
  
      if (token) {
        // Decode token เพื่อดึงข้อมูล
        const decodedToken = jwtDecode(token);
        console.log(decodedToken);
  
        // ดึง username จาก decodedToken
       
        const ID = decodedToken.ID;
  
        // เซ็ต state เพื่อแสดงผลบนหน้าเว็บ
       
        setUserId(ID);
      }
    }, []);







    const navigate = useNavigate()

    const addBook = async (e) => {
      e.preventDefault();
  
      if (!name || !write || !detail || !publish || !typing || !coverImage || !pdfFile) {
        setError('Please fill in all fields');
        return;
      }
  
      try {
        setLoading(true);
        setError(null);
  
        const formData = new FormData();
        formData.append('name', name);
        formData.append('write', write);
        formData.append('detail', detail);
        formData.append('publish', publish);
        formData.append('typing', typing);
        formData.append('coverImage', coverImage);
        formData.append('pdfFile', pdfFile);
        formData.append('userid', userId);
  
        const response = await axios.post('http://localhost:3333/addbook', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        Swal.fire({
          title: "add book successful",
          
          icon: "success"
        });
        navigate('/album');
      } catch (error) {
        
        console.error('Error adding book:', error);
        setError('Error adding book. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    

  const handgohome = () => {
    navigate('/album');
  };

  const [coverImage, setCoverImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    setCoverImage(file);
  };

const handlePdfFileChange = (e) => {
  const file = e.target.files[0];
  setPdfFile(file);
};

  const [selectedOption, setSelectedOption] = useState('');

  
  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
    settypeing(selectedValue.toString());
  }


  console.log(userId);
  console.log();
  
  return (
    
    <Box
    
      sx={{
        maxWidth: 400,
        margin: 'auto',
        padding: 2,
        border: '1px solid #ccc',
        borderRadius: 8,
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#FFC300',
      }}
    >   <br /><br /><br /><br />
      <h2
        sx={{
          fontSize: '1.5rem',
          marginBottom: 2,
          textAlign: 'center',
          
        }}
      >
        Add a New Book
      </h2>
      <form>
        <div sx={{ marginBottom: 2 }}>
          <TextField
            id="name"
            label="Name"
            variant="outlined"
            fullWidth
            onChange={e => setname(e.target.value)}
          />
        </div><br />

        <div sx={{ marginBottom: 2 }}>
          <TextField
            id="write"
            label="Write"
            variant="outlined"
            fullWidth
            onChange={e => setwrite(e.target.value)}
          />
        </div><br />

        <div sx={{ marginBottom: 2 }}>
          <TextField
            id="detail"
            label="Detail"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            onChange={e => setdetail(e.target.value)}
          />
        </div><br />

        <div sx={{ marginBottom: 2 }}>
          <TextField
            id="publish"
            label="Publish"
            variant="outlined"
            fullWidth
            onChange={e => setpublish(e.target.value)}
          />
        </div>
        <br />
        <br />
        <div sx={{ marginBottom: 2 }}>
        <div sx={{ marginBottom: 2 }}>

          เลือกประเภท
      <Select
      
        label="Select Option"
        variant="outlined"
        
        fullWidth
        value={selectedOption}
        onChange={handleSelectChange}
      >
        <MenuItem value="นิยาย">นิยาย</MenuItem>
        <MenuItem value="การ์ตูน">การ์ตูน</MenuItem>
        <MenuItem value="วรรณกรรม">วรรณกรรม</MenuItem>
        <MenuItem value="นิทาน">นิทาน</MenuItem>
      </Select>
      <br />
      <br />
    </div>
          <br />
        <br />
        </div>
        ภาพหน้าปกหนังสือ <br />
        <input type="file" accept="image/*" onChange={handleCoverImageChange} />
            <br />
        <br />
        เนื้อหาภายในหนังสือ <br />
        <input type="file" accept=".pdf" onChange={ handlePdfFileChange} />
        <br /><br /><br />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ padding: 1, fontSize: '1rem' }}
          onClick={addBook}
        >
          Add Book
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handgohome}
          sx={{ padding: 1, fontSize: '1rem', marginLeft:'230px' }}
        >
          main
        </Button>
      </form>
    </Box>
  );
}



export default BookForm;
