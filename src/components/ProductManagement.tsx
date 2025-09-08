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
// Replaced x-tree-view with a simple indented list to avoid extra dependency
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
  const [editingProductType, setEditingProductType] = useState<ProductType | null>(null);
  const [newProductTypeName, setNewProductTypeName] = useState('');
  const [newProductTypeBase, setNewProductTypeBase] = useState('tshirt');
  const [newProductTypeParentId, setNewProductTypeParentId] = useState<number | ''>('');

  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  // Handle opening product dialog for editing
  const handleOpenProductDialog = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      setNewProduct({
        name: product.name,
        description: product.description || '',
        price: product.price,
        cost_price: product.cost_price || 0,
        image_url: product.image_url,
        base_type: product.productType.base_type,
        available_sizes: Array.isArray(product.available_sizes) ? product.available_sizes.join(', ') : product.available_sizes,
        product_type_id: String((product as any).product_type_id ?? product.productType.id),
        sexo: product.sexo || 'Neutro',
        ano: product.ano || '25/26',
      });
      setProductImage(product.image_url);
    } else {
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
      });
      setProductImage('');
    }
    setOpenProductDialog(true);
  };

  // Handle closing the product dialog and resetting states
  const handleCloseProductDialog = () => {
    setOpenProductDialog(false);
    setEditingProduct(null);
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
    });
    setProductImage('');
  };

  useEffect(() => {
    fetchProductTypes();
    fetchProducts();
  }, []);

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

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getProductTypes?asTree=true&limit=1000`);
      // Handle both old format (array) and new format (paginated response)
      const tree = res.data?.tree || (Array.isArray(res.data) ? res.data : res.data?.productTypes);
      setProductTypes(tree);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch product types');
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getProducts?limit=1000`);
      // Handle both old format (array) and new format (paginated response)
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts(res.data.products);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const handleCreateOrUpdateProductType = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      if (editingProductType) {
        await axios.put(
          `${API_BASE_URL}/.netlify/functions/updateProductType/${editingProductType.id}`,
          {
            name: newProductTypeName,
            base_type: newProductTypeBase,
            parent_id: newProductTypeParentId === '' ? null : Number(newProductTypeParentId),
          },
          headers
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/.netlify/functions/createProductType`,
          {
            name: newProductTypeName,
            base_type: newProductTypeBase,
            parent_id: newProductTypeParentId === '' ? null : Number(newProductTypeParentId),
          },
          headers
        );
      }
      setOpenProductTypeDialog(false);
      setEditingProductType(null);
      setNewProductTypeName('');
      setNewProductTypeParentId('');
      fetchProductTypes();
    } catch (err) {
      setError(editingProductType ? 'Falha ao atualizar tipo de produto' : 'Failed to create product type');
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

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...newProduct,
        price: Number(newProduct.price),
        cost_price: Number(newProduct.cost_price),
        product_type_id: Number(newProduct.product_type_id),
        available_sizes: newProduct.available_sizes.split(',').map(s => s.trim()),
        sexo: newProduct.sexo,
        ano: newProduct.ano,
      };

      const token = localStorage.getItem('token');
      const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

      if (editingProduct) {
        // Update existing product
        await axios.put(`${API_BASE_URL}/.netlify/functions/updateProduct/${editingProduct.id}`, productData, headers);
      } else {
        // Create new product
        await axios.post(`${API_BASE_URL}/.netlify/functions/createProduct`, productData, headers);
      }

      handleCloseProductDialog();
      fetchProducts();
    } catch (err) {
      setError(editingProduct ? 'Falha ao atualizar produto' : 'Falha ao criar produto');
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
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Estrutura de Tipos</Typography>
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {(Array.isArray(productTypes) ? productTypes : []).filter(pt => !pt.parent_id).map((root) => (
            <Box key={root.id} sx={{ ml: 0, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{root.name}</span>
                <Button size="small" variant="outlined" onClick={() => { setEditingProductType(root); setNewProductTypeName(root.name); setNewProductTypeBase(root.base_type); setNewProductTypeParentId(root.parent_id || ''); setOpenProductTypeDialog(true); }}>Editar</Button>
                <Button size="small" color="error" onClick={() => handleDeleteProductType(root.id)}>Apagar</Button>
              </Box>
              {(root.children || []).map(child => (
                <Box key={child.id} sx={{ ml: 2, my: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{child.name}</span>
                    <Button size="small" variant="outlined" onClick={() => { setEditingProductType(child); setNewProductTypeName(child.name); setNewProductTypeBase(child.base_type); setNewProductTypeParentId(child.parent_id || ''); setOpenProductTypeDialog(true); }}>Editar</Button>
                    <Button size="small" color="error" onClick={() => handleDeleteProductType(child.id)}>Apagar</Button>
                  </Box>
                  {(child.children || []).map(gchild => (
                    <Box key={gchild.id} sx={{ ml: 4, my: 0.25 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{gchild.name}</span>
                        <Button size="small" variant="outlined" onClick={() => { setEditingProductType(gchild); setNewProductTypeName(gchild.name); setNewProductTypeBase(gchild.base_type); setNewProductTypeParentId(gchild.parent_id || ''); setOpenProductTypeDialog(true); }}>Editar</Button>
                        <Button size="small" color="error" onClick={() => handleDeleteProductType(gchild.id)}>Apagar</Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Produtos</Typography>
        <Button variant="contained" onClick={() => handleOpenProductDialog()}>
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
            {Array.isArray(products) && products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.productType.base_type}</TableCell>
                <TableCell>{product.productType.name}</TableCell>
                <TableCell>€{product.price.toFixed(2)}</TableCell>
                <TableCell>€{product.cost_price ? product.cost_price.toFixed(2) : '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleOpenProductDialog(product)}
                    >
                      Editar
                    </Button>
                    <Button 
                      color="error" 
                      size="small"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Apagar
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Product Type Dialog */}
      <Dialog open={openProductTypeDialog} onClose={() => { setOpenProductTypeDialog(false); setEditingProductType(null); }}>
        <DialogTitle>{editingProductType ? 'Editar Tipo de Produto' : 'Adicionar Tipo de Produto'}</DialogTitle>
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
          {/* Removido do Admin conforme pedido: seleção de Tipo Base */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo Pai (Opcional)</InputLabel>
            <Select
              value={newProductTypeParentId === '' ? '' : String(newProductTypeParentId)}
              label="Tipo Pai (Opcional)"
              onChange={(e) => setNewProductTypeParentId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <MenuItem value="">— Sem Pai —</MenuItem>
              {flattenTypes(Array.isArray(productTypes) ? productTypes : []).map((pt) => (
                <MenuItem key={pt.id} value={pt.id}>{pt.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenProductTypeDialog(false); setEditingProductType(null); }}>Cancelar</Button>
          <Button onClick={handleCreateOrUpdateProductType}>{editingProductType ? 'Guardar' : 'Criar'}</Button>
        </DialogActions>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)}>
        <DialogTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
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
              subtitle="Escolhe uma imagem ou arrasta-a para aqui"
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
              {flattenTypes(Array.isArray(productTypes) ? productTypes : []).map((type) => (
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
          {/* Removed "Número" field from Add/Edit Product as requested */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog}>Cancelar</Button>
          <Button onClick={handleSaveProduct}>
            {editingProduct ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

export default ProductManagement; 