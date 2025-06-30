import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchOrders, updateOrderStatus } from '../store/slices/orderSlice';
import { AppDispatch } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import * as XLSX from 'xlsx';
import { OrderItem, Pack, PackItem } from '../types';
import ProductManagement from '../components/ProductManagement';

const AdminPanel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders } = useSelector((state: RootState) => state.order);
  const [tab, setTab] = useState(0);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });

  // Packs state
  const [packs, setPacks] = useState<Pack[]>([]);
  const [packsLoading, setPacksLoading] = useState(false);
  const [packsError, setPacksError] = useState<string | null>(null);
  const [openPackDialog, setOpenPackDialog] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [packForm, setPackForm] = useState<Omit<Pack, 'id'>>({
    name: '',
    items: [{ product_type: 'tshirt', quantity: 1, shirt_type_id: 0, shirt_type_name: '' }],
    price: 0
  });

  // Order details dialog state
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderStatusLoading, setOrderStatusLoading] = useState(false);
  const [orderStatusError, setOrderStatusError] = useState<string | null>(null);

  // Shirt Types state
  const [shirtTypes, setShirtTypes] = useState<any[]>([]);
  const [shirtTypesLoading, setShirtTypesLoading] = useState(false);
  const [shirtTypesError, setShirtTypesError] = useState<string | null>(null);
  const [openShirtTypeDialog, setOpenShirtTypeDialog] = useState(false);
  const [editingShirtType, setEditingShirtType] = useState<any | null>(null);
  const [shirtTypeForm, setShirtTypeForm] = useState({ name: '', price: 0 });

  // Fetch orders, users, and packs on mount
  useEffect(() => {
    dispatch(fetchOrders());
    fetchUsers();
    fetchPacks();
    fetchShirtTypes();
    // eslint-disable-next-line
  }, [dispatch]);

  // USERS
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getusers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err: any) {
      setUsersError('Failed to fetch users');
      setUsers([]);
    }
    setUsersLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Tem a certeza que quer apagar este utilizador?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/.netlify/functions/deleteUser/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id && u.id !== id));
    } catch (err) {
      alert('Falha ao apagar o utilizador');
    }
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/.netlify/functions/createuser`,
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers([...users, res.data]);
      setOpenAddUser(false);
      setNewUser({ email: '', password: '', role: 'user' });
    } catch (err) {
      alert('Falha ao adicionar o utilizador');
    }
  };

  // PACKS
  const fetchPacks = async () => {
    setPacksLoading(true);
    setPacksError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getpacks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPacks(res.data);
    } catch (err: any) {
      setPacksError('Failed to fetch packs');
      setPacks([]);
    }
    setPacksLoading(false);
  };

  const handleDeletePack = async (id: number) => {
    if (!window.confirm('Tem a certeza que quer apagar este pack?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/.netlify/functions/deletepack/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPacks(packs.filter((p) => p.id !== id));
    } catch (err) {
      alert('Falha ao apagar o pack');
    }
  };

  const handleOpenPackDialog = (pack: Pack | null = null) => {
    setEditingPack(pack);
    if (pack) {
      setPackForm({
        name: pack.name,
        items: pack.items,
        price: pack.price
      });
    } else {
      setPackForm({
        name: '',
        items: [{ product_type: 'tshirt', quantity: 1, shirt_type_id: 0, shirt_type_name: '' }],
        price: 0
      });
    }
    setOpenPackDialog(true);
  };

  const handlePackFormChange = (field: string, value: any) => {
    setPackForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePackItemChange = (idx: number, field: string, value: any) => {
    setPackForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== idx) return item;
        if (field === 'shirt_type_id') {
          const selected = shirtTypes.find((t) => t.id === value);
          return {
            ...item,
            shirt_type_id: selected?.id,
            shirt_type_name: selected?.name,
          };
        }
        return { ...item, [field]: value };
      }),
    }));
  };

  const handleAddPackItem = () => {
    setPackForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_type: 'tshirt',
          quantity: 1,
          shirt_type_id: shirtTypes[0]?.id,
          shirt_type_name: shirtTypes[0]?.name,
        },
      ],
    }));
  };

  const handleRemovePackItem = (idx: number) => {
    setPackForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleSavePack = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editingPack) {
        // Update
        const res = await axios.put(`${API_BASE_URL}/.netlify/functions/updatepack/${editingPack.id.toString()}`, packForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPacks(packs.map((p) => (p.id === editingPack.id ? res.data : p)));
      } else {
        // Create
        const res = await axios.post(`${API_BASE_URL}/.netlify/functions/createpack`, packForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPacks([...packs, res.data]);
      }
      setOpenPackDialog(false);
      setEditingPack(null);
    } catch (err) {
      alert('Falha ao guardar o pack');
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    setOrderStatusLoading(true);
    setOrderStatusError(null);
    try {
      await dispatch(updateOrderStatus({ orderId: selectedOrder.id, status: orderStatus as 'pending' | 'processing' | 'completed' | 'cancelled' }));
      setOpenOrderDialog(false);
      dispatch(fetchOrders());
    } catch (err: any) {
      setOrderStatusError(err.response?.data?.error || 'Falha ao atualizar o estado');
    } finally {
      setOrderStatusLoading(false);
    }
  };

  // Export orders to Excel (call backend endpoint and download file)
  const handleExportOrders = async () => {
    try {
      const response = await fetch('https://befutscore.netlify.app/.netlify/functions/exportorders', {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to generate Excel');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders_with_images.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Failed to export orders: ' + message);
    }
  };

  // Shirt Types
  const fetchShirtTypes = async () => {
    setShirtTypesLoading(true);
    setShirtTypesError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getShirtTypes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShirtTypes(res.data);
    } catch (err) {
      setShirtTypesError('Failed to fetch shirt types');
      setShirtTypes([]);
    }
    setShirtTypesLoading(false);
  };

  const handleOpenShirtTypeDialog = (shirtType: any | null = null) => {
    setEditingShirtType(shirtType);
    if (shirtType) {
      setShirtTypeForm({ name: shirtType.name, price: shirtType.price });
    } else {
      setShirtTypeForm({ name: '', price: 0 });
    }
    setOpenShirtTypeDialog(true);
  };

  const handleSaveShirtType = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editingShirtType) {
        // Update
        const res = await axios.put(`${API_BASE_URL}/.netlify/functions/updateShirtType/${editingShirtType.id}`, shirtTypeForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShirtTypes(shirtTypes.map((t) => (t.id === editingShirtType.id ? res.data : t)));
      } else {
        // Create
        const res = await axios.post(`${API_BASE_URL}/.netlify/functions/createShirtType`, shirtTypeForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShirtTypes([...shirtTypes, res.data]);
      }
      setOpenShirtTypeDialog(false);
      setEditingShirtType(null);
    } catch (err) {
      alert('Failed to save shirt type');
    }
  };

  const handleDeleteShirtType = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this shirt type?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/.netlify/functions/deleteShirtType/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShirtTypes(shirtTypes.filter((t) => t.id !== id));
    } catch (err) {
      alert('Failed to delete shirt type');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Painel de Administração
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Encomendas" />
          <Tab label="Utilizadores" />
          <Tab label="Packs & Preços" />
          <Tab label="Tipos de Camisola" />
          <Tab label="Produtos" />
        </Tabs>
        {tab === 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" color="primary" onClick={handleExportOrders}>
                Exportar Encomendas para Excel
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID da Encomenda</TableCell>
                    <TableCell>Utilizador</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Data de Criação</TableCell>
                    <TableCell>Preço</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(orders) && orders.length > 0 ? (
                    orders.map((order, idx) => (
                      <TableRow key={order.id || idx}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>
                          {typeof order.user === 'object'
                            ? ((order.user as any)?.email || (order.user as any)?.id || JSON.stringify(order.user))
                            : order.user}
                        </TableCell>
                        <TableCell>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              color: 'white',
                              backgroundColor:
                                order.status === 'pending'
                                  ? 'orange'
                                  : order.status === 'processing'
                                  ? 'blue'
                                  : order.status === 'completed'
                                  ? 'green'
                                  : 'red',
                            }}
                          >
                            {order.status === 'pending' ? 'Pendente' :
                             order.status === 'processing' ? 'Em Processamento' :
                             order.status === 'completed' ? 'Concluída' :
                             order.status === 'cancelled' ? 'Cancelada' :
                             order.status}
                          </span>
                        </TableCell>
                        <TableCell>{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</TableCell>
                        <TableCell>{order.total_price !== undefined ? `€${order.total_price.toFixed(2)}` : '-'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedOrder(order);
                              setOrderStatus(order.status);
                              setOpenOrderDialog(true);
                            }}
                          >
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
        {tab === 1 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Utilizadores</Typography>
              <Button variant="contained" onClick={() => setOpenAddUser(true)}>
                Adicionar Utilizador
              </Button>
            </Box>
            {usersLoading ? <CircularProgress /> : usersError ? <Alert severity="error">{usersError === 'Failed to fetch users' ? 'Falha ao carregar os utilizadores' : usersError}</Alert> : null}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Função</TableCell>
                    <TableCell>Data de Criação</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map((user, idx) => (
                      <TableRow key={user._id || user.id || idx}>
                        <TableCell>{typeof user.id === 'string' ? user.id : ''}</TableCell>
                        <TableCell>{typeof user.email === 'string' ? user.email : ''}</TableCell>
                        <TableCell>{typeof user.role === 'string' ? user.role : ''}</TableCell>
                        <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</TableCell>
                        <TableCell>
                          <Button color="error" onClick={() => handleDeleteUser(user._id || user.id)}>
                            Apagar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Dialog open={openAddUser} onClose={() => setOpenAddUser(false)}>
              <DialogTitle>Adicionar Novo Utilizador</DialogTitle>
              <DialogContent>
                <TextField
                  label="Endereço de Email"
                  fullWidth
                  margin="normal"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <TextField
                  label="Palavra-passe"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Função</InputLabel>
                  <Select
                    value={newUser.role}
                    label="Função"
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <MenuItem value="user">Utilizador</MenuItem>
                    <MenuItem value="admin">Administrador</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenAddUser(false)}>Cancelar</Button>
                <Button onClick={handleAddUser} variant="contained">Adicionar</Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        {tab === 2 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" color="primary" onClick={() => handleOpenPackDialog()}>
                Adicionar Novo Pack
              </Button>
            </Box>
            {packsLoading ? (
              <CircularProgress />
            ) : packsError ? (
              <Alert severity="error">{packsError === 'Failed to fetch packs' ? 'Falha ao carregar os packs' : packsError}</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Itens</TableCell>
                      <TableCell>Preço</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {packs.map((pack) => (
                      <TableRow key={pack.id}>
                        <TableCell>{pack.name}</TableCell>
                        <TableCell>
                          {pack.items.map((item, idx) => (
                            <Box key={idx} sx={{ mb: 1 }}>
                              {item.quantity}x {item.product_type === 'tshirt' ? 'Camisola' : 'Sapatilhas'}
                              {item.product_type === 'tshirt' && item.shirt_type_name && ` (${item.shirt_type_name})`}
                            </Box>
                          ))}
                        </TableCell>
                        <TableCell>${pack.price}</TableCell>
                        <TableCell>
                          <Button onClick={() => handleOpenPackDialog(pack)} sx={{ mr: 1 }}>
                            Editar
                          </Button>
                          <Button onClick={() => handleDeletePack(pack.id)} color="error">
                            Apagar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Dialog open={openPackDialog} onClose={() => setOpenPackDialog(false)} maxWidth="md" fullWidth>
              <DialogTitle>{editingPack ? 'Editar Pack' : 'Adicionar Novo Pack'}</DialogTitle>
              <DialogContent>
                <TextField
                  label="Nome do Pack"
                  fullWidth
                  margin="normal"
                  value={packForm.name}
                  onChange={(e) => handlePackFormChange('name', e.target.value)}
                />
                <TextField
                  label="Preço"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={packForm.price}
                  onChange={(e) => handlePackFormChange('price', Number(e.target.value))}
                />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Itens</Typography>
                {packForm.items.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Produto</InputLabel>
                      <Select
                        value={item.product_type}
                        label="Produto"
                        onChange={(e) => handlePackItemChange(idx, 'product_type', e.target.value)}
                      >
                        <MenuItem value="tshirt">Camisola</MenuItem>
                        <MenuItem value="shoes">Sapatilhas</MenuItem>
                      </Select>
                    </FormControl>
                    {item.product_type === 'tshirt' && (
                      <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Tipo de Camisola</InputLabel>
                        <Select
                          value={item.shirt_type_id ?? ''}
                          label="Tipo de Camisola"
                          onChange={(e) => handlePackItemChange(idx, 'shirt_type_id', Number(e.target.value))}
                          disabled={shirtTypesLoading || shirtTypesError !== null}
                        >
                          {shirtTypes.map((type) => (
                            <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    <TextField
                      label="Quantidade"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handlePackItemChange(idx, 'quantity', Number(e.target.value))}
                      sx={{ width: 100 }}
                    />
                    <Button onClick={() => handleRemovePackItem(idx)} color="error">
                      Remover
                    </Button>
                  </Box>
                ))}
                <Button onClick={handleAddPackItem} sx={{ mt: 1 }}>
                  Adicionar Item
                </Button>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenPackDialog(false)}>Cancelar</Button>
                <Button onClick={handleSavePack} variant="contained" color="primary">
                  Guardar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        {tab === 3 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" color="primary" onClick={() => handleOpenShirtTypeDialog()}>
                Adicionar Novo Tipo de Camisola
              </Button>
            </Box>
            {shirtTypesLoading ? (
              <CircularProgress />
            ) : shirtTypesError ? (
              <Alert severity="error">{shirtTypesError === 'Failed to fetch shirt types' ? 'Falha ao carregar os tipos de camisola' : shirtTypesError}</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Preço</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shirtTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell>{type.name}</TableCell>
                        <TableCell>€{type.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button onClick={() => handleOpenShirtTypeDialog(type)} sx={{ mr: 1 }}>
                            Editar
                          </Button>
                          <Button onClick={() => handleDeleteShirtType(type.id)} color="error">
                            Apagar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Dialog open={openShirtTypeDialog} onClose={() => setOpenShirtTypeDialog(false)} maxWidth="xs" fullWidth>
              <DialogTitle>{editingShirtType ? 'Editar Tipo de Camisola' : 'Adicionar Novo Tipo de Camisola'}</DialogTitle>
              <DialogContent>
                <TextField
                  label="Nome"
                  fullWidth
                  margin="normal"
                  value={shirtTypeForm.name}
                  onChange={(e) => setShirtTypeForm({ ...shirtTypeForm, name: e.target.value })}
                />
                <TextField
                  label="Preço"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={shirtTypeForm.price}
                  onChange={(e) => setShirtTypeForm({ ...shirtTypeForm, price: Number(e.target.value) })}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenShirtTypeDialog(false)}>Cancelar</Button>
                <Button onClick={handleSaveShirtType} variant="contained" color="primary">
                  Guardar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        {tab === 4 && (
          <ProductManagement />
        )}
        {/* Order Details Dialog */}
        <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Detalhes da Encomenda</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Order ID: {selectedOrder.id}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  User: {
                    typeof selectedOrder.user === 'object'
                      ? ((selectedOrder.user as any)?.email || (selectedOrder.user as any)?.id || JSON.stringify(selectedOrder.user))
                      : selectedOrder.user
                  }
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Status: {selectedOrder.status}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Created At: {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : ''}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Price: {selectedOrder.total_price !== undefined ? `€${selectedOrder.total_price.toFixed(2)}` : '-'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Itens</Typography>
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <Box key={idx} sx={{ border: '1px solid #eee', borderRadius: 2, p: 2, minWidth: 200 }}>
                          <Typography variant="subtitle2">{item.product_type === 'tshirt' ? 'Camisola' : 'Sapatilhas'}</Typography>
                          <Typography variant="body2">Size: {item.size}</Typography>
                          {item.player_name && <Typography variant="body2">Player Name: {item.player_name}</Typography>}
                          {item.image_front && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption">Front Image:</Typography>
                              <img
                                src={item.image_front}
                                alt="Front"
                                style={{ width: 120, height: 120, objectFit: 'contain', border: '1px solid #ccc', borderRadius: 4 }}
                              />
                            </Box>
                          )}
                          {item.product_type === 'tshirt' && item.image_back && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption">Back Image:</Typography>
                              <img
                                src={item.image_back}
                                alt="Back"
                                style={{ width: 120, height: 120, objectFit: 'contain', border: '1px solid #ccc', borderRadius: 4 }}
                              />
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography>No items found for this order.</Typography>
                  )}
                </Box>
                <Box sx={{ mt: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Atualizar Estado</InputLabel>
                    <Select
                      value={orderStatus}
                      label="Atualizar Estado"
                      onChange={(e) => setOrderStatus(e.target.value)}
                    >
                      <MenuItem value="pending">Pendente</MenuItem>
                      <MenuItem value="processing">Em Processamento</MenuItem>
                      <MenuItem value="completed">Concluída</MenuItem>
                      <MenuItem value="cancelled">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                  {orderStatusError && <Alert severity="error" sx={{ mt: 2 }}>{orderStatusError}</Alert>}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenOrderDialog(false)}>Fechar</Button>
            <Button
              onClick={handleUpdateOrderStatus}
              variant="contained"
              disabled={orderStatusLoading || !selectedOrder || orderStatus === selectedOrder.status}
            >
              {orderStatusLoading ? 'Saving...' : 'Save Status'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminPanel; 