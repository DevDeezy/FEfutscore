import React, { useState, useRef, useEffect } from 'react';
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
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { OrderItem } from '../types';
import { AppDispatch, RootState } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import PreviousOrders from '../components/PreviousOrders';

interface ShirtType {
  id: number;
  name: string;
  price: number;
}

const OrderForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentItem, setCurrentItem] = useState<OrderItem>({
    id: '',
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
  const [shirtTypes, setShirtTypes] = useState<ShirtType[]>([]);
  const [shirtTypesLoading, setShirtTypesLoading] = useState(false);
  const [shirtTypesError, setShirtTypesError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
    const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setCurrentItem({ ...currentItem, image_front: reader.result as string });
      } else {
          setCurrentItem({ ...currentItem, image_back: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Precisa de estar autenticado para adicionar ao carrinho.');
      return;
    }
      dispatch(addToCart(currentItem));
    // Reset form after submission
      setCurrentItem({
      id: '',
        product_type: 'tshirt',
        image_front: '',
        image_back: '',
      size: 'S',
      quantity: 1,
        player_name: '',
        shirt_type_id: undefined,
        shirt_type_name: '',
      });
    alert('Item adicionado ao carrinho!');
  };

  useEffect(() => {
    const fetchShirtTypes = async () => {
      setShirtTypesLoading(true);
      setShirtTypesError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getShirtTypes`);
        setShirtTypes(res.data);
      } catch (err) {
        setShirtTypesError('Falha ao carregar os tipos de camisola');
      } finally {
        setShirtTypesLoading(false);
      }
    };

    fetchShirtTypes();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Personalizar Encomenda
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Produto</InputLabel>
                <Select
                  value={currentItem.product_type}
                  label="Tipo de Produto"
                  onChange={(e: SelectChangeEvent) => setCurrentItem({ ...currentItem, product_type: e.target.value as 'tshirt' | 'shoes' })}
                >
                  <MenuItem value="tshirt">Camisola</MenuItem>
                  <MenuItem value="shoes">Sapatilhas</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {currentItem.product_type === 'tshirt' && (
              <>
                <Grid item xs={12} sm={6}>
                <TextField
                    label="Nome do Jogador (Opcional)"
                fullWidth
                value={currentItem.player_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentItem({ ...currentItem, player_name: e.target.value })}
              />
            </Grid>
                <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Camisola</InputLabel>
                  <Select
                      value={currentItem.shirt_type_id?.toString() ?? ''}
                    label="Tipo de Camisola"
                      onChange={(e: SelectChangeEvent) => {
                        const selectedId = Number(e.target.value);
                        const selected = shirtTypes.find((t) => t.id === selectedId);
                      setCurrentItem({
                        ...currentItem,
                        shirt_type_id: selected?.id,
                        shirt_type_name: selected?.name,
                      });
                    }}
                    disabled={shirtTypesLoading || shirtTypesError !== null}
                  >
                      {shirtTypesLoading ? (
                        <MenuItem value="">
                          <CircularProgress size={20} />
                        </MenuItem>
                      ) : (
                        shirtTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </MenuItem>
                        ))
                      )}
                  </Select>
                </FormControl>
              </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tamanho</InputLabel>
                <Select
                  value={currentItem.size}
                  label="Tamanho"
                  onChange={(e: SelectChangeEvent) => setCurrentItem({ ...currentItem, size: e.target.value })}
                >
                  <MenuItem value="S">S</MenuItem>
                  <MenuItem value="M">M</MenuItem>
                  <MenuItem value="L">L</MenuItem>
                  <MenuItem value="XL">XL</MenuItem>
                  <MenuItem value="XXL">XXL</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantidade"
                type="number"
                fullWidth
                value={currentItem.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value, 10) })}
                InputProps={{ inputProps: { min: 1 } }}
                  />
            </Grid>
            
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" component="label">
                  Carregar Imagem da Frente
                  <Box
                    component="input"
                    type="file"
                    hidden
                    accept="image/*"
                    ref={imageFrontInputRef}
                    onChange={(e) => handleImageChange(e, 'front')}
                  />
                </Button>
                {currentItem.image_front && <Box component="img" src={currentItem.image_front} alt="preview frente" sx={{ height: 100, marginLeft: 16 }} />}
            </Grid>

            {currentItem.product_type === 'tshirt' && (
                <Grid item xs={12} sm={6}>
                    <Button variant="outlined" component="label">
                        Carregar Imagem de Trás
                        <Box
                            component="input"
                            type="file"
                            hidden
                            accept="image/*"
                            ref={imageBackInputRef}
                            onChange={(e) => handleImageChange(e, 'back')}
                        />
                    </Button>
                    {currentItem.image_back && <Box component="img" src={currentItem.image_back} alt="preview trás" sx={{ height: 100, marginLeft: 16 }} />}
              </Grid>
            )}

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth size="large">
                Adicionar ao Carrinho
              </Button>
            </Grid>
          </Grid>
          </Box>
      </Paper>
      {/* <PreviousOrders /> */}
    </Container>
  );
};

export default OrderForm; 