import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  Drawer,
  List,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  Avatar,
  Chip,
  Collapse,
  alpha,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import StoreIcon from '@mui/icons-material/Store';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { fetchAppSettings } from '../store/slices/appSettingsSlice';
import NotificationBell from './NotificationBell';
import { useTheme } from '@mui/material/styles';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);
  const { appSettings } = useSelector((state: RootState) => state.appSettings);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    dispatch(fetchAppSettings());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Loja', path: '/store', icon: <StoreIcon />, requiresAuth: false },
    { label: 'Novo Pedido', path: '/order', icon: <AddCircleIcon />, requiresAuth: true },
    { label: 'Meus Pedidos', path: '/previous-orders', icon: <HistoryIcon />, requiresAuth: true },
    { label: 'Painel', path: '/user-panel', icon: <DashboardIcon />, requiresAuth: true },
    { label: 'Admin', path: '/admin', icon: <AdminPanelSettingsIcon />, requiresAuth: true, adminOnly: true },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.adminOnly && user?.role !== 'admin') return false;
    if (link.requiresAuth && !user) return false;
    return true;
  });

  const drawerContent = (
    <Box 
      sx={{ 
        width: 300, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0F0F0F 0%, #141414 100%)',
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SportsSoccerIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: '"Bebas Neue", sans-serif',
              letterSpacing: 2,
              color: 'text.primary',
            }}
          >
            FUTSCORE
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* User Info */}
      {user && (
        <Box sx={{ 
          p: 2.5, 
          mx: 2, 
          mt: 2, 
          borderRadius: 3,
          background: 'rgba(0,230,118,0.08)',
          border: '1px solid rgba(0,230,118,0.15)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText',
              width: 44,
              height: 44,
              fontWeight: 600,
            }}>
              {user.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {user.email?.split('@')[0]}
              </Typography>
              <Chip 
                label={user.role === 'admin' ? 'Administrador' : 'Cliente'} 
                size="small"
                sx={{ 
                  mt: 0.5,
                  height: 20,
                  fontSize: '0.7rem',
                  bgcolor: user.role === 'admin' ? 'rgba(255,215,0,0.2)' : 'rgba(0,230,118,0.2)',
                  color: user.role === 'admin' ? 'secondary.main' : 'primary.main',
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {filteredLinks.map((link) => (
          <ListItemButton
            key={link.path}
            component={RouterLink}
            to={link.path}
            onClick={handleDrawerToggle}
            sx={{
              borderRadius: 2,
              mb: 1,
              py: 1.5,
              bgcolor: isActive(link.path) ? 'rgba(0,230,118,0.12)' : 'transparent',
              border: isActive(link.path) ? '1px solid rgba(0,230,118,0.3)' : '1px solid transparent',
              '&:hover': {
                bgcolor: 'rgba(0,230,118,0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: isActive(link.path) ? 'primary.main' : 'text.secondary',
              minWidth: 40,
            }}>
              {link.icon}
            </ListItemIcon>
            <ListItemText 
              primary={link.label} 
              primaryTypographyProps={{
                fontWeight: isActive(link.path) ? 600 : 400,
                color: isActive(link.path) ? 'primary.main' : 'text.primary',
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Bottom Actions */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {user ? (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => {
              handleDrawerToggle();
              handleLogout();
            }}
            sx={{ 
              borderColor: 'rgba(255,71,87,0.5)',
              color: '#FF4757',
              '&:hover': {
                borderColor: '#FF4757',
                bgcolor: 'rgba(255,71,87,0.1)',
              },
            }}
          >
            Terminar Sessão
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            component={RouterLink}
            to="/login"
            onClick={handleDrawerToggle}
          >
            Entrar
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          transition: 'all 0.3s ease',
          py: scrolled ? 0 : 0.5,
          bgcolor: scrolled ? 'rgba(10,10,10,0.95)' : 'rgba(10,10,10,0.85)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 64, md: 72 } }}>
          {/* Left - Logo & Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box
              component={RouterLink}
              to="/"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none', 
                color: 'inherit',
              }}
            >
              {appSettings?.logo ? (
                <img 
                  src={appSettings.logo} 
                  alt="Logo" 
                  style={{ 
                    height: `${appSettings.logoHeight || 40}px`,
                    maxWidth: '160px',
                    objectFit: 'contain'
                  }} 
                />
              ) : (
                <>
                  <SportsSoccerIcon sx={{ 
                    color: 'primary.main', 
                    fontSize: 36,
                    animation: 'spin 8s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: '"Bebas Neue", sans-serif',
                      fontSize: { xs: '1.5rem', md: '1.8rem' },
                      letterSpacing: 3,
                      background: 'linear-gradient(135deg, #00E676 0%, #66FFA6 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    FUTSCORE
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* Center - Navigation (Desktop) */}
          {!isMobile && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              bgcolor: 'rgba(255,255,255,0.03)',
              borderRadius: 3,
              p: 0.5,
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              {filteredLinks.map((link) => (
                <Button
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: isActive(link.path) ? 'primary.main' : 'text.secondary',
                    bgcolor: isActive(link.path) ? 'rgba(0,230,118,0.12)' : 'transparent',
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    fontWeight: isActive(link.path) ? 600 : 400,
                    '&:hover': {
                      bgcolor: 'rgba(0,230,118,0.08)',
                      color: 'primary.main',
                      transform: 'none',
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Right - Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              component={RouterLink}
              to="/cart"
              sx={{
                color: 'text.primary',
                bgcolor: items.length > 0 ? 'rgba(0,230,118,0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(0,230,118,0.15)',
                },
              }}
            >
              <Badge 
                badgeContent={items.length} 
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 700,
                  },
                }}
              >
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {user && <NotificationBell />}

            {user ? (
              <>
                <IconButton
                  onClick={handleMenu}
                  sx={{
                    p: 0.5,
                    ml: 1,
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    {user.email?.charAt(0).toUpperCase()}
                  </Avatar>
                  <KeyboardArrowDownIcon sx={{ 
                    color: 'text.secondary', 
                    fontSize: 20,
                    ml: 0.5,
                    transition: 'transform 0.2s',
                    transform: anchorEl ? 'rotate(180deg)' : 'rotate(0)',
                  }} />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Sessão iniciada como
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.email}
                    </Typography>
                  </Box>
                  <MenuItem 
                    component={RouterLink} 
                    to="/user-panel" 
                    onClick={handleClose}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Painel do Utilizador
                  </MenuItem>
                  <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.06)' }} />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      py: 1.5, 
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: 'rgba(255,71,87,0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Terminar Sessão
                  </MenuItem>
                </Menu>
              </>
            ) : (
              !isMobile && (
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/login"
                  sx={{ ml: 1 }}
                >
                  Entrar
                </Button>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Spacer for fixed navbar */}
      <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }} />

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
