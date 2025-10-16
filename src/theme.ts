import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: 'var(--primary-color, #1976d2)', // dynamic primary color
      contrastText: '#ffffff',
    },
    secondary: {
      main: 'var(--secondary-color, #dc004e)', // dynamic secondary color
      contrastText: '#ffffff',
    },
    background: {
      default: '#faf9f6', // off-white
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#666',
    },
    divider: '#ececec',
  },
  typography: {
    fontFamily: 'Inter, Nunito, Arial, sans-serif',
    fontSize: 17,
    h1: {
      fontWeight: 800,
      fontSize: '2.3rem',
      letterSpacing: '-1px',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.7rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.2rem',
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 16,
  },
  spacing: 10,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#faf9f6',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
          padding: '28px 20px',
          border: '1px solid #ececec',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          padding: '12px 28px',
          fontWeight: 700,
          fontSize: '1rem',
          background: 'var(--primary-color, #1976d2)',
          color: '#ffffff',
          '&:hover': {
            opacity: 0.9,
            boxShadow: '0 2px 8px 0 rgba(25,118,210,0.10)',
          },
        },
        containedPrimary: {
          background: 'var(--primary-color, #1976d2)',
          color: '#ffffff',
        },
        containedSecondary: {
          background: 'var(--secondary-color, #dc004e)',
          color: '#ffffff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: '#fff',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: '#fff',
          fontSize: '1rem',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: '#fff',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '32px',
          paddingBottom: '32px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
          border: '1px solid #ececec',
        },
      },
    },
  },
});

export default theme; 