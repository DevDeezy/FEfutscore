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
  Pagination,
} from '@mui/material';
import { Order, OrderItem } from '../types';
import PaymentProofModal from './PaymentProofModal';

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
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { orders, loading, error, pagination } = useSelector((state: RootState) => state.order);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleOpenModal = (order: Order) => setSelectedOrder(order);
  const handleCloseModal = () => setSelectedOrder(null);
  
  const handleOpenPaymentModal = (order: Order) => {
    setSelectedOrderForPayment(order);
    setPaymentModalOpen(true);
  };
  
  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedOrderForPayment(null);
  };

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders({ userId: user.id, page: currentPage, limit: 10 }));
    }
  }, [dispatch, user, currentPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

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
        Os Meus Pedidos Anteriores
      </Typography>
      <List>
        {Array.isArray(orders) && orders.map((order) => (
          <ListItem
            key={order.id}
            secondaryAction={
              <Box sx={{ display: 'flex', gap: 1 }}>
                {order.status === 'Em pagamento' && (
                  <Button 
                    variant="contained" 
                    color="warning" 
                    size="small" 
                    onClick={() => handleOpenPaymentModal(order)}
                  >
                    Adicionar Pagamento
                  </Button>
                )}
                <Button variant="outlined" size="small" onClick={() => handleOpenModal(order)}>
                  Detalhes
                </Button>
              </Box>
            }
          >
            <ListItemText
              primary={`Encomenda #${order.id} - Estado: ${order.status}`}
              secondary={
                <>
                  {order.total_price != null
                    ? `Total: €${order.total_price.toFixed(2)}`
                    : 'Total: -'}
                  {order.status === 'Em pagamento' && (
                    <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                      ⚠️ Pagamento pendente - Adicione a prova de pagamento
                    </Typography>
                  )}
                </>
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
                Artigos
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
                            <Typography variant="body2">Imagem da Frente:</Typography>
                            <img
                              src={item.image_front}
                              alt="Design da frente"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '150px',
                                border: '1px solid #ddd',
                                cursor: 'zoom-in',
                              }}
                              onClick={() => setImagePreview(item.image_front || null)}
                            />
                          </Box>
                        )}
                        {item.image_back && (
                          <Box>
                            <Typography variant="body2">Imagem das Costas:</Typography>
                            <img
                              src={item.image_back}
                              alt="Design das costas"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '150px',
                                border: '1px solid #ddd',
                                cursor: 'zoom-in',
                              }}
                              onClick={() => setImagePreview(item.image_back || null)}
                            />
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </List>

              {/* Tracking Information */}
              {(selectedOrder.trackingText || 
                (selectedOrder.trackingImages && selectedOrder.trackingImages.length > 0) ||
                (selectedOrder.trackingVideos && selectedOrder.trackingVideos.length > 0)) && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    📦 Informações de Tracking
                  </Typography>
                  
                  {selectedOrder.trackingText && (
                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }} variant="outlined">
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Informações de Rastreamento:
                      </Typography>
                      <Typography variant="body2">
                        {selectedOrder.trackingText}
                      </Typography>
                    </Paper>
                  )}
                  
                  {selectedOrder.trackingImages && selectedOrder.trackingImages.length > 0 && (
                    <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Imagens de Tracking:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedOrder.trackingImages.map((img: string, idx: number) => (
                          <Box key={idx}>
                            <img
                              src={img}
                              alt={`Tracking ${idx + 1}`}
                              style={{
                                maxWidth: '150px',
                                maxHeight: '150px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'zoom-in',
                              }}
                              onClick={() => setImagePreview(img)}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  )}

                  {selectedOrder.trackingVideos && selectedOrder.trackingVideos.length > 0 && (
                    <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Vídeos de Tracking:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {selectedOrder.trackingVideos.map((video: string, idx: number) => (
                          <Box key={idx}>
                            <video
                              src={video}
                              controls
                              style={{
                                maxWidth: '300px',
                                maxHeight: '200px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  )}
                </Box>
              )}
              <Button onClick={handleCloseModal} sx={{ mt: 2 }}>
                Fechar
              </Button>
            </>
          )}
        </Box>
      </Modal>
      
      {selectedOrderForPayment && (
        <PaymentProofModal
          open={paymentModalOpen}
          onClose={handleClosePaymentModal}
          order={selectedOrderForPayment}
        />
      )}
      
      {/* Image Preview Modal */}
      <Modal open={!!imagePreview} onClose={() => setImagePreview(null)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', outline: 0 }}>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }} />
          )}
        </Box>
      </Modal>
      
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Paper>
  );
};

export default PreviousOrders; 