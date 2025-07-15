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
  useTheme,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { removeFromCart, clearCart, updateCartItem } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';
import { getAddresses } from '../store/slices/addressSlice';
import { AppDispatch } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import AddressManager from '../components/AddressManager';
import Check from '@mui/icons-material/Check';

const initialAddress = {
  nome: '',
  morada: '',
  cidade: '',
  distrito: '',
  pais: 'Portugal',
  codigoPostal: '',
  telemovel: '',
};

const sexoOptions = ['Neutro', 'Masculino', 'Feminino'];
const anoOptions = ['21/22', '23/24', '24/25', '25/26'];

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const { addresses } = useSelector((state: RootState) => state.address);
  const [address, setAddress] = useState(initialAddress);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [addressMode, setAddressMode] = useState<'manual' | 'saved'>('manual');
  const [proofImage, setProofImage] = useState<string>('');
  const [proofReference, setProofReference] = useState<string>('');
  const [proofError, setProofError] = useState<string | null>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);
  const [cartPrice, setCartPrice] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Revolut');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRemoveItem = (index: number) => {
    dispatch(removeFromCart(index));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleAddressModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'manual' | 'saved' | null) => {
    if (newMode !== null) {
      setAddressMode(newMode);
      if (newMode === 'manual') {
        setSelectedAddress(null);
        setAddress(initialAddress);
      } else {
        // Load saved addresses if not already loaded
        if (user && addresses.length === 0) {
          dispatch(getAddresses(user.id));
        }
      }
    }
  };

  const handleSelectAddress = (selectedAddr: any) => {
    setSelectedAddress(selectedAddr);
    setAddress(selectedAddr);
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

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProofReference(e.target.value);
  };

  const proofProvided = !!proofImage || proofReference.trim() !== '';
  const allFieldsFilled = Object.values(address).every((v) => v.trim() !== '');
  const canPlaceOrder = items.length > 0 && allFieldsFilled && proofProvided;

  const getBackendItems = (items: any[]) =>
    items.map((item) =>
      item.product_type === 'tshirt'
        ? { ...item, shirt_type_id: item.shirt_type_id }
        : item
    );

  const handleSubmitOrder = async () => {
    if (canPlaceOrder && user) {
      await dispatch(createOrder({ userId: user.id, items: getBackendItems(items), address: { ...address, proofImage, proofReference }, paymentMethod }));
      dispatch(clearCart());
      setAddress(initialAddress);
      setProofImage('');
      setProofReference('');
      setPaymentMethod('Revolut');
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

  // Fetch addresses on mount if user exists
  useEffect(() => {
    if (user) {
      dispatch(getAddresses(user.id));
    }
  }, [dispatch, user]);

  // Handler to edit/fill the manual form with a saved address (like AddressManager)
  const handleEdit = (addr: any) => {
    setAddress({
      nome: addr.nome || '',
      telemovel: addr.telemovel || '',
      morada: addr.morada || '',
      cidade: addr.cidade || '',
      distrito: addr.distrito || '',
      codigoPostal: addr.codigoPostal || '',
      pais: addr.pais || 'Portugal',
    });
  };

  const handleCartItemFieldChange = (index: number, field: string, value: string) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
    dispatch(updateCartItem({ index, field, value }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Carrinho de Compras
        </Typography>
        {items.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            O seu carrinho está vazio
          </Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              {items.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Paper sx={{ p: 2, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
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
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1">
                          {item.product_type === 'tshirt' ? 'Camisola' : (item.name || 'Produto')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tamanho: {item.size}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantidade: {item.quantity}
                        </Typography>
                        {/* Price per item */}
                        {typeof item.price === 'number' && (
                          <Typography variant="body2" color="text.secondary">
                            Preço unitário: €{item.price.toFixed(2)}
                          </Typography>
                        )}
                        {/* Subtotal for this item */}
                        {typeof item.price === 'number' && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                            Subtotal: €{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        )}
                        {item.player_name && (
                          <Typography variant="body2" color="text.secondary">
                            Nome do Jogador: {item.player_name}
                          </Typography>
                        )}
                        {/* PATCH IMAGES SECTION */}
                        {(item.patch_images ?? []).length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                              Patches:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {(item.patch_images ?? []).map((img: string, idx: number) => (
                                <Box key={idx} sx={{ position: 'relative', display: 'inline-block' }}>
                                  <img src={img} alt={`patch ${idx + 1}`} style={{ height: 40, border: '1px solid #ccc', borderRadius: 4 }} />
                                  <IconButton
                                    size="small"
                                    color="error"
                                    sx={{ position: 'absolute', top: 0, right: 0, minWidth: 0, p: 0.5 }}
                                    onClick={() => {
                                      // Remove patch image from item
                                      const newImages = (item.patch_images ?? []).filter((_: string, i: number) => i !== idx);
                                      handleCartItemFieldChange(index, 'patch_images', newImages as any);
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                        {/* END PATCH IMAGES SECTION */}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Sexo: {item.sexo || 'Neutro'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ano: {item.ano || '21/22'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Número: {item.numero || '-'}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                      sx={{ mt: isMobile ? 2 : 0 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Morada de Entrega
              </Typography>

              {addressMode === 'manual' ? (
                <>
                  {/* List of saved addresses to use for autofill */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Usar uma morada guardada:
                    </Typography>
                    {addresses.length === 0 ? (
                      <Typography variant="body2">Nenhuma morada guardada.</Typography>
                    ) : (
                      <List>
                        {addresses.map((addr: any) => (
                          <Paper key={addr.id} sx={{ mb: 1, p: 1 }}>
                            <ListItem disablePadding>
                              <ListItemText
                                primary={addr.nome}
                                secondary={`${addr.morada}, ${addr.cidade}, ${addr.distrito}, ${addr.codigoPostal}, ${addr.pais} - ${addr.telemovel}`}
                              />
                              <ListItemSecondaryAction>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleEdit(addr)}
                                  startIcon={<Check />}
                                >
                                  Usar
                                </Button>
                              </ListItemSecondaryAction>
                            </ListItem>
                          </Paper>
                        ))}
                      </List>
                    )}
                  </Box>
                  {/* Manual address form */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Nome" name="nome" fullWidth required value={address.nome} onChange={handleAddressChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Telemóvel" name="telemovel" fullWidth required value={address.telemovel} onChange={handleAddressChange} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Morada" name="morada" fullWidth required value={address.morada} onChange={handleAddressChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Cidade" name="cidade" fullWidth required value={address.cidade} onChange={handleAddressChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Distrito" name="distrito" fullWidth required value={address.distrito} onChange={handleAddressChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Código Postal" name="codigoPostal" fullWidth required value={address.codigoPostal} onChange={handleAddressChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="País" name="pais" fullWidth required value={address.pais} onChange={handleAddressChange} />
                    </Grid>
                  </Grid>
                </>
              ) : (
                // In saved mode, just show the list of addresses (no edit, no add, no delete)
                <Box>
                  {addresses.length === 0 ? (
                    <Typography variant="body2">Nenhuma morada guardada.</Typography>
                  ) : (
                    <List>
                      {addresses.map((addr: any) => (
                        <Paper key={addr.id} sx={{ mb: 1, p: 1 }}>
                          <ListItem disablePadding>
                            <ListItemText
                              primary={addr.nome}
                              secondary={`${addr.morada}, ${addr.cidade}, ${addr.distrito}, ${addr.codigoPostal}, ${addr.pais} - ${addr.telemovel}`}
                            />
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  )}
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>Comprovativo de Pagamento</Typography>
              {/* Payment Method Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="payment-method-label">Método de Pagamento</InputLabel>
                <Select
                  labelId="payment-method-label"
                  value={paymentMethod}
                  label="Método de Pagamento"
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="Revolut">Revolut</MenuItem>
                  <MenuItem value="PayPal">PayPal</MenuItem>
                  <MenuItem value="Bank Transfer">Transferência Bancária</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                component="label"
                sx={{ mb: 2 }}
              >
                Carregar Comprovativo
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
                    alt="Comprovativo de Pagamento"
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain', border: '1px solid #eee', borderRadius: 4 }}
                  />
                </Box>
              )}
              <TextField
                label="Referência do Comprovativo"
                fullWidth
                value={proofReference}
                onChange={handleReferenceChange}
                sx={{ mt: 2 }}
                placeholder="Insira a referência do comprovativo se não anexar imagem"
              />
            </Box>
            {cartPrice !== null && (
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Preço Total: €{cartPrice.toFixed(2)}
              </Typography>
            )}
            <Box sx={{ mt: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/store')}
                fullWidth={isMobile}
              >
                Continuar a Comprar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitOrder}
                disabled={!canPlaceOrder}
                fullWidth={isMobile}
              >
                Finalizar Encomenda
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Cart; 