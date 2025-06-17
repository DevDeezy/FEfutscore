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
      default: '#f8f6f1', // even softer background
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#666',
    },
  },
  typography: {
    fontFamily: 'Nunito, Inter, Arial, sans-serif',
    fontSize: 18, // slightly larger base font
    h1: {
      fontWeight: 800,
      fontSize: '2.7rem',
      letterSpacing: '-1px',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.1rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.6rem',
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      fontSize: '1.15rem',
    },
  },
  shape: {
    borderRadius: 20,
  },
  spacing: 10,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(120deg, #f8f6f1 0%, #f5e7b2 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.10)',
          padding: '32px 28px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 2px 8px 0 rgba(230,200,122,0.10)',
          padding: '14px 32px',
          fontWeight: 700,
          fontSize: '1.1rem',
          transition: 'background 0.2s, box-shadow 0.2s',
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #e6c87a 0%, #f5e7b2 100%)',
          color: '#222',
          '&:hover': {
            background: 'linear-gradient(90deg, #f5e7b2 0%, #e6c87a 100%)',
            boxShadow: '0 4px 16px 0 rgba(230,200,122,0.18)',
          },
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
          borderRadius: 14,
          background: '#faf9f6',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          background: '#faf9f6',
          fontSize: '1.08rem',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          background: '#faf9f6',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '40px',
          paddingBottom: '40px',
        },
      },
    },
  },
});

export default theme; 