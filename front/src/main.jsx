// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/700.css";
import { AuthProvider  } from "./context/AuthContext";


ReactDOM.createRoot(document.getElementById('root')).render(
   <AuthProvider>
    <App />
  </AuthProvider>
);
