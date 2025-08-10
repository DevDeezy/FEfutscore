import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { Product, ProductType } from '../types';
import DragDropZone from './DragDropZone';

const ProductManagement = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openProductTypeDialog, setOpenProductTypeDialog] = useState(false);
  const [newProductTypeName, setNewProductTypeName] = useState('');
  const [newProductTypeBase, setNewProductTypeBase] = useState('tshirt');

  const [openProductDialog, setOpenProductDialog] = useState(false);
  const sexoOptions = ['Neutro', 'Masculino', 'Feminino'];
  const anoOptions = ['21/22', '23/24', '24/25', '25/26'];
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    cost_price: 0,
    image_url: '',
    base_type: 'tshirt',
    available_sizes: '',
    product_type_id: '',
    sexo: 'Neutro',
    ano: '25/26',
    numero: '',
  });

  // State for image upload
  const [productImage, setProductImage] = useState<string>('');

  // Handle product image upload
  const handleProductImageChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setProductImage(imageUrl);
      setNewProduct({ ...newProduct, image_url: imageUrl });
    };
    reader.readAsDataURL(file);
  };

  // Remove product image
  const handleRemoveProductImage = () => {
    setProductImage('');
    setNewProduct({ ...newProduct, image_url: '' });
  };

  // Handle closing the product dialog and resetting states
  const handleCloseProductDialog = () => {
    setOpenProductDialog(false);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      cost_price: 0,
      image_url: '',
      base_type: 'tshirt',
      available_sizes: '',
      product_type_id: '',
      sexo: 'Neutro',
      ano: '25/26',
      numero: '',
    });
    setProductImage('');
  };

  useEffect(() => {
    fetchProductTypes();
    fetchProducts();
  }, []);

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getProductTypes`);
      setProductTypes(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch product types');
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getProducts`);
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const handleCreateProductType = async () => {
    try {
      await axios.post(`${API_BASE_URL}/.netlify/functions/createProductType`, {
        name: newProductTypeName,
        base_type: newProductTypeBase,
      });
      setOpenProductTypeDialog(false);
      setNewProductTypeName('');
      fetchProductTypes();
    } catch (err) {
      setError('Failed to create product type');
    }
  };

  const handleDeleteProductType = async (productTypeId: number) => {
    if (window.confirm('Tem a certeza que quer apagar este tipo de produto?')) {
      try {
        await axios.delete(`${API_BASE_URL}/.netlify/functions/deleteProductType/${productTypeId}`);
        fetchProductTypes();
      } catch (err: any) {
        setError(err.response?.data || 'Failed to delete product type');
      }
    }
  };

  const handleCreateProduct = async () => {
    try {
      await axios.post(`${API_BASE_URL}/.netlify/functions/createProduct`, {
        ...newProduct,
        price: Number(newProduct.price),
        cost_price: Number(newProduct.cost_price),
        product_type_id: Number(newProduct.product_type_id),
        available_sizes: newProduct.available_sizes.split(',').map(s => s.trim()),
        sexo: newProduct.sexo,
        ano: newProduct.ano,
        numero: newProduct.numero,
      });
      setOpenProductDialog(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        cost_price: 0,
        image_url: '',
        base_type: 'tshirt',
        available_sizes: '',
        product_type_id: '',
        sexo: 'Neutro',
        ano: '25/26',
        numero: '',
      });
      setProductImage(''); // Reset the image upload state
      fetchProducts();
    } catch (err) {
      setError('Failed to create product');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Tem a certeza que quer apagar este produto?')) {
      try {
        await axios.delete(`${API_BASE_URL}/.netlify/functions/deleteProduct/${productId}`);
        fetchProducts();
      } catch (err) {
        setError('Falha ao apagar o produto');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Tipos de Produto</Typography>
        <Button variant="contained" onClick={() => setOpenProductTypeDialog(true)}>
          Adicionar Tipo de Produto
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo Base</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>{type.id}</TableCell>
                <TableCell>{type.name}</TableCell>
                <TableCell>{type.base_type}</TableCell>
                <TableCell>
                  <Button color="error" onClick={() => handleDeleteProductType(type.id)}>
                    Apagar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Produtos</Typography>
        <Button variant="contained" onClick={() => setOpenProductDialog(true)}>
          Adicionar Produto
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo Base</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Preço Custo</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.productType.base_type}</TableCell>
                <TableCell>{product.productType.name}</TableCell>
                <TableCell>€{product.price.toFixed(2)}</TableCell>
                <TableCell>€{product.cost_price ? product.cost_price.toFixed(2) : '-'}</TableCell>
                <TableCell>
                  <Button color="error" onClick={() => handleDeleteProduct(product.id)}>
                    Apagar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Product Type Dialog */}
      <Dialog open={openProductTypeDialog} onClose={() => setOpenProductTypeDialog(false)}>
        <DialogTitle>Adicionar Tipo de Produto</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Tipo de Produto"
            type="text"
            fullWidth
            value={newProductTypeName}
            onChange={(e) => setNewProductTypeName(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo Base</InputLabel>
            <Select
              value={newProductTypeBase}
              label="Tipo Base"
              onChange={(e) => setNewProductTypeBase(e.target.value)}
            >
              <MenuItem value="tshirt">Camisola</MenuItem>
              <MenuItem value="shoes">Sapatilhas</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductTypeDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateProductType}>Criar</Button>
        </DialogActions>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)}>
        <DialogTitle>Adicionar Produto</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do Produto"
            fullWidth
            margin="normal"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <TextField
            label="Descrição"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <TextField
            label="Preço"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
          />
          <TextField
            label="Preço Custo"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.cost_price}
            onChange={(e) => setNewProduct({ ...newProduct, cost_price: Number(e.target.value) })}
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Imagem do Produto:</Typography>
            <DragDropZone
              title="Carregar Imagem do Produto"
              subtitle="Escolha uma imagem ou arraste-a para aqui"
              onFileSelect={handleProductImageChange}
              onFileRemove={handleRemoveProductImage}
              currentImage={productImage || newProduct.image_url}
              accept="image/*"
              multiple={false}
              height={150}
            />
          </Box>
          <TextField
            label="Tamanhos Disponíveis (separados por vírgula)"
            fullWidth
            margin="normal"
            value={newProduct.available_sizes}
            onChange={(e) => setNewProduct({ ...newProduct, available_sizes: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Produto</InputLabel>
            <Select
              value={newProduct.product_type_id}
              label="Tipo de Produto"
              onChange={(e) => setNewProduct({ ...newProduct, product_type_id: e.target.value })}
            >
              {productTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Sexo</InputLabel>
            <Select
              value={newProduct.sexo}
              label="Sexo"
              onChange={e => setNewProduct({ ...newProduct, sexo: e.target.value })}
            >
              {sexoOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Ano</InputLabel>
            <Select
              value={newProduct.ano}
              label="Ano"
              onChange={e => setNewProduct({ ...newProduct, ano: e.target.value })}
            >
              {anoOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            label="Número"
            fullWidth
            margin="normal"
            value={newProduct.numero}
            onChange={e => setNewProduct({ ...newProduct, numero: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog}>Cancelar</Button>
          <Button onClick={handleCreateProduct}>Criar</Button>
        </DialogActions>
      </Dialog>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

export default ProductManagement; 