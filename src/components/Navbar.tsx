import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  IconButton as MuiIconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  TextField,
  Alert,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import InstagramIcon from '@mui/icons-material/Instagram';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { setUser } from '../store/slices/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [instagramDialogOpen, setInstagramDialogOpen] = useState(false);
  const [instagramName, setInstagramName] = useState(user?.instagramName || '');
  const [instagramLoading, setInstagramLoading] = useState(false);
  const [instagramError, setInstagramError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const handleOpenInstagramDialog = () => {
    setInstagramName(user?.instagramName || '');
    setInstagramDialogOpen(true);
  };
  const handleCloseInstagramDialog = () => {
    setInstagramDialogOpen(false);
    setInstagramError(null);
  };
  const handleSaveInstagramName = async () => {
    setInstagramLoading(true);
    setInstagramError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/.netlify/functions/updateInstagramName`, { instagramName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(setUser({ ...user, instagramName }));
      setInstagramDialogOpen(false);
    } catch (err: any) {
      setInstagramError('Erro ao atualizar o nome do Instagram.');
    }
    setInstagramLoading(false);
  };

  const commonLinks = (
    <>
      <Button color="inherit" component={RouterLink} to="/store" onClick={isMobile ? handleDrawerToggle : undefined}>
        Loja
      </Button>
      {user && (
        <>
          <Button color="inherit" component={RouterLink} to="/order" onClick={isMobile ? handleDrawerToggle : undefined}>
            Novo Pedido
          </Button>
           <Button color="inherit" component={RouterLink} to="/previous-orders" onClick={isMobile ? handleDrawerToggle : undefined}>
                Meus Pedidos
            </Button>
          <Button color="inherit" component={RouterLink} to="/moradas" onClick={isMobile ? handleDrawerToggle : undefined}>
            Minhas Moradas
          </Button>
          {user.role === 'admin' && (
            <Button color="inherit" component={RouterLink} to="/admin" onClick={isMobile ? handleDrawerToggle : undefined}>
              Painel de Admin
            </Button>
          )}
        </>
      )}
    </>
  );

  const drawerItems = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250 }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        FutScore
      </Typography>
      <List>
        <ListItemButton component={RouterLink} to="/store">
          <ListItemText primary="Loja" />
        </ListItemButton>
        {user ? (
          <>
            <ListItemButton component={RouterLink} to="/order">
              <ListItemText primary="Novo Pedido" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/previous-orders">
                <ListItemText primary="Meus Pedidos" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/moradas">
              <ListItemText primary="Minhas Moradas" />
            </ListItemButton>
            {user.role === 'admin' && (
              <ListItemButton component={RouterLink} to="/admin">
                <ListItemText primary="Painel de Admin" />
              </ListItemButton>
            )}
          </>
        ) : (
            <ListItemButton component={RouterLink} to="/login">
                <ListItemText primary="Entrar" />
            </ListItemButton>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" sx={{ borderRadius: '0px' }}>
      <Toolbar>
        {isMobile && (
          <MuiIconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </MuiIconButton>
        )}
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          FutScore
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {commonLinks}
        </Box>
        <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/cart"
            >
              <Badge badgeContent={items.length} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {user ? (
                <>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem component={RouterLink} to="/moradas" onClick={handleClose}>
                          <HomeIcon fontSize="small" style={{ marginRight: 8 }} />
                          Minhas Moradas
                        </MenuItem>
                        <MenuItem onClick={handleOpenInstagramDialog}>
                          <InstagramIcon fontSize="small" style={{ marginRight: 8 }} />
                          Definir nome do Instagram
                        </MenuItem>
                        <MenuItem component={RouterLink} to="/change-password" onClick={handleClose}>
                        Mudar Palavra-passe
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>Sair</MenuItem>
                    </Menu>
                </>
            ) : (
                !isMobile && (
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/login"
                    >
                        Entrar
                    </Button>
                )
            )}
        </Box>
      </Toolbar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawerItems}
      </Drawer>
      <Dialog open={instagramDialogOpen} onClose={handleCloseInstagramDialog}>
        <DialogTitle>Definir nome do Instagram</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Instagram"
            type="text"
            fullWidth
            value={instagramName}
            onChange={e => setInstagramName(e.target.value)}
            InputProps={{ startAdornment: <InstagramIcon sx={{ mr: 1 }} /> }}
          />
          {instagramError && <Alert severity="error">{instagramError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInstagramDialog}>Cancelar</Button>
          <Button onClick={handleSaveInstagramName} disabled={instagramLoading} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar; 