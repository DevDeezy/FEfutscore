import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  IconButton,
  TextField,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { removeFromCart, clearCart } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';
import { AppDispatch } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const initialAddress = {
  nome: '',
  morada: '',
  cidade: '',
  distrito: '',
  pais: 'Portugal',
  codigoPostal: '',
  telemovel: '',
};

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const [address, setAddress] = useState(initialAddress);
  const [proofImage, setProofImage] = useState<string>('');
  const [proofError, setProofError] = useState<string | null>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);
  const [cartPrice, setCartPrice] = useState<number | null>(null);

  const handleRemoveItem = (index: number) => {
    dispatch(removeFromCart(index));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProofError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProofError('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProofError('Image size should be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setProofImage(result);
      } else {
        setProofError('Error processing the image');
      }
    };
    reader.onerror = () => setProofError('Error reading the image file');
    reader.readAsDataURL(file);
  };

  const allFieldsFilled = Object.values(address).every((v) => v.trim() !== '');
  const canPlaceOrder = items.length > 0 && allFieldsFilled && !!proofImage;

  const getBackendItems = (items: any[]) =>
    items.map((item) =>
      item.product_type === 'tshirt'
        ? { ...item, shirt_type_id: item.shirt_type_id }
        : item
    );

  const handleSubmitOrder = async () => {
    if (canPlaceOrder && user) {
      await dispatch(createOrder({ userId: user.id, items: getBackendItems(items), address: { ...address, proofImage } }));
      dispatch(clearCart());
      setAddress(initialAddress);
      setProofImage('');
      navigate('/');
    }
  };

  useEffect(() => {
    const fetchCartPrice = async () => {
      if (items.length === 0) {
        setCartPrice(null);
        return;
      }
      try {
        const res = await axios.post(`${API_BASE_URL}/.netlify/functions/calculateOrderPrice`, {
          items: getBackendItems(items),
        });
        setCartPrice(res.data.price);
      } catch {
        setCartPrice(null);
      }
    };
    fetchCartPrice();
  }, [items]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Shopping Cart
        </Typography>
        {items.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            Your cart is empty
          </Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              {items.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {item.image_front && (
                        <img
                          src={item.image_front}
                          alt="Front"
                          style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 4, border: '1px solid #eee', marginRight: 16 }}
                        />
                      )}
                      {item.product_type === 'tshirt' && item.image_back && (
                        <img
                          src={item.image_back}
                          alt="Back"
                          style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 4, border: '1px solid #eee', marginRight: 16 }}
                        />
                      )}
                      <Box>
                        <Typography variant="subtitle1">
                          {item.product_type === 'tshirt' ? 'T-Shirt' : 'Shoes'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Size: {item.size}
                        </Typography>
                        {item.player_name && (
                          <Typography variant="body2" color="text.secondary">
                            Player Name: {item.player_name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>Shipping Address</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Name" name="nome" fullWidth required value={address.nome} onChange={handleAddressChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Phone" name="telemovel" fullWidth required value={address.telemovel} onChange={handleAddressChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Address" name="morada" fullWidth required value={address.morada} onChange={handleAddressChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="City" name="cidade" fullWidth required value={address.cidade} onChange={handleAddressChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="District" name="distrito" fullWidth required value={address.distrito} onChange={handleAddressChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Postal Code" name="codigoPostal" fullWidth required value={address.codigoPostal} onChange={handleAddressChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Country" name="pais" fullWidth required value={address.pais} onChange={handleAddressChange} />
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>Proof of Payment</Typography>
              <Button
                variant="contained"
                component="label"
                sx={{ mb: 2 }}
              >
                Upload Proof Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={proofInputRef}
                  onChange={handleProofChange}
                />
              </Button>
              {proofError && <Alert severity="error" sx={{ mb: 2 }}>{proofError}</Alert>}
              {proofImage && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={proofImage}
                    alt="Proof of Payment"
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain', border: '1px solid #eee', borderRadius: 4 }}
                  />
                </Box>
              )}
            </Box>
            {cartPrice !== null && (
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Total Price: €{cartPrice.toFixed(2)}
              </Typography>
            )}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/order')}
              >
                Continue Shopping
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitOrder}
                disabled={!canPlaceOrder}
              >
                Place Order
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Cart; 