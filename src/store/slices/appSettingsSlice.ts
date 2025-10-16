import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AppSettings } from '../../types';

interface AppSettingsSliceState {
  appSettings: AppSettings | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppSettingsSliceState = {
  appSettings: null,
  loading: false,
  error: null,
};

export const fetchAppSettings = createAsyncThunk(
  'appSettings/fetchAppSettings',
  async () => {
    // For now, we'll use localStorage to persist settings
    // In a real app, this would be an API call
    const settings = localStorage.getItem('appSettings');
    return settings ? JSON.parse(settings) : {
      logo: '',
      backgroundImage: '',
      logoHeight: 40,
      backgroundOpacity: 0.1,
      navbarColor: '#1976d2',
      navbarTextColor: '#ffffff',
      footerColor: '#f5f5f5',
      footerTextColor: '#666666',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e'
    };
  }
);

export const updateAppSettings = createAsyncThunk(
  'appSettings/updateAppSettings',
  async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    // For now, we'll use localStorage to persist settings
    // In a real app, this would be an API call
    const currentSettings = localStorage.getItem('appSettings');
    const existingSettings = currentSettings ? JSON.parse(currentSettings) : {};
    const newSettings = { ...existingSettings, ...settings };
    
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    
    // Also update CSS custom properties for immediate effect
    if (newSettings.logo) {
      document.documentElement.style.setProperty('--app-logo', `url(${newSettings.logo})`);
      document.documentElement.style.setProperty('--app-logo-height', `${newSettings.logoHeight || 40}px`);
    } else {
      document.documentElement.style.removeProperty('--app-logo');
      document.documentElement.style.removeProperty('--app-logo-height');
    }
    
    if (newSettings.backgroundImage) {
      document.documentElement.style.setProperty('--app-background', `url(${newSettings.backgroundImage})`);
      document.documentElement.style.setProperty('--app-background-opacity', `${newSettings.backgroundOpacity || 0.1}`);
    } else {
      document.documentElement.style.removeProperty('--app-background');
      document.documentElement.style.removeProperty('--app-background-opacity');
    }
    
    // Update color CSS custom properties
    if (newSettings.navbarColor) {
      document.documentElement.style.setProperty('--navbar-color', newSettings.navbarColor);
    }
    if (newSettings.navbarTextColor) {
      document.documentElement.style.setProperty('--navbar-text-color', newSettings.navbarTextColor);
    }
    if (newSettings.footerColor) {
      document.documentElement.style.setProperty('--footer-color', newSettings.footerColor);
    }
    if (newSettings.footerTextColor) {
      document.documentElement.style.setProperty('--footer-text-color', newSettings.footerTextColor);
    }
    if (newSettings.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', newSettings.primaryColor);
    }
    if (newSettings.secondaryColor) {
      document.documentElement.style.setProperty('--secondary-color', newSettings.secondaryColor);
    }
    
    return newSettings as AppSettings;
  }
);

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.appSettings = action.payload;
      })
      .addCase(fetchAppSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Falha ao carregar configurações da aplicação';
      })
      .addCase(updateAppSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.appSettings = action.payload;
      })
      .addCase(updateAppSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Falha ao atualizar configurações da aplicação';
      });
  },
});

export const { clearError } = appSettingsSlice.actions;
export default appSettingsSlice.reducer;
