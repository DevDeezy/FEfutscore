import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  Alert,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import DragDropZone from './DragDropZone';
import axios from 'axios';
import { API_BASE_URL } from '../api';

interface Patch {
  id: number;
  name: string;
  image: string;
  price?: number;
  active: boolean;
}

interface PatchModalProps {
  open: boolean;
  onClose: () => void;
  onAddPatches: (patches: string[]) => void;
  existingPatches: string[];
}

const PatchModal: React.FC<PatchModalProps> = ({
  open,
  onClose,
  onAddPatches,
  existingPatches,
}) => {
  const [selectedPatches, setSelectedPatches] = useState<string[]>([]);
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [customImageError, setCustomImageError] = useState<string | null>(null);
  const [predefinedPatches, setPredefinedPatches] = useState<Patch[]>([]);
  const [patchesLoading, setPatchesLoading] = useState(false);
  const [patchesError, setPatchesError] = useState<string | null>(null);

  // Fetch patches from backend
  useEffect(() => {
    const fetchPatches = async () => {
      setPatchesLoading(true);
      setPatchesError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/.netlify/functions/getPatches`);
        setPredefinedPatches(response.data);
      } catch (err: any) {
        setPatchesError('Erro ao carregar patches');
        console.error('Error fetching patches:', err);
      } finally {
        setPatchesLoading(false);
      }
    };

    if (open) {
      fetchPatches();
    }
  }, [open]);

  const handlePatchToggle = (patchImage: string) => {
    setSelectedPatches(prev => 
      prev.includes(patchImage)
        ? prev.filter(img => img !== patchImage)
        : [...prev, patchImage]
    );
  };

  const handleCustomImageAdd = (file: File) => {
    setCustomImageError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setCustomImages(prev => [...prev, result]);
      } else {
        setCustomImageError('Erro ao processar a imagem');
      }
    };
    reader.onerror = () => setCustomImageError('Erro ao ler o ficheiro');
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomImage = (index: number) => {
    setCustomImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPatches = () => {
    const allPatches = [...selectedPatches, ...customImages];
    onAddPatches(allPatches);
    onClose();
    // Reset state
    setSelectedPatches([]);
    setCustomImages([]);
    setActiveTab(0);
    setCustomImageError(null);
  };

  const handleClose = () => {
    onClose();
    // Reset state
    setSelectedPatches([]);
    setCustomImages([]);
    setActiveTab(0);
    setCustomImageError(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Adicionar Patches
      </DialogTitle>
      <DialogContent>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
          <Tab label="Patches Pré-definidos" />
          <Tab label="Imagens Personalizadas" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selecione os patches pré-definidos que deseja adicionar:
            </Typography>
            
            {patchesLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>A carregar patches...</Typography>
              </Box>
            )}
            
            {patchesError && (
              <Alert severity="error" sx={{ mb: 2 }}>{patchesError}</Alert>
            )}
            
            {!patchesLoading && !patchesError && predefinedPatches.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">Nenhum patch disponível</Typography>
              </Box>
            )}
            
            {!patchesLoading && !patchesError && predefinedPatches.length > 0 && (
              <Grid container spacing={2}>
                {predefinedPatches.map((patch) => (
                <Grid item xs={6} sm={4} md={3} key={patch.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedPatches.includes(patch.image) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      position: 'relative',
                    }}
                    onClick={() => handlePatchToggle(patch.image)}
                  >
                    <CardMedia
                      component="img"
                      height="100"
                      image={patch.image}
                      alt={patch.name}
                      sx={{ objectFit: 'contain', p: 1 }}
                    />
                    <CardContent sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="body2" noWrap>
                        {patch.name}
                      </Typography>
                    </CardContent>
                    {selectedPatches.includes(patch.image) && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: '#1976d2',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Adicione as suas próprias imagens de patches:
            </Typography>
            
            <DragDropZone
              title="Carregar Imagens do Patch"
              subtitle="Escolha imagens ou arraste-as para aqui"
              onFileSelect={handleCustomImageAdd}
              multiple={true}
              height={120}
            />
            
            {customImageError && (
              <Alert severity="error" sx={{ mt: 2 }}>{customImageError}</Alert>
            )}
            
            {customImages.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Imagens adicionadas:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {customImages.map((img, idx) => (
                    <Box key={idx} sx={{ position: 'relative', display: 'inline-block' }}>
                      <Box 
                        component="img" 
                        src={img} 
                        alt={`custom patch ${idx + 1}`} 
                        sx={{ height: 60, border: '1px solid #ccc', borderRadius: 1 }} 
                      />
                      <IconButton
                        size="small"
                        color="error"
                        sx={{ position: 'absolute', top: 0, right: 0, minWidth: 0, p: 0.5 }}
                        onClick={() => handleRemoveCustomImage(idx)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button 
          onClick={handleAddPatches} 
          variant="contained"
          disabled={selectedPatches.length === 0 && customImages.length === 0}
        >
          Adicionar Patches ({selectedPatches.length + customImages.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatchModal; 