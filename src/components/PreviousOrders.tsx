import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../store/slices/orderSlice';
import { RootState, AppDispatch } from '../store';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';

const PreviousOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.order);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders(user.id));
    }
  }, [dispatch, user]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        My Previous Orders
      </Typography>
      <List>
        {orders.map((order) => (
          <ListItem key={order.id}>
            <ListItemText
              primary={`Order #${order.id} - Status: ${order.status}`}
              secondary={`Total: $${order.total_price}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default PreviousOrders; 