import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  SelectChangeEvent,
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { addToCart } from '../store/slices/cartSlice';
import { OrderItem } from '../types';

const Store = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');

  const handleOpenDialog = (product: any) => {
    setSelectedProduct(product);
    setSize(product.available_sizes[0] || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setQuantity(1);
    setSize('');
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const cartItem: OrderItem = {
      id: `${selectedProduct.id}-${size}`,
      product_id: selectedProduct.id,
      product_type: selectedProduct.productType.base_type,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image_front: selectedProduct.image_url,
      size,
      quantity,
    };
    dispatch(addToCart(cartItem));
    handleCloseDialog();
  };

  useEffect(() => {
    fetchProducts();
    fetchProductTypes();
  }, []);

  const fetchProducts = async (typeId = '') => {
    try {
      setLoading(true);
      const url = typeId
        ? `${API_BASE_URL}/.netlify/functions/getProducts?productTypeId=${typeId}`
        : `${API_BASE_URL}/.netlify/functions/getProducts`;
      const res = await axios.get(url);
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const fetchProductTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getProductTypes`);
      setProductTypes(res.data);
    } catch (err) {
      // Handle error silently for now
    }
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    setSelectedType(event.target.value as string);
    fetchProducts(event.target.value as string);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Loja
      </Typography>
      <Box sx={{ mb: 4 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por Tipo</InputLabel>
          <Select value={selectedType} label="Filtrar por Tipo" onChange={handleTypeChange}>
            <MenuItem value="">
              <Typography sx={{ fontStyle: 'italic' }}>Todos</Typography>
            </MenuItem>
            {productTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image_url}
                  alt={product.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    €{product.price.toFixed(2)}
                  </Typography>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenDialog(product)}>
                    Adicionar ao Pedido
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Adicionar ao Pedido</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <>
              <Typography variant="h6">{selectedProduct.name}</Typography>
              <TextField
                label="Quantidade"
                type="number"
                value={quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                sx={{ mt: 2, mb: 2 }}
                InputProps={{ inputProps: { min: 1 } }}
              />
              <FormControl fullWidth>
                <InputLabel>Tamanho</InputLabel>
                <Select value={size} label="Tamanho" onChange={(e: any) => setSize(e.target.value)}>
                  {selectedProduct.available_sizes.map((s: string) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleAddToCart} variant="contained">Adicionar ao Carrinho</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Store; 