import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Alert,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { OrderItem } from '../types';
import { AppDispatch, RootState } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import PreviousOrders from '../components/PreviousOrders';


const OrderForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentItem, setCurrentItem] = useState<OrderItem>({
    product_type: 'tshirt',
    image_front: '',
    image_back: '',
    size: 'S',
    quantity: 1,
    player_name: '',
    shirt_type_id: undefined,
    shirt_type_name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const imageFrontInputRef = useRef<HTMLInputElement>(null);
  const imageBackInputRef = useRef<HTMLInputElement>(null);
  const [shirtTypes, setShirtTypes] = useState<{ id: number; name: string; price: number }[]>([]);
  const [shirtTypesLoading, setShirtTypesLoading] = useState(false);
  const [shirtTypesError, setShirtTypesError] = useState<string | null>(null);

  const tshirtSizes = ['S', 'M', 'L', 'XL'];

  const validateImage = (file: File): boolean => {
    console.log('Validating file:', file.name, file.type, file.size);
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter menos de 5MB');
      return false;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor, carregue um ficheiro de imagem');
      return false;
    }

    return true;
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'image_front' | 'image_back'
  ) => {
    console.log('Image change event triggered for:', field);
    setError(null);
    
    const file = e.target.files?.[0];
    console.log('Selected file:', file);
    
    if (!file) {
      console.log('No file selected');
      if (e.target) e.target.value = '';
      return;
    }

    if (!validateImage(file)) {
      console.log('File validation failed');
      if (field === 'image_front' && imageFrontInputRef.current) {
        imageFrontInputRef.current.value = '';
      }
      if (field === 'image_back' && imageBackInputRef.current) {
        imageBackInputRef.current.value = '';
      }
      if (e.target) e.target.value = '';
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      console.log('FileReader onload triggered');
      const result = event.target?.result;
      if (typeof result === 'string') {
        console.log('Setting image data for:', field);
        setCurrentItem((prev) => ({ ...prev, [field]: result }));
        if (e.target) e.target.value = '';
      } else {
        console.error('FileReader result is not a string');
        setError('Erro ao processar a imagem');
        if (e.target) e.target.value = '';
      }
    };

    reader.onerror = (event) => {
      console.error('FileReader error:', event);
      setError('Erro ao ler o ficheiro de imagem');
      if (field === 'image_front' && imageFrontInputRef.current) {
        imageFrontInputRef.current.value = '';
      }
      if (field === 'image_back' && imageBackInputRef.current) {
        imageBackInputRef.current.value = '';
      }
      if (e.target) e.target.value = '';
    };

    try {
      console.log('Starting to read file');
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error in readAsDataURL:', err);
      setError('Erro ao processar a imagem');
      if (e.target) e.target.value = '';
    }
  };

  const handleAddToCart = () => {
    if (currentItem.image_front && currentItem.size && (currentItem.product_type !== 'tshirt' || currentItem.shirt_type_id)) {
      dispatch(addToCart(currentItem));
      setCurrentItem({
        product_type: 'tshirt',
        image_front: '',
        image_back: '',
        size: 'M',
        quantity: 1,
        player_name: '',
        shirt_type_id: undefined,
        shirt_type_name: '',
      });
      navigate('/cart');
    }
  };

  useEffect(() => {
    const fetchShirtTypes = async () => {
      setShirtTypesLoading(true);
      setShirtTypesError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getShirtTypes`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setShirtTypes(res.data);
      } catch (err) {
        setShirtTypesError('Failed to fetch shirt types');
        setShirtTypes([]);
      }
      setShirtTypesLoading(false);
    };
    fetchShirtTypes();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Criar Novo Pedido
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error === 'A imagem deve ter menos de 5MB' ? 'A imagem deve ter menos de 5MB' : error === 'Por favor, carregue um ficheiro de imagem' ? 'Por favor, carregue um ficheiro de imagem' : error === 'Erro ao processar a imagem' ? 'Erro ao processar a imagem' : error === 'Erro ao ler o ficheiro de imagem' ? 'Erro ao ler o ficheiro de imagem' : error}
          </Alert>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleAddToCart(); }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Produto</InputLabel>
                <Select
                  value={currentItem.product_type}
                  label="Produto"
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      product_type: e.target.value as string,
                      size: e.target.value === 'shoes' ? '42' : 'S',
                    })
                  }
                >
                  <MenuItem value="tshirt">Camisola</MenuItem>
                  <MenuItem value="shoes">Sapatilhas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              {currentItem.product_type === 'shoes' ? (
                <TextField
                  fullWidth
                  type="number"
                  label="Tamanho"
                  inputProps={{ min: 30, max: 50 }}
                  value={currentItem.size}
                  onChange={e => setCurrentItem({ ...currentItem, size: e.target.value as string })}
                  required
                />
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Tamanho</InputLabel>
                  <Select
                    value={currentItem.size}
                    label="Tamanho"
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        size: e.target.value as string,
                      })
                    }
                  >
                    {tshirtSizes.map((size) => (
                      <MenuItem key={size} value={size}>{size}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Nome do Jogador"
                value={currentItem.player_name}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    player_name: e.target.value,
                  })
                }
              />
            </Grid>
            {currentItem.product_type === 'tshirt' && (
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Camisola</InputLabel>
                  <Select
                    value={currentItem.shirt_type_id ?? ''}
                    label="Tipo de Camisola"
                    onChange={(e) => {
                      const selected = shirtTypes.find((t) => t.id === Number(e.target.value));
                      setCurrentItem({
                        ...currentItem,
                        shirt_type_id: selected?.id,
                        shirt_type_name: selected?.name,
                      });
                    }}
                    disabled={shirtTypesLoading || shirtTypesError !== null}
                  >
                    {shirtTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                component="label"
                fullWidth
              >
                Carregar Imagem Frontal
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/gif"
                  onChange={(e) => handleImageChange(e, 'image_front')}
                />
              </Button>
              {currentItem.image_front && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={currentItem.image_front}
                    alt="Frente"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  />
                </Box>
              )}
            </Grid>
            {currentItem.product_type === 'tshirt' && (
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                >
                  Carregar Imagem Traseira
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/gif"
                    onChange={(e) => handleImageChange(e, 'image_back')}
                  />
                </Button>
                {currentItem.image_back && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img
                      src={currentItem.image_back}
                      alt="Costas"
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                    />
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!currentItem.image_front || !currentItem.size}
            >
              Adicionar ao Carrinho
            </Button>
          </Box>
        </form>
      </Paper>
      <PreviousOrders />
    </Container>
  );
};

export default OrderForm; 