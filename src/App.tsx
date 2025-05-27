import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OrderForm from './pages/OrderForm';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './store/slices/authSlice';
import { jwtDecode } from 'jwt-decode';
import { RootState } from './store';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

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

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <>
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
          path="/admin" 
          element={
            user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />
          } 
        />
      </Routes>
    </>
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
