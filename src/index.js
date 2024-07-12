import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Album from './Album';
import Register from './Register'
import ContactUser from './ContactUser'
import reportWebVitals from './reportWebVitals';
import AddBook from './addbook';
import Book from './book'
import EditMember from './EditMember';
import EditUserForm from './EditUserForm';
import EditProfilePopupe from './EditProfilePopup';




const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
    <Route path="/books" element={<Book />} />
      <Route path="/" element={<Login/>}/>
      <Route path="/login" element={<Login/>}/>
  
      <Route path="/register" element={<Register/>}/>
      <Route path="/album" element={<Album/>}/>
      <Route path="/contactuser" element={<ContactUser/>}/>
      <Route path="/addbook" element={<AddBook/>}/>
      <Route path="/EditMember" element={<EditMember/>}/>
      <Route path="/EditUserForm" element={<EditUserForm/>}/>
      <Route path = "/UserProfile"  element = {<EditProfilePopupe/>} />
      
      
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
