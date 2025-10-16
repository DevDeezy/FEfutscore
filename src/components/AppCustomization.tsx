import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  TextField,
  InputAdornment,
  Slider,
} from '@mui/material';
import { CloudUpload, Image, Business, Palette, Navigation, Copyright } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { updateAppSettings } from '../store/slices/appSettingsSlice';

interface AppSettings {
  logo?: string;
  backgroundImage?: string;
  logoHeight?: number;
  backgroundOpacity?: number;
  navbarColor?: string;
  navbarTextColor?: string;
  footerColor?: string;
  footerTextColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

const AppCustomization: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { appSettings, loading, error } = useSelector((state: RootState) => state.appSettings);
  
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [backgroundDialogOpen, setBackgroundDialogOpen] = useState(false);
  const [colorsDialogOpen, setColorsDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');
  const [logoHeight, setLogoHeight] = useState<number>(40);
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.1);
  
  // Color states
  const [navbarColor, setNavbarColor] = useState<string>('#1976d2');
  const [navbarTextColor, setNavbarTextColor] = useState<string>('#ffffff');
  const [footerColor, setFooterColor] = useState<string>('#f5f5f5');
  const [footerTextColor, setFooterTextColor] = useState<string>('#666666');
  const [primaryColor, setPrimaryColor] = useState<string>('#1976d2');
  const [secondaryColor, setSecondaryColor] = useState<string>('#dc004e');

