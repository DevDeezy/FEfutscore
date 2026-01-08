import { createTheme } from '@mui/material/styles';

// Modern football store theme - dark mode with vibrant accents
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00E676', // Vibrant green - football pitch accent
      light: '#66FFA6',
      dark: '#00B248',
      contrastText: '#0A0A0A',
    },
    secondary: {
      main: '#FFD700', // Gold - championship color
      light: '#FFEA4D',
      dark: '#C9A800',
      contrastText: '#0A0A0A',
    },
    background: {
      default: '#0A0A0A',
      paper: '#141414',
    },
    text: {
      primary: '#FAFAFA',
      secondary: '#A0A0A0',
    },
    error: {
      main: '#FF4757',
    },
    warning: {
      main: '#FFA502',
    },
    success: {
      main: '#2ED573',
    },
    info: {
      main: '#3498DB',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: '"Outfit", "Montserrat", -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
    h1: {
      fontFamily: '"Bebas Neue", "Outfit", sans-serif',
      fontWeight: 400,
      fontSize: '3.5rem',
      letterSpacing: '2px',
      textTransform: 'uppercase',
    },
    h2: {
      fontFamily: '"Bebas Neue", "Outfit", sans-serif',
      fontWeight: 400,
      fontSize: '2.5rem',
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
    },
    h3: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.95rem',
      letterSpacing: '0.5px',
    },
    body1: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          background: 'linear-gradient(180deg, #0A0A0A 0%, #0F1410 50%, #0A0A0A 100%)',
          minHeight: '100vh',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#0A0A0A',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#333',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#00E676',
          },
        },
        '*': {
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#333',
            borderRadius: '3px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#141414',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        },
        elevation2: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        },
        elevation3: {
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          boxShadow: '0 4px 16px rgba(0,230,118,0.3)',
          '&:hover': {
            boxShadow: '0 6px 24px rgba(0,230,118,0.4)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00E676 0%, #00B248 100%)',
          color: '#0A0A0A',
          '&:hover': {
            background: 'linear-gradient(135deg, #66FFA6 0%, #00E676 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #FFD700 0%, #C9A800 100%)',
          color: '#0A0A0A',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFEA4D 0%, #FFD700 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            background: 'rgba(0,230,118,0.08)',
          },
        },
        outlinedPrimary: {
          borderColor: '#00E676',
          color: '#00E676',
          '&:hover': {
            borderColor: '#66FFA6',
            color: '#66FFA6',
          },
        },
        text: {
          '&:hover': {
            background: 'rgba(255,255,255,0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.03)',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0,230,118,0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00E676',
              borderWidth: 2,
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(0,230,118,0.05)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#A0A0A0',
            '&.Mui-focused': {
              color: '#00E676',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: '0.95rem',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#141414',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 40px rgba(0,230,118,0.15)',
            border: '1px solid rgba(0,230,118,0.3)',
          },
        },
      },
    },
    MuiCardMedia: {
      styleOverrides: {
        root: {
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: 'rgba(0,230,118,0.15)',
          color: '#00E676',
          '&:hover': {
            backgroundColor: 'rgba(0,230,118,0.25)',
          },
        },
        outlined: {
          borderColor: 'rgba(0,230,118,0.5)',
          color: '#00E676',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#1A1A1A',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.5rem',
          fontWeight: 600,
          paddingBottom: 8,
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
        },
        colorError: {
          background: 'linear-gradient(135deg, #FF4757 0%, #FF2D3D 100%)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
          minHeight: 48,
          '&.Mui-selected': {
            color: '#00E676',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #00E676 0%, #00B248 100%)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255,255,255,0.06)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(0,0,0,0.3)',
          color: '#A0A0A0',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.5px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(0,230,118,0.05)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardSuccess: {
          backgroundColor: 'rgba(46,213,115,0.15)',
          color: '#2ED573',
        },
        standardError: {
          backgroundColor: 'rgba(255,71,87,0.15)',
          color: '#FF4757',
        },
        standardWarning: {
          backgroundColor: 'rgba(255,165,2,0.15)',
          color: '#FFA502',
        },
        standardInfo: {
          backgroundColor: 'rgba(52,152,219,0.15)',
          color: '#3498DB',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(0,230,118,0.1)',
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#0F0F0F',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#1A1A1A',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(0,230,118,0.1)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0,230,118,0.15)',
            '&:hover': {
              backgroundColor: 'rgba(0,230,118,0.2)',
            },
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            color: '#A0A0A0',
            '&.Mui-selected': {
              backgroundColor: 'rgba(0,230,118,0.2)',
              color: '#00E676',
            },
            '&:hover': {
              backgroundColor: 'rgba(0,230,118,0.1)',
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.1)',
        },
        bar: {
          borderRadius: 4,
          background: 'linear-gradient(90deg, #00E676 0%, #00B248 100%)',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#00E676',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.05)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1A1A1A',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          fontSize: '0.8rem',
          padding: '8px 12px',
        },
        arrow: {
          color: '#1A1A1A',
        },
      },
    },
  },
});

export default theme;
