import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchAppSettings } from '../store/slices/appSettingsSlice';
import { CircularProgress, Box } from '@mui/material';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { appSettings, loading, error } = useSelector((state: RootState) => state.appSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Only fetch settings if we don't have them yet
        if (!appSettings && !loading) {
          await dispatch(fetchAppSettings()).unwrap();
        }
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize app settings:', err);
        // Still allow app to continue with default settings
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch, appSettings, loading]);

  useEffect(() => {
    if (appSettings) {
      // Apply global CSS custom properties
      if (appSettings.backgroundImage) {
        document.body.style.backgroundImage = `url(${appSettings.backgroundImage})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
        
        // Create overlay for opacity
        let overlay = document.getElementById('app-background-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'app-background-overlay';
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
          overlay.style.zIndex = '-1';
          overlay.style.pointerEvents = 'none';
          document.body.appendChild(overlay);
        }
        
        // Update overlay opacity
        const opacity = 1 - (appSettings.backgroundOpacity || 0.1);
        overlay.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
      } else {
        // Remove background
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
        document.body.style.backgroundAttachment = '';
        
        // Remove overlay
        const overlay = document.getElementById('app-background-overlay');
        if (overlay) {
          overlay.remove();
        }
      }
    }
  }, [appSettings]);

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        flexDirection="column"
      >
        <CircularProgress size={60} />
        <Box sx={{ mt: 2, fontSize: '14px', color: 'text.secondary' }}>
          A carregar configurações da aplicação...
        </Box>
      </Box>
    );
  }

  // Show error state if there's a critical error
  if (error && !appSettings) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        flexDirection="column"
        sx={{ p: 3 }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Box sx={{ fontSize: '18px', color: 'error.main', mb: 2 }}>
            ⚠️ Erro ao carregar configurações
          </Box>
          <Box sx={{ fontSize: '14px', color: 'text.secondary', mb: 3 }}>
            {error}
          </Box>
          <Box sx={{ fontSize: '12px', color: 'text.secondary' }}>
            A aplicação continuará com configurações padrão.
          </Box>
        </Box>
      </Box>
    );
  }

  // Render children once initialized
  return <>{children}</>;
};

export default AppInitializer;