  useEffect(() => {
    if (appSettings) {
      setLogoPreview(appSettings.logo || '');
      setBackgroundPreview(appSettings.backgroundImage || '');
      setLogoHeight(appSettings.logoHeight || 40);
      setBackgroundOpacity(appSettings.backgroundOpacity || 0.1);
      
      // Color settings
      setNavbarColor(appSettings.navbarColor || '#1976d2');
      setNavbarTextColor(appSettings.navbarTextColor || '#ffffff');
      setFooterColor(appSettings.footerColor || '#f5f5f5');
      setFooterTextColor(appSettings.footerTextColor || '#666666');
      setPrimaryColor(appSettings.primaryColor || '#1976d2');
      setSecondaryColor(appSettings.secondaryColor || '#dc004e');
    }
  }, [appSettings]);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackgroundFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async () => {
    if (!logoFile) return;

    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      formData.append('logoHeight', logoHeight.toString());

      await dispatch(updateAppSettings({
        logo: logoPreview,
        logoHeight,
      })).unwrap();

      setLogoDialogOpen(false);
      setLogoFile(null);
    } catch (err) {
      console.error('Erro ao atualizar logo:', err);
    }
  };

  const handleSaveBackground = async () => {
    if (!backgroundFile) return;

    try {
      await dispatch(updateAppSettings({
        backgroundImage: backgroundPreview,
        backgroundOpacity,
      })).unwrap();

      setBackgroundDialogOpen(false);
      setBackgroundFile(null);
    } catch (err) {
      console.error('Erro ao atualizar background:', err);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await dispatch(updateAppSettings({
        logo: '',
        logoHeight: 40,
      })).unwrap();
      setLogoPreview('');
    } catch (err) {
      console.error('Erro ao remover logo:', err);
    }
  };

  const handleRemoveBackground = async () => {
    try {
      await dispatch(updateAppSettings({
        backgroundImage: '',
        backgroundOpacity: 0.1,
      })).unwrap();
      setBackgroundPreview('');
    } catch (err) {
      console.error('Erro ao remover background:', err);
    }
  };

  const handleSaveColors = async () => {
    try {
      await dispatch(updateAppSettings({
        navbarColor,
        navbarTextColor,
        footerColor,
        footerTextColor,
        primaryColor,
        secondaryColor,
      })).unwrap();

      setColorsDialogOpen(false);
    } catch (err) {
      console.error('Erro ao atualizar cores:', err);
    }
  };

  const handleResetColors = async () => {
    const defaultColors = {
      navbarColor: '#1976d2',
      navbarTextColor: '#ffffff',
      footerColor: '#f5f5f5',
      footerTextColor: '#666666',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
    };

    setNavbarColor(defaultColors.navbarColor);
    setNavbarTextColor(defaultColors.navbarTextColor);
    setFooterColor(defaultColors.footerColor);
    setFooterTextColor(defaultColors.footerTextColor);
    setPrimaryColor(defaultColors.primaryColor);
    setSecondaryColor(defaultColors.secondaryColor);

    await dispatch(updateAppSettings(defaultColors)).unwrap();
  };

  if (loading && !appSettings) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Personalização da Aplicação
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Personalize o visual da aplicação alterando o logo, imagem de fundo e cores dos elementos da interface.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Logo Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Business sx={{ mr: 1 }} />
                <Typography variant="h6">Logo da Aplicação</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                O logo aparece na barra de navegação no lugar de "FutScore".
              </Typography>

              {logoPreview && (
                <Box sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="body2" gutterBottom>Pré-visualização:</Typography>
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    style={{ 
                      maxHeight: `${logoHeight}px`, 
                      maxWidth: '200px',
                      objectFit: 'contain'
                    }} 
                  />
                </Box>
              )}

              <Typography variant="body2" gutterBottom>
                Altura do Logo: {logoHeight}px
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setLogoDialogOpen(true)}
              >
                {logoPreview ? 'Alterar Logo' : 'Adicionar Logo'}
              </Button>
              {logoPreview && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRemoveLogo}
                >
                  Remover
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>

        {/* Background Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Image sx={{ mr: 1 }} />
                <Typography variant="h6">Imagem de Fundo</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                A imagem de fundo é aplicada a toda a aplicação com opacidade configurável.
              </Typography>

              {backgroundPreview && (
                <Box sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="body2" gutterBottom>Pré-visualização:</Typography>
                  <Box
                    sx={{
                      height: 100,
                      backgroundImage: `url(${backgroundPreview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 1,
                      opacity: backgroundOpacity,
                      border: '1px solid #ddd'
                    }}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Opacidade: {Math.round(backgroundOpacity * 100)}%
                  </Typography>
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setBackgroundDialogOpen(true)}
              >
                {backgroundPreview ? 'Alterar Fundo' : 'Adicionar Fundo'}
              </Button>
              {backgroundPreview && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRemoveBackground}
                >
                  Remover
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>

        {/* Colors Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Palette sx={{ mr: 1 }} />
                <Typography variant="h6">Cores da Interface</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Personalize as cores da barra de navegação, footer e elementos principais da aplicação.
              </Typography>

              <Grid container spacing={2}>
                {/* Current Colors Preview */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Pré-visualização das Cores:
                  </Typography>
                  
                  {/* Navbar Preview */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>Navbar:</Typography>
                    <Box
                      sx={{
                        height: 40,
                        backgroundColor: navbarColor,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        mb: 1
                      }}
                    >
                      <Typography variant="body2" sx={{ color: navbarTextColor }}>
                        FutScore
                      </Typography>
                    </Box>
                  </Box>

                  {/* Footer Preview */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>Footer:</Typography>
                    <Box
                      sx={{
                        height: 30,
                        backgroundColor: footerColor,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        mb: 1
                      }}
                    >
                      <Typography variant="caption" sx={{ color: footerTextColor }}>
                        ©2025 FutScore. Todos os direitos reservados.
                      </Typography>
                    </Box>
                  </Box>

                  {/* Primary & Secondary Colors */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>Cores Principais:</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: primaryColor,
                          borderRadius: 1,
                          border: '1px solid #ccc'
                        }}
                      />
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: secondaryColor,
                          borderRadius: 1,
                          border: '1px solid #ccc'
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>

                {/* Color Values Display */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cores Atuais:
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Navbar: <Box component="span" sx={{ color: navbarColor, fontWeight: 'bold' }}>{navbarColor}</Box>
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Texto Navbar: <Box component="span" sx={{ color: navbarTextColor, fontWeight: 'bold' }}>{navbarTextColor}</Box>
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Footer: <Box component="span" sx={{ color: footerColor, fontWeight: 'bold' }}>{footerColor}</Box>
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Texto Footer: <Box component="span" sx={{ color: footerTextColor, fontWeight: 'bold' }}>{footerTextColor}</Box>
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Primária: <Box component="span" sx={{ color: primaryColor, fontWeight: 'bold' }}>{primaryColor}</Box>
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Secundária: <Box component="span" sx={{ color: secondaryColor, fontWeight: 'bold' }}>{secondaryColor}</Box>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<Palette />}
                onClick={() => setColorsDialogOpen(true)}
              >
                Personalizar Cores
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleResetColors}
              >
                Restaurar Padrões
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Logo Dialog */}
      <Dialog open={logoDialogOpen} onClose={() => setLogoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configurar Logo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="logo-upload"
                type="file"
                onChange={handleLogoFileChange}
              />
              <label htmlFor="logo-upload">
                <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth>
                  Selecionar Imagem do Logo
                </Button>
              </label>
            </Grid>
            
            {logoPreview && (
              <>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Pré-visualização:
                  </Typography>
                  <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, textAlign: 'center' }}>
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      style={{ 
                        maxHeight: `${logoHeight}px`, 
                        maxWidth: '200px',
                        objectFit: 'contain'
                      }} 
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Altura do Logo (px):
                  </Typography>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={logoHeight}
                    onChange={(e) => setLogoHeight(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <Typography variant="caption" display="block" textAlign="center">
                    {logoHeight}px
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleSaveLogo} 
            variant="contained"
            disabled={!logoFile}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Background Dialog */}
      <Dialog open={backgroundDialogOpen} onClose={() => setBackgroundDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configurar Imagem de Fundo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="background-upload"
                type="file"
                onChange={handleBackgroundFileChange}
              />
              <label htmlFor="background-upload">
                <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth>
                  Selecionar Imagem de Fundo
                </Button>
              </label>
            </Grid>
            
            {backgroundPreview && (
              <>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Pré-visualização:
                  </Typography>
                  <Box
                    sx={{
                      height: 150,
                      backgroundImage: `url(${backgroundPreview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 1,
                      opacity: backgroundOpacity,
                      border: '1px solid #ddd'
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Opacidade:
                  </Typography>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.05"
                    value={backgroundOpacity}
                    onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <Typography variant="caption" display="block" textAlign="center">
                    {Math.round(backgroundOpacity * 100)}%
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackgroundDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleSaveBackground} 
            variant="contained"
            disabled={!backgroundFile}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Colors Dialog */}
      <Dialog open={colorsDialogOpen} onClose={() => setColorsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Personalizar Cores da Interface</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Navbar Colors */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Navigation sx={{ mr: 1 }} />
                Cores da Barra de Navegação
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cor de Fundo da Navbar"
                type="color"
                value={navbarColor}
                onChange={(e) => setNavbarColor(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: navbarColor,
                          borderRadius: 1,
                          border: '1px solid #ccc',
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cor do Texto da Navbar"
                type="color"
                value={navbarTextColor}
                onChange={(e) => setNavbarTextColor(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: navbarTextColor,
                          borderRadius: 1,
                          border: '1px solid #ccc',
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Footer Colors */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Copyright sx={{ mr: 1 }} />
                Cores do Footer
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cor de Fundo do Footer"
                type="color"
                value={footerColor}
                onChange={(e) => setFooterColor(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: footerColor,
                          borderRadius: 1,
                          border: '1px solid #ccc',
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cor do Texto do Footer"
                type="color"
                value={footerTextColor}
                onChange={(e) => setFooterTextColor(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: footerTextColor,
                          borderRadius: 1,
                          border: '1px solid #ccc',
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Primary & Secondary Colors */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Palette sx={{ mr: 1 }} />
                Cores Principais
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cor Primária"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                margin="normal"
                helperText="Usada em botões principais e elementos destacados"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: primaryColor,
                          borderRadius: 1,
                          border: '1px solid #ccc',
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cor Secundária"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                margin="normal"
                helperText="Usada em botões secundários e elementos de apoio"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: secondaryColor,
                          borderRadius: 1,
                          border: '1px solid #ccc',
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Live Preview */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Pré-visualização em Tempo Real:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>Navbar:</Typography>
                  <Box
                    sx={{
                      height: 50,
                      backgroundColor: navbarColor,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      mb: 2
                    }}
                  >
                    <Typography variant="body1" sx={{ color: navbarTextColor, fontWeight: 'bold' }}>
                      FutScore
                    </Typography>
                    <Typography variant="body2" sx={{ color: navbarTextColor, ml: 'auto', opacity: 0.8 }}>
                      Menu
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>Footer:</Typography>
                  <Box
                    sx={{
                      height: 40,
                      backgroundColor: footerColor,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      mb: 2
                    }}
                  >
                    <Typography variant="caption" sx={{ color: footerTextColor }}>
                      ©2025 FutScore. Todos os direitos reservados.
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>Botões de Exemplo:</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      sx={{ backgroundColor: primaryColor, '&:hover': { backgroundColor: primaryColor, opacity: 0.9 } }}
                    >
                      Botão Primário
                    </Button>
                    <Button 
                      variant="contained" 
                      sx={{ backgroundColor: secondaryColor, '&:hover': { backgroundColor: secondaryColor, opacity: 0.9 } }}
                    >
                      Botão Secundário
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorsDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveColors} 
            variant="contained"
          >
            Guardar Cores
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppCustomization;
