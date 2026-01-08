import React from 'react';
import { Box, Container, Grid, Typography, IconButton, Link, Divider, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const features = [
    { icon: <LocalShippingIcon />, title: 'Envio Rápido', desc: 'Para todo o mundo' },
    { icon: <CreditCardIcon />, title: 'Pagamento Seguro', desc: 'Múltiplas opções' },
    { icon: <VerifiedUserIcon />, title: 'Qualidade Premium', desc: 'Garantia total' },
    { icon: <SupportAgentIcon />, title: 'Suporte 24/7', desc: 'Sempre disponível' },
  ];

  const quickLinks = [
    { label: 'Loja', path: '/store' },
    { label: 'Novo Pedido', path: '/order' },
    { label: 'Meus Pedidos', path: '/previous-orders' },
    { label: 'Minha Conta', path: '/user-panel' },
  ];

  const categories = [
    'Camisolas Oficiais',
    'Equipamentos Completos',
    'Camisolas Retro',
    'Personalizadas',
    'Patches & Acessórios',
  ];

  const socialLinks = [
    { icon: <InstagramIcon />, href: '#', label: 'Instagram', color: '#E4405F' },
    { icon: <FacebookIcon />, href: '#', label: 'Facebook', color: '#1877F2' },
    { icon: <TwitterIcon />, href: '#', label: 'Twitter', color: '#1DA1F2' },
    { icon: <WhatsAppIcon />, href: '#', label: 'WhatsApp', color: '#25D366' },
  ];

  return (
    <Box component="footer" sx={{ mt: 'auto' }}>
      {/* Features Bar */}
      <Box
        sx={{
          bgcolor: 'rgba(0,230,118,0.08)',
          borderTop: '1px solid rgba(0,230,118,0.2)',
          borderBottom: '1px solid rgba(0,230,118,0.2)',
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    justifyContent: { xs: 'flex-start', md: 'center' },
                  }}
                >
                  <Box
                    sx={{
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'rgba(0,230,118,0.1)',
                      flexShrink: 0,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {feature.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Main Footer */}
      <Box
        sx={{
          bgcolor: '#0A0A0A',
          pt: 8,
          pb: 4,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6}>
            {/* Brand Column */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <SportsSoccerIcon
                  sx={{
                    color: 'primary.main',
                    fontSize: 40,
                    animation: 'spin 8s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Bebas Neue", sans-serif',
                    letterSpacing: 3,
                    background: 'linear-gradient(135deg, #00E676 0%, #66FFA6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  FUTSCORE
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, lineHeight: 1.8 }}>
                A tua loja de confiança para camisolas de futebol. 
                Equipamentos oficiais e réplicas de alta qualidade dos melhores clubes do mundo.
              </Typography>
              
              {/* Social Links */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.05)',
                      color: 'text.secondary',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: social.color,
                        color: '#fff',
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={6} md={2}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: 'text.primary',
                }}
              >
                Navegação
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'primary.main',
                        pl: 1,
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Categories */}
            <Grid item xs={6} md={2}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: 'text.primary',
                }}
              >
                Categorias
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {categories.map((category, index) => (
                  <Link
                    key={index}
                    component={RouterLink}
                    to="/store"
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'primary.main',
                        pl: 1,
                      },
                    }}
                  >
                    {category}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* Contact */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: 'text.primary',
                }}
              >
                Contacto
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'rgba(0,230,118,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    <EmailIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Email
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      suporte@futscore.pt
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'rgba(0,230,118,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    <WhatsAppIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      WhatsApp
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      +351 912 345 678
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'rgba(0,230,118,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    <LocationOnIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Localização
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      Portugal
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Newsletter */}
              <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Recebe as Novidades
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Sê o primeiro a saber das novas coleções e promoções exclusivas.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  sx={{ py: 1.2 }}
                >
                  Subscrever
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom Bar */}
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.06)' }} />
          
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              © {currentYear} FutScore. Todos os direitos reservados.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: 'primary.main' } }}>
                Termos & Condições
              </Link>
              <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: 'primary.main' } }}>
                Política de Privacidade
              </Link>
              <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: 'primary.main' } }}>
                Política de Devoluções
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
