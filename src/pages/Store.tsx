import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  Chip,
  Fade,
  Skeleton,
  InputAdornment,
  Drawer,
  Divider,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BrushIcon from '@mui/icons-material/Brush';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SportsIcon from '@mui/icons-material/Sports';
import TuneIcon from '@mui/icons-material/Tune';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { addToCart } from '../store/slices/cartSlice';
import { OrderItem } from '../types';
import FilterSidebar from '../components/FilterSidebar';
import PatchSelection from '../components/PatchSelection';
import { RootState } from '../store';

const Store = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [products, setProducts] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [shirtTypes, setShirtTypes] = useState<{ id: number; name: string; price?: number }[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [patchImages, setPatchImages] = useState<string[]>([]);
  const [selectedShirtTypeId, setSelectedShirtTypeId] = useState<number | ''>('');

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Admin edit modal state
  const sexoOptions = ['Neutro', 'Masculino', 'Feminino'];

  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    try {
      const u = new URL(url);
      if (u.host.includes('drive.google.com') || u.host.includes('drive.usercontent.google.com')) {
        const byParam = u.searchParams.get('id');
        let id = byParam || '';
        const path = u.pathname || '';
        if (path.includes('/thumbnail') && byParam) {
          return url;
        }
        if (!id && path.includes('/file/d/')) {
          id = path.split('/file/d/')[1]?.split('/')[0] || '';
        }
        if (!id && path.includes('/d/')) {
          id = path.split('/d/')[1]?.split('/')[0] || '';
        }
        if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
      }
    } catch {}
    return url;
  };

  const formatSeason = (input: string): string => {
    const raw = String(input || '').trim();
    if (!raw) return '';
    const match = raw.match(/^(\d{2})\s*\/\s*(\d{2})$/);
    if (match) return `${match[1]}/${match[2]}`;
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    const yy = (digits.length >= 2 ? digits.slice(-2) : digits).padStart(2, '0');
    const next = (Number(yy) + 1) % 100;
    return `${yy}/${String(next).padStart(2, '0')}`;
  };

  const buildDriveThumbnailUrl = (value: string): string => {
    const input = String(value || '').trim();
    if (!input) return '';
    if (!input.includes('://') && !input.includes(' ')) {
      return `https://drive.google.com/thumbnail?id=${input}`;
    }
    try {
      const u = new URL(input);
      if (u.host.includes('drive.google.com') || u.host.includes('drive.usercontent.google.com')) {
        const byParam = u.searchParams.get('id');
        let id = byParam || '';
        const path = u.pathname || '';
        if (!id && path.includes('/file/d/')) id = path.split('/file/d/')[1]?.split('/')[0] || '';
        if (!id && path.includes('/d/')) id = path.split('/d/')[1]?.split('/')[0] || '';
        if (id) return `https://drive.google.com/thumbnail?id=${id}`;
      }
    } catch {}
    return input;
  };

  const isUnsupportedDriveViewer = (url: string): boolean => {
    try {
      const u = new URL(url);
      const path = u.pathname || '';
      const hasId = !!u.searchParams.get('id') || path.includes('/file/d/') || path.includes('/d/');
      return (u.host.includes('drive.google.com') && path.includes('/drive-viewer/')) && !hasId;
    } catch {
      return false;
    }
  };

  // Admin edit modal state
  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [adminEditingProduct, setAdminEditingProduct] = useState<any | null>(null);
  const [adminProductData, setAdminProductData] = useState<any>({
    name: '',
    description: '',
    price: 0,
    cost_price: 0,
    image_url: '',
    available_sizes: '',
    product_type_id: '',
    shirt_type_id: '',
    available_shirt_type_ids: [] as number[],
    sexo: 'Neutro',
    ano: '25/26',
  });
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleOpenDialog = (product: any) => {
    setSelectedProduct(product);
    setSize(product.available_sizes[0] || '');
    const availableIds: number[] = Array.isArray(product.available_shirt_type_ids) ? product.available_shirt_type_ids : [];
    if (availableIds.length > 0) {
      setSelectedShirtTypeId(availableIds[0]);
    } else if (product.shirt_type_id) {
      setSelectedShirtTypeId(product.shirt_type_id);
    } else {
      setSelectedShirtTypeId('');
    }
    setPlayerName('');
    setPlayerNumber('');
    setPatchImages([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setQuantity(1);
    setSize('');
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    const imageUrl = normalizeImageUrl(selectedProduct.image_url || '');

    const findShirtTypeName = (id?: number | '') => {
      if (!id || !Array.isArray(shirtTypes)) return undefined;
      const st = shirtTypes.find(st => st.id === id);
      return st?.name;
    };

    const chosenShirtTypeId = typeof selectedShirtTypeId === 'number' ? selectedShirtTypeId : undefined;
    const cartItem: OrderItem = {
      id: `${selectedProduct.id}-${size}`,
      product_id: selectedProduct.id,
      product_type: selectedProduct?.productType?.base_type || 'tshirt',
      name: selectedProduct.name,
      price: selectedProduct.price,
      image_front: imageUrl,
      size,
      available_sizes: Array.isArray(selectedProduct.available_sizes) ? selectedProduct.available_sizes : undefined,
      quantity,
      player_name: playerName,
      numero: playerNumber,
      patch_images: patchImages,
      shirt_type_id: chosenShirtTypeId,
      shirt_type_name: findShirtTypeName(chosenShirtTypeId),
    };
    dispatch(addToCart(cartItem));
    setAddedToCart(selectedProduct.id);
    setTimeout(() => setAddedToCart(null), 2000);
    handleCloseDialog();
  };

  useEffect(() => {
    fetchProducts();
    fetchProductTypes();
    fetchShirtTypes();
  }, []);

  const fetchProducts = async (typeId = '') => {
    try {
      setLoading(true);
      const url = typeId
        ? `${API_BASE_URL}/.netlify/functions/getProducts?productTypeId=${typeId}&summary=true`
        : `${API_BASE_URL}/.netlify/functions/getProducts?summary=true`;
      const res = await axios.get(url);
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts(res.data.products);
      }
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar produtos');
      setLoading(false);
    }
  };

  const fetchProductTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getProductTypes?asTree=true&limit=1000`);
      if (Array.isArray(res.data)) {
        setProductTypes(res.data);
      } else {
        setProductTypes(res.data.tree || res.data.productTypes);
      }
    } catch (err) {}
  };

  const fetchShirtTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getShirtTypes?page=1&limit=1000`);
      const list = Array.isArray(res.data?.shirtTypes) ? res.data.shirtTypes : (Array.isArray(res.data) ? res.data : []);
      setShirtTypes(list.map((t: any) => ({ id: t.id, name: t.name, price: t.price })));
    } catch {}
  };

  const flattenTypes = (nodes: any[]): any[] => {
    if (!Array.isArray(nodes)) return [];
    const out: any[] = [];
    const walk = (arr: any[]) => {
      for (const n of arr) {
        out.push(n);
        if (Array.isArray(n.children) && n.children.length) {
          walk(n.children);
        }
      }
    };
    walk(nodes);
    return out;
  };

  const getProductStartingPrice = (product: any): number => {
    const ids: number[] = Array.isArray(product.available_shirt_type_ids)
      ? product.available_shirt_type_ids
      : (product.shirt_type_id ? [product.shirt_type_id] : []);
    const candidatePrices: number[] = ids
      .map((id: number) => {
        const st = shirtTypes.find((t: any) => t.id === id);
        return typeof st?.price === 'number' ? st.price : undefined;
      })
      .filter((p: any) => typeof p === 'number') as number[];
    if (candidatePrices.length > 0) {
      return Math.min(...candidatePrices);
    }
    return typeof product.price === 'number' ? product.price : 0;
  };

  // Admin edit handlers
  const handleOpenAdminDialog = async (product: any) => {
    setAdminError(null);
    setAdminEditingProduct(product);
    const base = {
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      cost_price: product.cost_price || 0,
      image_url: product.image_url || '',
      available_sizes: Array.isArray(product.available_sizes) ? product.available_sizes.join(', ') : (product.available_sizes || ''),
      product_type_id: String(product.product_type_id ?? product?.productType?.id ?? ''),
      shirt_type_id: String(product.shirt_type_id || ''),
      available_shirt_type_ids: Array.isArray(product.available_shirt_type_ids) ? product.available_shirt_type_ids : [],
      sexo: product.sexo || 'Neutro',
      ano: product.ano || '25/26',
    };
    setAdminProductData(base);
    try {
      const full = await axios.get(`${API_BASE_URL}/.netlify/functions/getProduct?id=${product.id}`);
      const p = full.data || {};
      setAdminProductData((prev: any) => ({
        ...prev,
        image_url: p.image_url || prev.image_url,
        available_sizes: Array.isArray(p.available_sizes) ? p.available_sizes.join(', ') : (prev.available_sizes || ''),
        product_type_id: String(p.product_type_id ?? prev.product_type_id),
        shirt_type_id: p.shirt_type_id != null ? String(p.shirt_type_id) : prev.shirt_type_id,
        available_shirt_type_ids: Array.isArray(p.available_shirt_type_ids) ? p.available_shirt_type_ids : prev.available_shirt_type_ids,
        price: typeof p.price === 'number' ? p.price : prev.price,
        cost_price: typeof p.cost_price === 'number' ? p.cost_price : prev.cost_price,
        description: typeof p.description === 'string' ? p.description : prev.description,
        name: typeof p.name === 'string' ? p.name : prev.name,
        sexo: typeof p.sexo === 'string' ? p.sexo : prev.sexo,
        ano: typeof p.ano === 'string' ? p.ano : prev.ano,
      }));
    } catch {}
    setOpenAdminDialog(true);
  };

  const handleCloseAdminDialog = () => {
    setOpenAdminDialog(false);
    setAdminEditingProduct(null);
    setAdminProductData({
      name: '', description: '', price: 0, cost_price: 0, image_url: '', available_sizes: '', product_type_id: '', shirt_type_id: '', available_shirt_type_ids: [], sexo: 'Neutro', ano: '25/26'
    });
    setAdminError(null);
  };

  const handleSaveAdminProduct = async () => {
    try {
      setAdminError(null);
      const payload: any = {
        ...adminProductData,
        price: Number(adminProductData.price),
        cost_price: Number(adminProductData.cost_price),
        product_type_id: adminProductData.product_type_id ? Number(adminProductData.product_type_id) : undefined,
        available_sizes: String(adminProductData.available_sizes || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
      };
      payload.image_url = buildDriveThumbnailUrl(adminProductData.image_url);
      payload.shirt_type_id = adminProductData.shirt_type_id ? Number(adminProductData.shirt_type_id) : null;
      payload.available_shirt_type_ids = Array.isArray(adminProductData.available_shirt_type_ids) ? adminProductData.available_shirt_type_ids.map((n: any) => Number(n)) : [];
      payload.sexo = adminProductData.sexo;
      payload.ano = adminProductData.ano;

      const token = localStorage.getItem('token');
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      await axios.put(`${API_BASE_URL}/.netlify/functions/updateProduct/${adminEditingProduct.id}`, payload, headers);
      handleCloseAdminDialog();
      fetchProducts(selectedType);
    } catch (e: any) {
      setAdminError(e?.response?.data?.error || 'Falha ao atualizar produto');
    }
  };

  const handleDeleteAdminProduct = async () => {
    if (!adminEditingProduct) return;
    if (!window.confirm('Tem a certeza que quer apagar este produto?')) return;
    try {
      setAdminError(null);
      await axios.delete(`${API_BASE_URL}/.netlify/functions/deleteProduct/${adminEditingProduct.id}`);
      handleCloseAdminDialog();
      fetchProducts(selectedType);
    } catch (e: any) {
      setAdminError(e?.response?.data?.error || 'Falha ao apagar o produto');
    }
  };

  const handleTypeSelectFromTree = (typeId: string) => {
    setSelectedType(typeId);
    fetchProducts(typeId);
  };

  const filteredProducts = Array.isArray(products) ? products.filter((product) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = `${product.name || ''} ${product.ano || ''}`.toLowerCase();
    const description = (product.description || '').toLowerCase();
    const typeName = (product?.productType?.name || '').toLowerCase();
    return name.includes(query) || description.includes(query) || typeName.includes(query);
  }) : [];

  // Product Card Component
  const ProductCard = ({ product, index }: { product: any; index: number }) => (
    <Fade in timeout={300 + index * 50}>
      <Card
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #00E676 0%, #FFD700 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover::before': {
            opacity: 1,
          },
          '&:hover .product-image': {
            transform: 'scale(1.08)',
          },
          '&:hover .quick-add': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        }}
        onClick={() => handleOpenDialog(product)}
      >
        {/* Admin Edit Button */}
        {user?.role === 'admin' && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenAdminDialog(product);
            }}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 3,
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
              },
            }}
          >
            <BrushIcon fontSize="small" />
          </IconButton>
        )}

        {/* Season Badge */}
        {product.ano && (
          <Chip
            label={product.ano}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 2,
              bgcolor: 'rgba(0,230,118,0.9)',
              color: 'primary.contrastText',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        )}

        {/* Added to Cart Indicator */}
        {addedToCart === product.id && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,230,118,0.9)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48, color: '#0A0A0A' }} />
            <Typography variant="h6" sx={{ color: '#0A0A0A', fontWeight: 700 }}>
              Adicionado!
            </Typography>
          </Box>
        )}

        {/* Product Image */}
        <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: '#1A1A1A' }}>
          <CardMedia
            component="img"
            className="product-image"
            sx={{
              height: 280,
              objectFit: 'contain',
              p: 3,
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            image={normalizeImageUrl(product.image_url || '')}
            referrerPolicy="no-referrer"
            alt={product.name}
          />
          
          {/* Quick Add Overlay */}
          <Box
            className="quick-add"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'all 0.3s ease',
            }}
          >
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddShoppingCartIcon />}
              sx={{ 
                py: 1.2,
                fontWeight: 600,
              }}
            >
              Ver Detalhes
            </Button>
          </Box>
        </Box>

        {/* Product Info */}
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: 1,
              mb: 0.5,
            }}
          >
            {product?.productType?.name || 'Camisola'}
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: '1rem',
              lineHeight: 1.3,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </Typography>

          <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ display: 'block', fontSize: '0.7rem' }}
              >
                A partir de
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: 'primary.main',
                  fontFamily: '"Outfit", sans-serif',
                }}
              >
                €{getProductStartingPrice(product).toFixed(2)}
              </Typography>
            </Box>
            
            <IconButton
              sx={{
                bgcolor: 'rgba(0,230,118,0.1)',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            >
              <AddShoppingCartIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );

  // Loading Skeleton
  const ProductSkeleton = () => (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" height={280} animation="wave" />
      <CardContent>
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="80%" height={28} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 6, md: 10 },
          mb: 4,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(0,230,118,0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 50%, rgba(255,215,0,0.1) 0%, transparent 50%),
              linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)
            `,
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Chip
                icon={<SportsIcon sx={{ fontSize: 16 }} />}
                label="Nova Coleção 2025/26"
                sx={{
                  bgcolor: 'rgba(0,230,118,0.15)',
                  color: 'primary.main',
                  border: '1px solid rgba(0,230,118,0.3)',
                  fontWeight: 600,
                }}
              />
            </Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                mb: 2,
                background: 'linear-gradient(135deg, #FAFAFA 0%, #A0A0A0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Camisolas de Futebol
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, maxWidth: 600, mx: 'auto', mb: 4 }}
            >
              Descobre a maior coleção de camisolas dos melhores clubes do mundo. 
              Qualidade premium, preços imbatíveis.
            </Typography>

            {/* Search Bar */}
            <Box sx={{ maxWidth: 500, mx: 'auto' }}>
              <TextField
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Procurar equipas, jogadores..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 3,
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.1)',
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl">
        {/* Mobile Filter Button */}
        {isMobile && (
          <Box sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TuneIcon />}
              onClick={() => setMobileFilterOpen(true)}
              sx={{ py: 1.5 }}
            >
              Filtrar Produtos
              {selectedType && (
                <Chip
                  label="1"
                  size="small"
                  sx={{ ml: 1, height: 20, bgcolor: 'primary.main', color: 'primary.contrastText' }}
                />
              )}
            </Button>
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Sidebar Filters - Desktop */}
          {!isMobile && (
            <Grid item xs={12} md={3} lg={2.5}>
              <Box sx={{ position: 'sticky', top: 90 }}>
                <FilterSidebar
                  productTypes={productTypes}
                  selectedType={selectedType}
                  onSelectType={handleTypeSelectFromTree}
                  onClearAll={() => handleTypeSelectFromTree('')}
                />
              </Box>
            </Grid>
          )}

          {/* Products Grid */}
          <Grid item xs={12} md={9} lg={9.5}>
            {/* Results Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 3,
              pb: 2,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <Typography variant="body2" color="text.secondary">
                <strong style={{ color: '#FAFAFA' }}>{filteredProducts.length}</strong> produtos encontrados
              </Typography>
              {selectedType && (
                <Chip
                  label="Limpar filtros"
                  onDelete={() => handleTypeSelectFromTree('')}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                />
              )}
            </Box>

            {/* Products */}
            {loading ? (
              <Grid container spacing={3}>
                {[...Array(8)].map((_, i) => (
                  <Grid item key={i} xs={6} sm={6} md={4} lg={3}>
                    <ProductSkeleton />
                  </Grid>
                ))}
              </Grid>
            ) : error ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            ) : filteredProducts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <LocalOfferIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Nenhum produto encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tenta ajustar os filtros ou a pesquisa
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredProducts.map((product, index) => (
                  <Grid item key={product.id} xs={6} sm={6} md={4} lg={3}>
                    <ProductCard product={product} index={index} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="bottom"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80vh',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Filtros</Typography>
            <IconButton onClick={() => setMobileFilterOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <FilterSidebar
            productTypes={productTypes}
            selectedType={selectedType}
            onSelectType={(typeId) => {
              handleTypeSelectFromTree(typeId);
              setMobileFilterOpen(false);
            }}
            onClearAll={() => {
              handleTypeSelectFromTree('');
              setMobileFilterOpen(false);
            }}
          />
        </Box>
      </Drawer>

      {/* Product Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : 3,
          },
        }}
      >
        {fullScreen && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Detalhes do Produto</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          {selectedProduct && (
            <Box>
              {/* Product Image */}
              <Box sx={{ 
                bgcolor: '#1A1A1A', 
                borderRadius: 2, 
                p: 3, 
                mb: 3,
                display: 'flex',
                justifyContent: 'center',
              }}>
                <Box
                  component="img"
                  src={normalizeImageUrl(selectedProduct.image_url || '')}
                  alt={selectedProduct.name}
                  sx={{ 
                    maxHeight: 250, 
                    objectFit: 'contain',
                  }}
                />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {selectedProduct.name}
                {selectedProduct.ano && ` ${selectedProduct.ano}`}
              </Typography>

              <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 3 }}>
                €{getProductStartingPrice(selectedProduct).toFixed(2)}
              </Typography>

              {/* Shirt Type Selection */}
              {Array.isArray(selectedProduct?.available_shirt_type_ids) && selectedProduct.available_shirt_type_ids.length > 0 && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Tipo de Produto</InputLabel>
                  <Select
                    value={selectedShirtTypeId === '' ? '' : String(selectedShirtTypeId)}
                    label="Tipo de Produto"
                    onChange={(e: any) => setSelectedShirtTypeId(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    {selectedProduct.available_shirt_type_ids.map((id: number) => {
                      const st = shirtTypes.find(st => st.id === id);
                      const name = st?.name || `Tipo ${id}`;
                      const price = typeof st?.price === 'number' ? ` — €${st!.price.toFixed(2)}` : '';
                      return (
                        <MenuItem key={id} value={String(id)}>
                          {name}{price}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}

              {/* Size Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tamanho</InputLabel>
                <Select value={size} label="Tamanho" onChange={(e: any) => setSize(e.target.value)}>
                  {selectedProduct.available_sizes.map((s: string) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Player Name */}
              <TextField
                label="Nome do Jogador (Opcional)"
                fullWidth
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                sx={{ mb: 2 }}
              />

              {/* Player Number */}
              <TextField
                label="Número (Opcional)"
                fullWidth
                value={playerNumber}
                onChange={e => setPlayerNumber(e.target.value)}
                sx={{ mb: 2 }}
              />

              {/* Patches */}
              <Box sx={{ mb: 2 }}>
                <PatchSelection
                  onPatchesChange={setPatchImages}
                  selectedPatches={patchImages}
                  title="Patches"
                />
              </Box>

              {/* Quantity */}
              <TextField
                label="Quantidade"
                type="number"
                value={quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                InputProps={{ inputProps: { min: 1 } }}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" sx={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddToCart} 
            variant="contained" 
            startIcon={<AddShoppingCartIcon />}
            sx={{ flex: 2 }}
          >
            Adicionar ao Carrinho
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Edit Product Dialog */}
      <Dialog open={openAdminDialog} onClose={handleCloseAdminDialog} fullScreen={fullScreen} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          Editar Produto
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {adminError && (
            <Alert severity="error" sx={{ mb: 2 }}>{adminError}</Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nome do Produto"
                fullWidth
                value={adminProductData.name}
                onChange={(e) => setAdminProductData({ ...adminProductData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={2}
                value={adminProductData.description}
                onChange={(e) => setAdminProductData({ ...adminProductData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Imagem (ID do Drive ou URL)"
                fullWidth
                value={adminProductData.image_url}
                onChange={(e) => setAdminProductData({ ...adminProductData, image_url: e.target.value })}
                placeholder="Ex.: 1-pW0M60WDmG-k_rzjkWIn5e1BfdmfMCm ou https://..."
              />
            </Grid>
            {isUnsupportedDriveViewer(adminProductData.image_url) && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  Este link do Google Drive não é incorporável. Usa "Partilhar → Obter ligação" e cola um link com ID.
                </Alert>
              </Grid>
            )}
            {adminProductData.image_url && !isUnsupportedDriveViewer(adminProductData.image_url) && (
              <Grid item xs={12}>
                <Box sx={{ bgcolor: '#1A1A1A', p: 2, borderRadius: 2, textAlign: 'center' }}>
                  <Box
                    component="img"
                    src={normalizeImageUrl(buildDriveThumbnailUrl(adminProductData.image_url))}
                    alt="preview"
                    referrerPolicy="no-referrer"
                    sx={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                  />
                </Box>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tamanhos Disponíveis"
                fullWidth
                value={adminProductData.available_sizes}
                onChange={(e) => setAdminProductData({ ...adminProductData, available_sizes: e.target.value })}
                helperText="Separados por vírgula"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Família do Produto</InputLabel>
                <Select
                  value={adminProductData.product_type_id}
                  label="Família do Produto"
                  onChange={(e) => setAdminProductData({ ...adminProductData, product_type_id: e.target.value })}
                >
                  {flattenTypes(Array.isArray(productTypes) ? productTypes : []).map((type: any) => (
                    <MenuItem key={type.id} value={String(type.id)}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipos Disponíveis</InputLabel>
                <Select
                  multiple
                  value={(adminProductData.available_shirt_type_ids || []).map(String)}
                  label="Tipos Disponíveis"
                  onChange={(e) => {
                    const value = e.target.value as unknown as string[];
                    setAdminProductData({ ...adminProductData, available_shirt_type_ids: value.map(v => Number(v)) });
                  }}
                  renderValue={(selected) => {
                    const ids = (selected as string[]).map(v => Number(v));
                    const names = shirtTypes.filter(st => ids.includes(st.id)).map(st => st.name);
                    return names.join(', ');
                  }}
                >
                  {Array.isArray(shirtTypes) && shirtTypes.map((st) => (
                    <MenuItem key={st.id} value={String(st.id)}>{st.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Sexo</InputLabel>
                <Select
                  value={adminProductData.sexo}
                  label="Sexo"
                  onChange={(e) => setAdminProductData({ ...adminProductData, sexo: e.target.value })}
                >
                  {sexoOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Ano"
                fullWidth
                placeholder="24/25 ou 24"
                value={adminProductData.ano}
                onChange={(e) => setAdminProductData({ ...adminProductData, ano: e.target.value })}
                onBlur={(e) => setAdminProductData({ ...adminProductData, ano: formatSeason(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleDeleteAdminProduct} color="error">Apagar</Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={handleCloseAdminDialog} variant="outlined">Cancelar</Button>
          <Button onClick={handleSaveAdminProduct} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Store;
