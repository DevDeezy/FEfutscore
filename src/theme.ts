import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e6c87a', // soft gold/yellow
      contrastText: '#222',
    },
    secondary: {
      main: '#f5f5f5', // soft gray
      contrastText: '#222',
    },
    background: {
      default: '#f5f5f5',
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#666',
    },
  },
  typography: {
    fontFamily: 'Nunito, Inter, Arial, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-1px',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      fontSize: '1.1rem',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          padding: '12px 28px',
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #e6c87a 0%, #f5e7b2 100%)',
          color: '#222',
        },
        containedSecondary: {
          background: '#f5f5f5',
          color: '#222',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: '#fafafa',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme; 