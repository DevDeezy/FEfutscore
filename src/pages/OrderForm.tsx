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
import PatchModal from '../components/PatchModal';
import { Add as AddIcon } from '@mui/icons-material';



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
    numero: '',
    patch_images: [],
    anuncios: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [patchModalOpen, setPatchModalOpen] = useState(false);


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

  const handleAddPatchesFromModal = (patches: string[]) => {
    setCurrentItem(prev => ({
      ...prev,
      patch_images: [...(prev.patch_images || []), ...patches],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Precisa de estar autenticado para adicionar ao carrinho.');
      return;
    }
    let itemToAdd = { ...currentItem };
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
      numero: '',
      patch_images: [],
      anuncios: false,
    });
    alert('Item adicionado ao carrinho!');
  };



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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="subtitle1">Patches</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setPatchModalOpen(true)}
                >
                  Adicionar Patch
                </Button>
              </Box>
              
              {(currentItem.patch_images || []).length > 0 && (
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
              )}
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth size="large">
                Adicionar ao Carrinho
              </Button>
            </Grid>
          </Grid>
          </Box>
      </Paper>
      
      {/* Patch Modal */}
      <PatchModal
        open={patchModalOpen}
        onClose={() => setPatchModalOpen(false)}
        onAddPatches={handleAddPatchesFromModal}
        existingPatches={currentItem.patch_images || []}
      />
      
      {/* <PreviousOrders /> */}
    </Container>
  );
};

export default OrderForm; 