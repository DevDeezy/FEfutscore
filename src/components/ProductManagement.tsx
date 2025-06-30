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
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const ProductManagement = () => {
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openProductTypeDialog, setOpenProductTypeDialog] = useState(false);
  const [newProductTypeName, setNewProductTypeName] = useState('');

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Product Types</Typography>
        <Button variant="contained" onClick={() => setOpenProductTypeDialog(true)}>
          Add Product Type
        </Button>
      </Box>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
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

      <Typography variant="h6" sx={{ mb: 2 }}>Products</Typography>
      {/* Product management table and dialog will go here */}

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
    </Box>
  );
};

export default ProductManagement; 