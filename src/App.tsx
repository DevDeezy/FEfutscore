import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OrderForm from './pages/OrderForm';
import Cart from './pages/Cart';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './store/slices/authSlice';
import { jwtDecode } from 'jwt-decode';
import { RootState } from './store';
import theme from './theme';
import Footer from './components/Footer';

const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const AppRoutes = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (typeof decoded === 'object' && decoded && 'exp' in decoded) {
          if (((decoded as { exp: number }).exp * 1000) < Date.now()) {
            localStorage.removeItem('token');
          }
        }
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  // Debug log for user
  console.log('AppRoutes user:', user);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/order" 
          element={
            user ? <OrderForm /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/cart" 
          element={
            user ? <Cart /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/admin" 
          element={
            (() => { console.log('Admin route user:', user); return user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace /> })()
          } 
        />
      </Routes>
      <Footer />
    </ThemeProvider>
  );
};

function useAuthRestore() {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (typeof decoded === 'object' && decoded && 'exp' in decoded) {
          if (((decoded as { exp: number }).exp * 1000) < Date.now()) {
            localStorage.removeItem('token');
            return;
          }
        }
        dispatch(setUser({ ...decoded, token }));
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
  }, [dispatch]);
}

function App() {
  useAuthRestore();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
