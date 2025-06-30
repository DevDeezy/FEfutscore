import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Home = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontSize: {
              xs: '2.5rem',
              sm: '3.75rem',
            },
          }}
        >
          Welcome to FutScore
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your one-stop shop for custom sports merchandise.
        </Typography>
        {!user && (
          <Box sx={{ mt: 4 }}>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              color="primary"
              size="large"
            >
              Login
            </Button>
          </Box>
        )}
        {user && (
          <Box sx={{ mt: 4 }}>
            <Button
              component={RouterLink}
              to="/order"
              variant="contained"
              color="primary"
              size="large"
            >
              Create New Order
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Home; 