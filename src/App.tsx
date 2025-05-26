import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
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
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setUser } from './store/slices/authSlice';
import jwt_decode from 'jwt-decode';

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

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/order" element={<PrivateRoute><OrderForm /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
    </Routes>
  </>
);

function useAuthRestore() {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        // Check if token is expired
        if (typeof decoded === 'object' && decoded && 'exp' in decoded) {
          if ((decoded.exp * 1000) < Date.now()) {
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
