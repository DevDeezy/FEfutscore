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
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { addToCart } from '../store/slices/cartSlice';
import { OrderItem } from '../types';
import Checkbox from '@mui/material/Checkbox';
import FilterSidebar from '../components/FilterSidebar';
import PatchSelection from '../components/PatchSelection';

const Store = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [patchImages, setPatchImages] = useState<string[]>([]);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));



  const handleOpenDialog = (product: any) => {
    setSelectedProduct(product);
    setSize(product.available_sizes[0] || '');
    setPlayerName('');
    setPlayerNumber('');
    setPatchImages([]);
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
      player_name: playerName,
      numero: playerNumber,
      patch_images: patchImages,
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
      // Handle both old format (array) and new paginated format
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts(res.data.products);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const fetchProductTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getProductTypes?asTree=true&limit=1000`);
      // Handle both old format (array) and new paginated format
      if (Array.isArray(res.data)) {
        setProductTypes(res.data);
      } else {
        // Prefer tree if available
        setProductTypes(res.data.tree || res.data.productTypes);
      }
    } catch (err) {
      // Handle error silently for now
    }
  };

  const handleTypeSelectFromTree = (typeId: string) => {
    setSelectedType(typeId);
    fetchProducts(typeId);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" gutterBottom sx={{ m: 0 }}>
          Loja
        </Typography>
        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Procurar produtos..."
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          size="small"
          sx={{ minWidth: 260 }}
        />
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3} lg={3}>
          <FilterSidebar
            productTypes={productTypes}
            selectedType={selectedType}
            onSelectType={handleTypeSelectFromTree}
            onClearAll={() => handleTypeSelectFromTree('')}
          />
        </Grid>
        <Grid item xs={12} md={9} lg={9}>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Grid container spacing={3}>
              {Array.isArray(products) && products
                .filter((product) => {
                  if (!searchQuery.trim()) return true;
                  const query = searchQuery.toLowerCase();
                  const name = `${product.name || ''} ${product.ano || ''}`.toLowerCase();
                  const description = (product.description || '').toLowerCase();
                  const typeName = (product?.productType?.name || '').toLowerCase();
                  return name.includes(query) || description.includes(query) || typeName.includes(query);
                })
                .map((product) => (
                <Grid item key={product.id} xs={12} sm={6} md={4}>
                  <Card>
                    <CardMedia
                      component="img"
                      sx={{
                        height: 300,
                        objectFit: 'contain',
                        backgroundColor: '#f5f5f5',
                        padding: 2,
                      }}
                      image={product.image_url}
                      alt={product.name}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div" noWrap>
                        {product.name}{product.ano ? ` ${product.ano}` : ''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                        {product.description}
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        €{product.price.toFixed(2)}
                      </Typography>
                      <Button variant="contained" sx={{ mt: 1 }} onClick={() => handleOpenDialog(product)}>
                        Adicionar ao Pedido
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
      <Dialog open={openDialog} onClose={handleCloseDialog} fullScreen={fullScreen}>
        <DialogTitle>{selectedProduct?.name}{selectedProduct?.ano ? ` ${selectedProduct.ano}` : ''}</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <>
              <Typography variant="h6">{selectedProduct.name}{selectedProduct.ano ? ` ${selectedProduct.ano}` : ''}</Typography>


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
              <Box sx={{ mt: 2 }}>
                <PatchSelection
                  onPatchesChange={setPatchImages}
                  selectedPatches={patchImages}
                  title="Patches"
                />
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