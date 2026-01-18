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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Link,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import KeyIcon from '@mui/icons-material/Key';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Password Reset State
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetStep, setResetStep] = useState(0);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

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

  // Password Reset Handlers
  const handleOpenResetDialog = () => {
    setResetDialogOpen(true);
    setResetStep(0);
    setResetError(null);
    setResetSuccess(null);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setMaskedEmail('');
  };

  const handleCloseResetDialog = () => {
    setResetDialogOpen(false);
    setResetStep(0);
    setResetError(null);
    setResetSuccess(null);
  };

  const handleRequestCode = async () => {
    if (!resetEmail.trim()) {
      setResetError('Por favor, insira o seu email ou nome de utilizador');
      return;
    }

    setResetLoading(true);
    setResetError(null);

    try {
      const isEmail = resetEmail.includes('@');
      const response = await axios.post(`${API_BASE_URL}/.netlify/functions/requestPasswordReset`, {
        email: isEmail ? resetEmail : undefined,
        username: !isEmail ? resetEmail : undefined,
      });

      if (response.data.success) {
        setMaskedEmail(response.data.email || '');
        setResetSuccess(response.data.message);
        setResetStep(1);
      }
    } catch (err: any) {
      setResetError(err.response?.data?.error || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (resetCode.length !== 6) {
      setResetError('O código deve ter 6 dígitos');
      return;
    }

    setResetLoading(true);
    setResetError(null);

    try {
      const isEmail = resetEmail.includes('@');
      const response = await axios.post(`${API_BASE_URL}/.netlify/functions/verifyResetCode`, {
        email: isEmail ? resetEmail : undefined,
        username: !isEmail ? resetEmail : undefined,
        code: resetCode,
      });

      if (response.data.success) {
        setResetSuccess('Código verificado!');
        setResetStep(2);
      }
    } catch (err: any) {
      setResetError(err.response?.data?.error || 'Código inválido. Tente novamente.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setResetError('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('As palavras-passe não coincidem');
      return;
    }

    setResetLoading(true);
    setResetError(null);

    try {
      const isEmail = resetEmail.includes('@');
      const response = await axios.post(`${API_BASE_URL}/.netlify/functions/resetPasswordWithCode`, {
        email: isEmail ? resetEmail : undefined,
        username: !isEmail ? resetEmail : undefined,
        code: resetCode,
        newPassword,
      });

      if (response.data.success) {
        setResetSuccess(response.data.message);
        setResetStep(3);
      }
    } catch (err: any) {
      setResetError(err.response?.data?.error || 'Erro ao alterar palavra-passe. Tente novamente.');
    } finally {
      setResetLoading(false);
    }
  };

  const resetSteps = ['Identificação', 'Verificar Código', 'Nova Palavra-passe'];

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
              sx={{ mb: 2 }}
            />

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={handleOpenResetDialog}
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Esqueceu a palavra-passe?
              </Link>
            </Box>

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

      {/* Password Reset Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={handleCloseResetDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#fff' }}>
            Recuperar Palavra-passe
          </Typography>
        </DialogTitle>
        <DialogContent>
          {/* Stepper */}
          {resetStep < 3 && (
            <Stepper activeStep={resetStep} sx={{ pt: 2, pb: 4 }}>
              {resetSteps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': {
                        color: 'text.secondary',
                        '&.Mui-active': { color: 'primary.main' },
                        '&.Mui-completed': { color: 'primary.main' },
                      },
                      '& .MuiStepIcon-root': {
                        color: 'rgba(255,255,255,0.2)',
                        '&.Mui-active': { color: 'primary.main' },
                        '&.Mui-completed': { color: 'primary.main' },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          {/* Error/Success Alerts */}
          {resetError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setResetError(null)}>
              {resetError}
            </Alert>
          )}
          {resetSuccess && resetStep < 3 && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {resetSuccess}
            </Alert>
          )}

          {/* Step 0: Enter Email/Username */}
          {resetStep === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Insira o seu email ou nome de utilizador para receber um código de recuperação.
              </Typography>
              <TextField
                fullWidth
                label="Email ou Nome de Utilizador"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          {/* Step 1: Enter Code */}
          {resetStep === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enviámos um código de 6 dígitos para <strong>{maskedEmail}</strong>. 
                Verifique a sua caixa de entrada.
              </Typography>
              <TextField
                fullWidth
                label="Código de Verificação"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  maxLength: 6,
                  style: { letterSpacing: '0.5em', fontFamily: 'monospace', fontSize: '1.2rem' },
                }}
                sx={{ mb: 2 }}
              />
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setResetStep(0);
                  setResetCode('');
                  setResetError(null);
                  setResetSuccess(null);
                }}
                sx={{ color: 'text.secondary' }}
              >
                Não recebeu o código? Voltar
              </Button>
            </Box>
          )}

          {/* Step 2: New Password */}
          {resetStep === 2 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Defina a sua nova palavra-passe.
              </Typography>
              <TextField
                fullWidth
                label="Nova Palavra-passe"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Confirmar Palavra-passe"
                type={showNewPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          {/* Step 3: Success */}
          {resetStep === 3 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#fff' }}>
                Palavra-passe Alterada!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A sua palavra-passe foi alterada com sucesso. Pode agora fazer login com a nova palavra-passe.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {resetStep < 3 && (
            <Button onClick={handleCloseResetDialog} sx={{ color: 'text.secondary' }}>
              Cancelar
            </Button>
          )}
          {resetStep === 0 && (
            <Button
              variant="contained"
              onClick={handleRequestCode}
              disabled={resetLoading || !resetEmail.trim()}
            >
              {resetLoading ? <CircularProgress size={24} /> : 'Enviar Código'}
            </Button>
          )}
          {resetStep === 1 && (
            <Button
              variant="contained"
              onClick={handleVerifyCode}
              disabled={resetLoading || resetCode.length !== 6}
            >
              {resetLoading ? <CircularProgress size={24} /> : 'Verificar'}
            </Button>
          )}
          {resetStep === 2 && (
            <Button
              variant="contained"
              onClick={handleResetPassword}
              disabled={resetLoading || !newPassword || !confirmPassword}
            >
              {resetLoading ? <CircularProgress size={24} /> : 'Alterar Palavra-passe'}
            </Button>
          )}
          {resetStep === 3 && (
            <Button variant="contained" onClick={handleCloseResetDialog}>
              Continuar para Login
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
