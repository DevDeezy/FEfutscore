import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AppSettings } from '../../types';
import { getAppSettings as getAppSettingsAPI, updateAppSettings as updateAppSettingsAPI } from '../../api';

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
    try {
      const response = await getAppSettingsAPI();
      if (response.success) {
        // Transform database settings to our interface format
        const settings = {
          logo: response.data.logo || '',
          backgroundImage: response.data.background_image || '',
          logoHeight: parseInt(response.data.logo_height) || 40,
          backgroundOpacity: parseFloat(response.data.background_opacity) || 0.1,
          navbarColor: response.data.navbar_color || '#1976d2',
          navbarTextColor: response.data.navbar_text_color || '#ffffff',
          footerColor: response.data.footer_color || '#f5f5f5',
          footerTextColor: response.data.footer_text_color || '#666666',
          primaryColor: response.data.primary_color || '#1976d2',
          secondaryColor: response.data.secondary_color || '#dc004e'
        };
        
        // Apply CSS custom properties immediately
        applySettingsToCSS(settings);
        
        return settings;
      } else {
        throw new Error(response.error || 'Failed to fetch app settings');
      }
    } catch (error) {
      console.error('Error fetching app settings:', error);
      // Return default settings if API fails
      return {
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
  }
);

export const updateAppSettings = createAsyncThunk(
  'appSettings/updateAppSettings',
  async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    try {
      // Transform settings to database format
      const dbSettings: any = {};
      
      if (settings.logo !== undefined) dbSettings.logo = settings.logo;
      if (settings.backgroundImage !== undefined) dbSettings.background_image = settings.backgroundImage;
      if (settings.logoHeight !== undefined) dbSettings.logo_height = settings.logoHeight.toString();
      if (settings.backgroundOpacity !== undefined) dbSettings.background_opacity = settings.backgroundOpacity.toString();
      if (settings.navbarColor !== undefined) dbSettings.navbar_color = settings.navbarColor;
      if (settings.navbarTextColor !== undefined) dbSettings.navbar_text_color = settings.navbarTextColor;
      if (settings.footerColor !== undefined) dbSettings.footer_color = settings.footerColor;
      if (settings.footerTextColor !== undefined) dbSettings.footer_text_color = settings.footerTextColor;
      if (settings.primaryColor !== undefined) dbSettings.primary_color = settings.primaryColor;
      if (settings.secondaryColor !== undefined) dbSettings.secondary_color = settings.secondaryColor;

      const response = await updateAppSettingsAPI(dbSettings);
      
      if (response.success) {
        // Transform database response back to our interface format
        const updatedSettings = {
          logo: response.data.logo || '',
          backgroundImage: response.data.background_image || '',
          logoHeight: parseInt(response.data.logo_height) || 40,
          backgroundOpacity: parseFloat(response.data.background_opacity) || 0.1,
          navbarColor: response.data.navbar_color || '#1976d2',
          navbarTextColor: response.data.navbar_text_color || '#ffffff',
          footerColor: response.data.footer_color || '#f5f5f5',
          footerTextColor: response.data.footer_text_color || '#666666',
          primaryColor: response.data.primary_color || '#1976d2',
          secondaryColor: response.data.secondary_color || '#dc004e'
        };
        
        // Apply CSS custom properties immediately
        applySettingsToCSS(updatedSettings);
        
        return updatedSettings;
      } else {
        throw new Error(response.error || 'Failed to update app settings');
      }
    } catch (error) {
      console.error('Error updating app settings:', error);
      throw error;
    }
  }
);

// Helper function to apply settings to CSS custom properties
function applySettingsToCSS(settings: AppSettings) {
  // Logo settings
  if (settings.logo) {
    document.documentElement.style.setProperty('--app-logo', `url(${settings.logo})`);
    document.documentElement.style.setProperty('--app-logo-height', `${settings.logoHeight || 40}px`);
  } else {
    document.documentElement.style.removeProperty('--app-logo');
    document.documentElement.style.removeProperty('--app-logo-height');
  }
  
  // Background settings
  if (settings.backgroundImage) {
    document.documentElement.style.setProperty('--app-background', `url(${settings.backgroundImage})`);
    document.documentElement.style.setProperty('--app-background-opacity', `${settings.backgroundOpacity || 0.1}`);
  } else {
    document.documentElement.style.removeProperty('--app-background');
    document.documentElement.style.removeProperty('--app-background-opacity');
  }
  
  // Color settings
  if (settings.navbarColor) {
    document.documentElement.style.setProperty('--navbar-color', settings.navbarColor);
  }
  if (settings.navbarTextColor) {
    document.documentElement.style.setProperty('--navbar-text-color', settings.navbarTextColor);
  }
  if (settings.footerColor) {
    document.documentElement.style.setProperty('--footer-color', settings.footerColor);
  }
  if (settings.footerTextColor) {
    document.documentElement.style.setProperty('--footer-text-color', settings.footerTextColor);
  }
  if (settings.primaryColor) {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
  }
  if (settings.secondaryColor) {
    document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
  }
}

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
