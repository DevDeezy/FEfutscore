import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../store/slices/orderSlice';
import { RootState, AppDispatch } from '../store';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Modal,
  Grid,
} from '@mui/material';
import { Order, OrderItem } from '../types';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const PreviousOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.order);
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleOpenModal = (order: Order) => setSelectedOrder(order);
  const handleCloseModal = () => setSelectedOrder(null);

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

  if (!orders || orders.length === 0) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        My Previous Orders
      </Typography>
      <List>
        {orders.map((order) => (
          <ListItem
            key={order.id}
            secondaryAction={
              <Button variant="outlined" size="small" onClick={() => handleOpenModal(order)}>
                Detalhes
              </Button>
            }
          >
            <ListItemText
              primary={`Encomenda #${order.id} - Estado: ${order.status}`}
              secondary={
                order.total_price != null
                  ? `Total: €${order.total_price.toFixed(2)}`
                  : 'Total: -'
              }
            />
          </ListItem>
        ))}
      </List>
      <Modal
        open={!!selectedOrder}
        onClose={handleCloseModal}
        aria-labelledby="order-details-title"
      >
        <Box sx={modalStyle}>
          {selectedOrder && (
            <>
              <Typography id="order-details-title" variant="h6" component="h2">
                Detalhes da Encomenda #{selectedOrder.id}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                <Typography component="span" sx={{ fontWeight: 'bold' }}>Estado:</Typography> {selectedOrder.status}
              </Typography>
              <Typography>
                <Typography component="span" sx={{ fontWeight: 'bold' }}>Total:</Typography>{' '}
                {selectedOrder.total_price != null
                  ? `€${selectedOrder.total_price.toFixed(2)}`
                  : '-'}
              </Typography>
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Items
              </Typography>
              <List>
                {selectedOrder.items.map((item: OrderItem, index: number) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }} variant="outlined">
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography>
                          <Typography component="span" sx={{ fontWeight: 'bold' }}>Produto:</Typography> {item.product_type}
                        </Typography>
                        <Typography>
                          <Typography component="span" sx={{ fontWeight: 'bold' }}>Tamanho:</Typography> {item.size}
                        </Typography>
                        {item.player_name && (
                          <Typography>
                            <Typography component="span" sx={{ fontWeight: 'bold' }}>Nome do Jogador:</Typography> {item.player_name}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {item.image_front && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2">Front Image:</Typography>
                            <img
                              src={item.image_front}
                              alt="Front design"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '150px',
                                border: '1px solid #ddd',
                              }}
                            />
                          </Box>
                        )}
                        {item.image_back && (
                          <Box>
                            <Typography variant="body2">Back Image:</Typography>
                            <img
                              src={item.image_back}
                              alt="Back design"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '150px',
                                border: '1px solid #ddd',
                              }}
                            />
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </List>
              <Button onClick={handleCloseModal} sx={{ mt: 2 }}>
                Close
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Paper>
  );
};

export default PreviousOrders; 