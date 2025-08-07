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
  Checkbox,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { OrderItem } from '../types';
import { AppDispatch, RootState } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import PreviousOrders from '../components/PreviousOrders';
import DragDropZone from '../components/DragDropZone';

interface ShirtType {
  id: number;
  name: string;
  price: number;
}

const OrderForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const sexoOptions = ['Neutro', 'Masculino', 'Feminino'];
  const anoOptions = ['21/22', '23/24', '24/25', '25/26'];
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
    sexo: 'Neutro',
    ano: '25/26',
    numero: '',
    patch_images: [],
    anuncios: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [shirtTypes, setShirtTypes] = useState<ShirtType[]>([]);
  const [shirtTypesLoading, setShirtTypesLoading] = useState(false);
  const [shirtTypesError, setShirtTypesError] = useState<string | null>(null);
  const [anoInput, setAnoInput] = useState('');
  const getFormattedAno = (input: string) => {
    if (!/^[0-9]{2}$/.test(input)) return '';
    const first = input;
    let second = (parseInt(first, 10) + 1).toString().padStart(2, '0');
    if (first === '99') second = '00';
    return `${first}/${second}`;
  };

  const handleImageChange = (file: File, side: 'front' | 'back') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === 'front') {
        setCurrentItem({ ...currentItem, image_front: reader.result as string });
      } else {
        setCurrentItem({ ...currentItem, image_back: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePatchImagesChange = (files: FileList) => {
    const readers: Promise<string>[] = Array.from(files).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(images => {
      setCurrentItem(prev => ({
        ...prev,
        patch_images: [...(prev.patch_images || []), ...images],
      }));
    });
  };

  const handleRemovePatchImage = (idx: number) => {
    setCurrentItem(prev => ({
      ...prev,
      patch_images: (prev.patch_images || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Precisa de estar autenticado para adicionar ao carrinho.');
      return;
    }
    // Set price for custom t-shirt from selected shirt type
    let itemToAdd = { ...currentItem };
    if (itemToAdd.product_type === 'tshirt' && itemToAdd.shirt_type_id) {
      const selectedType = shirtTypes.find((t) => t.id === itemToAdd.shirt_type_id);
      if (selectedType) {
        itemToAdd.price = selectedType.price;
      }
    }
    dispatch(addToCart(itemToAdd));
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
      sexo: 'Neutro',
      ano: '25/26',
      numero: '',
      patch_images: [],
      anuncios: false,
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
            {/* Carregar Imagem da Frente */}
            <Grid item xs={12}>
              <DragDropZone
                title="Carregar Imagem da Frente"
                subtitle="Escolha uma imagem ou arraste-a para aqui"
                onFileSelect={(file) => handleImageChange(file, 'front')}
                onFileRemove={() => setCurrentItem({ ...currentItem, image_front: '' })}
                currentImage={currentItem.image_front}
                height={150}
              />
            </Grid>
            {/* Carregar Imagem das Costas */}
            <Grid item xs={12}>
              <DragDropZone
                title="Carregar Imagem das Costas"
                subtitle="Escolha uma imagem ou arraste-a para aqui"
                onFileSelect={(file) => handleImageChange(file, 'back')}
                onFileRemove={() => setCurrentItem({ ...currentItem, image_back: '' })}
                currentImage={currentItem.image_back}
                height={150}
              />
            </Grid>
            {/* Ano */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ano"
                value={currentItem.ano}
                onChange={e => {
                  let val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length > 2) val = val.slice(0, 2);
                  let formatted = val;
                  if (val.length === 2) {
                    let second = (parseInt(val, 10) + 1).toString().padStart(2, '0');
                    if (val === '99') second = '00';
                    formatted = `${val}/${second}`;
                  }
                  setCurrentItem({ ...currentItem, ano: formatted });
                }}
                inputProps={{ maxLength: 5 }}
                fullWidth
                placeholder="25/26"
              />
            </Grid>
            {/* Tipo de Camisola */}
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
            {/* Sexo */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Sexo</InputLabel>
                <Select
                  value={currentItem.sexo}
                  label="Sexo"
                  onChange={(e: SelectChangeEvent) => setCurrentItem({ ...currentItem, sexo: e.target.value })}
                >
                  {sexoOptions.map((sexo) => (
                    <MenuItem key={sexo} value={sexo}>{sexo}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Tamanho */}
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
            {/* Quantidade */}
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
            {/* Personalização: Nome e Número */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome do Jogador (Opcional)"
                fullWidth
                value={currentItem.player_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentItem({ ...currentItem, player_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Número (Opcional)"
                fullWidth
                value={currentItem.numero}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentItem({ ...currentItem, numero: e.target.value })}
              />
            </Grid>
            {/* Anúncios */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={!!currentItem.anuncios}
                  onChange={e => setCurrentItem({ ...currentItem, anuncios: e.target.checked })}
                />
                <Typography>Com Anúncios</Typography>
              </Box>
            </Grid>
            {/* Patches */}
            <Grid item xs={12}>
              <DragDropZone
                title="Carregar Imagens do Patch"
                subtitle="Escolha imagens ou arraste-as para aqui"
                onFileSelect={(file) => {
                  const fileList = new DataTransfer();
                  fileList.items.add(file);
                  handlePatchImagesChange(fileList.files);
                }}
                multiple={true}
                height={120}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {(currentItem.patch_images || []).map((img, idx) => (
                  <Box key={idx} sx={{ position: 'relative', display: 'inline-block' }}>
                    <Box component="img" src={img} alt={`patch ${idx + 1}`} sx={{ height: 60, border: '1px solid #ccc', borderRadius: 1 }} />
                    <Button
                      size="small"
                      color="error"
                      sx={{ position: 'absolute', top: 0, right: 0, minWidth: 0, p: 0.5 }}
                      onClick={() => handleRemovePatchImage(idx)}
                    >
                      X
                    </Button>
                  </Box>
                ))}
              </Box>
            </Grid>

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