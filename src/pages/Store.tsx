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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { addToCart } from '../store/slices/cartSlice';
import { OrderItem } from '../types';
import Checkbox from '@mui/material/Checkbox';

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
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [sexo, setSexo] = useState('Masculino');
  const [patchImages, setPatchImages] = useState<string[]>([]);
  const [anoInput, setAnoInput] = useState('');
  const [anoLocked, setAnoLocked] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const getFormattedAno = (input: string) => {
    if (!/^[0-9]{2}$/.test(input)) return '';
    const first = input;
    let second = (parseInt(first, 10) + 1).toString().padStart(2, '0');
    if (first === '99') second = '00';
    return `${first}/${second}`;
  };

  const handleOpenDialog = (product: any) => {
    setSelectedProduct(product);
    setSize(product.available_sizes[0] || '');
    setPlayerName('');
    setPlayerNumber('');
    setSexo('Masculino');
    setPatchImages([]);
    setAnoInput('');
    setAnoLocked(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setQuantity(1);
    setSize('');
  };

  const handlePatchImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const readers: Promise<string>[] = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then(images => {
        setPatchImages(prev => [...prev, ...images]);
      });
    }
  };
  const handleRemovePatchImage = (idx: number) => {
    setPatchImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const ano = getFormattedAno(anoInput);
    const cartItem: OrderItem = {
      id: `${selectedProduct.id}-${size}`,
      product_id: selectedProduct.id,
      product_type: selectedProduct.productType.base_type,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image_front: selectedProduct.image_url,
      size,
      quantity,
      player_name: playerName,
      numero: playerNumber,
      sexo,
      patch_images: patchImages,
      ano,
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
      <Dialog open={openDialog} onClose={handleCloseDialog} fullScreen={fullScreen}>
        <DialogTitle>Adicionar ao Pedido</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <>
              <Typography variant="h6">{selectedProduct.name}</Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Sexo</InputLabel>
                <Select value={sexo} label="Sexo" onChange={e => setSexo(e.target.value)}>
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Feminino">Feminino</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Ano"
                value={anoLocked ? getFormattedAno(anoInput) : anoInput}
                onChange={e => {
                  let val = e.target.value.replace(/[^0-9]/g, '');
                  if (!anoLocked) {
                    if (val.length > 2) val = val.slice(0, 2);
                    setAnoInput(val);
                    if (val.length === 2) setAnoLocked(true);
                  } else {
                    // If user deletes, unlock
                    if (val.length < 2) {
                      setAnoLocked(false);
                      setAnoInput(val);
                    }
                  }
                }}
                inputProps={{ maxLength: anoLocked ? 5 : 2 }}
                fullWidth
                placeholder="25"
                sx={{ mt: 2 }}
                onFocus={() => { if (anoLocked) setAnoLocked(false); }}
              />
              <TextField
                label="Nome do Jogador (Opcional)"
                fullWidth
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                sx={{ mt: 2 }}
              />
              <TextField
                label="Número (Opcional)"
                fullWidth
                value={playerNumber}
                onChange={e => setPlayerNumber(e.target.value)}
                sx={{ mt: 2 }}
              />
              <Button variant="outlined" component="label" sx={{ mt: 2 }}>
                Adicionar Patch
                <Box
                  component="input"
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handlePatchImagesChange}
                />
              </Button>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {patchImages.map((img, idx) => (
                  <Box key={idx} sx={{ position: 'relative', display: 'inline-block' }}>
                    <img src={img} alt={`patch ${idx + 1}`} style={{ height: 40, border: '1px solid #ccc', borderRadius: 4 }} />
                    <Button size="small" color="error" sx={{ position: 'absolute', top: 0, right: 0, minWidth: 0, p: 0.5 }} onClick={() => handleRemovePatchImage(idx)}>
                      X
                    </Button>
                  </Box>
                ))}
              </Box>
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