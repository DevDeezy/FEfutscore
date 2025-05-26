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
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, fetchOrders } from '../store/slices/orderSlice';
import { OrderItem } from '../types';
import { AppDispatch, RootState } from '../store';

const OrderForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { orders } = useSelector((state: RootState) => state.order);
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentItem, setCurrentItem] = useState<OrderItem>({
    productType: 'tshirt',
    imageFront: '',
    imageBack: '',
    size: 'S',
    playerName: '',
  });
  const [items, setItems] = useState<OrderItem[]>([]);
  const imageFrontInputRef = useRef<HTMLInputElement>(null);
  const imageBackInputRef = useRef<HTMLInputElement>(null);
  const [address, setAddress] = useState({
    nome: '',
    morada: '',
    cidade: '',
    distrito: '',
    pais: 'Portugal',
    codigoPostal: '',
    telemovel: '',
  });

  const tshirtSizes = ['S', 'M', 'L', 'XL'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageFront' | 'imageBack') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentItem((prev) => ({ ...prev, [field]: reader.result as string }));
        if (field === 'imageFront' && imageFrontInputRef.current) {
          imageFrontInputRef.current.value = '';
        }
        if (field === 'imageBack' && imageBackInputRef.current) {
          imageBackInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (currentItem.imageFront && currentItem.size) {
      setItems([...items, currentItem]);
      setCurrentItem({
        productType: 'tshirt',
        imageFront: '',
        imageBack: '',
        size: 'M',
        playerName: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allFieldsFilled = Object.values(address).every((v) => v.trim() !== '');
    if (items.length > 0 && allFieldsFilled && user) {
      await dispatch(createOrder({ userId: user.id, items, address }));
      navigate('/');
    }
  };

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Criar Nova Encomenda
        </Typography>
        <form onSubmit={handleSubmit}>
          
          <Grid container spacing={3}>
            {/* Image pickers */}
            {currentItem.productType === 'tshirt' ? (
              <>
                <Grid item xs={12} sm={6}>
                  <Button variant="contained" component="label" fullWidth>
                    Carregar Imagem da Camisola
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'imageFront')}
                      ref={imageFrontInputRef}
                    />
                  </Button>
                  {currentItem.imageFront && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img
                        src={currentItem.imageFront}
                        alt="Pré-visualização Frente"
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="contained" component="label" fullWidth>
                    Carregar Imagem do Logo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'imageBack')}
                      ref={imageBackInputRef}
                    />
                  </Button>
                  {currentItem.imageBack && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img
                        src={currentItem.imageBack}
                        alt="Pré-visualização Verso"
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                    </Box>
                  )}
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <Button variant="contained" component="label" fullWidth>
                  Carregar Imagem dos Ténis
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'imageFront')}
                    ref={imageFrontInputRef}
                  />
                </Button>
                {currentItem.imageFront && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img
                      src={currentItem.imageFront}
                      alt="Pré-visualização"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                  </Box>
                )}
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Produto</InputLabel>
                <Select
                  value={currentItem.productType}
                  label="Produto"
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      productType: e.target.value as OrderItem['productType'],
                      size: e.target.value === 'shoes' ? '42' : 'S',
                    })
                  }
                >
                  <MenuItem value="tshirt">Camisola</MenuItem>
                  <MenuItem value="shoes">Ténis</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              {currentItem.productType === 'shoes' ? (
                <TextField
                  fullWidth
                  type="number"
                  label="Tamanho"
                  inputProps={{ min: 30, max: 50 }}
                  value={currentItem.size}
                  onChange={e => setCurrentItem({ ...currentItem, size: e.target.value as OrderItem['size'] })}
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
                        size: e.target.value as OrderItem['size'],
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
            {currentItem.productType === 'tshirt' && (
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Nome do Jogador"
                value={currentItem.playerName}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, playerName: e.target.value })
                }
              />
            </Grid>
            )}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddItem}
                disabled={!currentItem.imageFront || !currentItem.size}
              >
                Adicionar Item
              </Button>
            </Grid>
          </Grid>

          {items.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Itens Adicionados ({items.length})
              </Typography>
              <Grid container spacing={2}>
                {items.map((item, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Paper sx={{ p: 2 }}>
                      <img
                        src={item.imageFront}
                        alt={`Item ${index + 1} Frente`}
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      />
                      {item.productType === 'tshirt' && item.imageBack && (
                        <img
                          src={item.imageBack}
                          alt={`Item ${index + 1} Verso`}
                          style={{ width: '100%', height: '150px', objectFit: 'cover', marginTop: 8 }}
                        />
                      )}
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Produto: {item.productType === 'tshirt' ? 'Camisola' : 'Ténis'}
                      </Typography>
                      <Typography variant="body2">
                        Tamanho: {item.size}
                      </Typography>
                      {item.playerName && (
                        <Typography variant="body2">
                          Nome do Jogador: {item.playerName}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Address fields */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Dados de Envio</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Nome" fullWidth required value={address.nome} onChange={e => setAddress({ ...address, nome: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Telemóvel" fullWidth required value={address.telemovel} onChange={e => setAddress({ ...address, telemovel: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Morada" fullWidth required value={address.morada} onChange={e => setAddress({ ...address, morada: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Cidade" fullWidth required value={address.cidade} onChange={e => setAddress({ ...address, cidade: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Distrito" fullWidth required value={address.distrito} onChange={e => setAddress({ ...address, distrito: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Código-Postal" fullWidth required value={address.codigoPostal} onChange={e => setAddress({ ...address, codigoPostal: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="País" fullWidth required value={address.pais} onChange={e => setAddress({ ...address, pais: e.target.value })} />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={items.length === 0 || Object.values(address).some((v) => v.trim() === '')}
            >
              Submeter Encomenda
            </Button>
          </Box>
        </form>
      </Paper>
      {/* Previous Orders Grid */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>As Minhas Encomendas</Typography>
        <Grid container spacing={2}>
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <Grid item xs={12} sm={6} md={4} key={order._id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado: {order.status}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data: {new Date(order.created_at).toLocaleDateString()}
                  </Typography>
                  {order.items.map((item, idx) => (
                    <Box key={idx} sx={{ mt: 1 }}>
                      <img
                        src={item.imageFront}
                        alt={`Item ${idx + 1} Frente`}
                        style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                      />
                      {item.productType === 'tshirt' && item.imageBack && (
                        <img
                          src={item.imageBack}
                          alt={`Item ${idx + 1} Verso`}
                          style={{ width: '100%', height: '100px', objectFit: 'cover', marginTop: 4 }}
                        />
                      )}
                      <Typography variant="body2">
                        Produto: {item.productType === 'tshirt' ? 'Camisola' : 'Ténis'}
                      </Typography>
                      <Typography variant="body2">
                        Tamanho: {item.size}
                      </Typography>
                      {item.playerName && (
                        <Typography variant="body2">
                          Nome do Jogador: {item.playerName}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Paper>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography color="text.secondary">Ainda não tem encomendas.</Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default OrderForm; 