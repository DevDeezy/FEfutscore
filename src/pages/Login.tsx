import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/store');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(0,230,118,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(255,215,0,0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(0,230,118,0.05) 0%, transparent 70%)
          `,
          zIndex: 0,
        },
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          border: '1px solid rgba(0,230,118,0.1)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          border: '1px solid rgba(255,215,0,0.08)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background: 'rgba(20, 20, 20, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Logo & Title */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0,230,118,0.2) 0%, rgba(0,230,118,0.05) 100%)',
                border: '1px solid rgba(0,230,118,0.3)',
                mb: 3,
              }}
            >
              <SportsSoccerIcon
                sx={{
                  fontSize: 44,
                  color: 'primary.main',
                  animation: 'spin 10s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Bebas Neue", sans-serif',
                letterSpacing: 4,
                mb: 1,
                background: 'linear-gradient(135deg, #FAFAFA 0%, #A0A0A0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              FUTSCORE
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bem-vindo de volta! Entra na tua conta.
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                bgcolor: 'rgba(255,71,87,0.1)',
                border: '1px solid rgba(255,71,87,0.3)',
              }}
              onClose={() => dispatch(clearError())}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nome de Utilizador"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="username"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Palavra-passe"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'inherit' }} />
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Divider */}
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.06)' }}>
            <Typography variant="caption" color="text.secondary">
              ou
            </Typography>
          </Divider>

          {/* Back to Store */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              component={RouterLink}
              to="/store"
              variant="outlined"
              fullWidth
              sx={{
                py: 1.2,
                borderColor: 'rgba(255,255,255,0.15)',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  bgcolor: 'rgba(255,255,255,0.03)',
                },
              }}
            >
              Voltar à Loja
            </Button>
          </Box>
        </Paper>

        {/* Footer Text */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 4 }}
        >
          © {new Date().getFullYear()} FutScore. Todos os direitos reservados.
        </Typography>
      </Container>
    </Box>
  );
};

export default Login;
