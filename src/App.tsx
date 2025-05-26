import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      <Route path="/order" element={<OrderForm />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  </>
);

function App() {
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
