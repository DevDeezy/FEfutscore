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

const ProductManagement = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openProductTypeDialog, setOpenProductTypeDialog] = useState(false);
  const [newProductTypeName, setNewProductTypeName] = useState('');

  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    available_sizes: '',
    product_type_id: '',
  });

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
      await axios.post(`${API_BASE_URL}/.netlify/functions/createProductType`, { name: newProductTypeName });
      setOpenProductTypeDialog(false);
      setNewProductTypeName('');
      fetchProductTypes();
    } catch (err) {
      setError('Failed to create product type');
    }
  };

  const handleCreateProduct = async () => {
    try {
      await axios.post(`${API_BASE_URL}/.netlify/functions/createProduct`, {
        ...newProduct,
        price: Number(newProduct.price),
        product_type_id: Number(newProduct.product_type_id),
        available_sizes: newProduct.available_sizes.split(',').map(s => s.trim()),
      });
      setOpenProductDialog(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        available_sizes: '',
        product_type_id: '',
      });
      fetchProducts();
    } catch (err) {
      setError('Failed to create product');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Product Types</Typography>
        <Button variant="contained" onClick={() => setOpenProductTypeDialog(true)}>
          Add Product Type
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>{type.id}</TableCell>
                <TableCell>{type.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Products</Typography>
        <Button variant="contained" onClick={() => setOpenProductDialog(true)}>
          Add Product
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.productType.name}</TableCell>
                <TableCell>€{product.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Product Type Dialog */}
      <Dialog open={openProductTypeDialog} onClose={() => setOpenProductTypeDialog(false)}>
        <DialogTitle>Add New Product Type</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Product Type Name"
            type="text"
            fullWidth
            variant="standard"
            value={newProductTypeName}
            onChange={(e) => setNewProductTypeName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductTypeDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateProductType}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
          />
          <TextField
            label="Image URL"
            fullWidth
            margin="normal"
            value={newProduct.image_url}
            onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
          />
          <TextField
            label="Available Sizes (comma-separated)"
            fullWidth
            margin="normal"
            value={newProduct.available_sizes}
            onChange={(e) => setNewProduct({ ...newProduct, available_sizes: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Product Type</InputLabel>
            <Select
              value={newProduct.product_type_id}
              label="Product Type"
              onChange={(e) => setNewProduct({ ...newProduct, product_type_id: e.target.value })}
            >
              {productTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateProduct}>Create</Button>
        </DialogActions>
      </Dialog>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

export default ProductManagement; 