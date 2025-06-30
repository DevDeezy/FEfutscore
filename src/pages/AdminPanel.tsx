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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchOrders, updateOrderStatus } from '../store/slices/orderSlice';
import { AppDispatch } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../api';
// @ts-ignore
import { saveAs } from 'file-saver';
import { Order, OrderItem, Pack, PackItem } from '../types';
import ProductManagement from '../components/ProductManagement';

const AdminPanel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders } = useSelector((state: RootState) => state.order);
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const fullScreenDialog = useMediaQuery(theme.breakpoints.down('md'));

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
      setUsersError('Falha ao carregar os utilizadores');
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
      setPacksError('Falha ao carregar os packs');
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
      // Optimistically update local state
      const updatedOrders = orders.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: orderStatus } : o
      );
      // This part is tricky because Redux state is immutable.
      // A better way is to refetch orders or have the slice update the state.
      // For now, let's just close the dialog.
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
    if (orders.length === 0) {
      alert('Não há encomendas para exportar.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/.netlify/functions/exportorders`,
        { orders },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      saveAs(new Blob([response.data]), 'encomendas.xlsx');
    } catch (err) {
      console.error('Error exporting orders:', err);
      alert('Falha ao exportar encomendas. Veja a consola para mais detalhes.');
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
    } catch (err: any) {
      setShirtTypesError('Falha ao carregar os tipos de camisola');
      setShirtTypes([]);
    }
    setShirtTypesLoading(false);
  };

  const handleOpenShirtTypeDialog = (shirtType: any | null = null) => {
    setEditingShirtType(shirtType);
    setShirtTypeForm(shirtType ? { name: shirtType.name, price: shirtType.price } : { name: '', price: 0 });
    setOpenShirtTypeDialog(true);
  };

  const handleSaveShirtType = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editingShirtType ? 'put' : 'post';
      const url = editingShirtType
        ? `${API_BASE_URL}/.netlify/functions/updateShirtType/${editingShirtType.id}`
        : `${API_BASE_URL}/.netlify/functions/createShirtType`;

      const res = await axios[method](url, shirtTypeForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (editingShirtType) {
        setShirtTypes(shirtTypes.map(st => st.id === editingShirtType.id ? res.data : st));
      } else {
        setShirtTypes([...shirtTypes, res.data]);
      }
      setOpenShirtTypeDialog(false);
      setEditingShirtType(null);
    } catch (err) {
      alert('Falha ao guardar o tipo de camisola');
    }
  };

  const handleDeleteShirtType = async (id: number) => {
    if (!window.confirm('Tem a certeza que quer apagar este tipo de camisola?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/.netlify/functions/deleteShirtType/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShirtTypes(shirtTypes.filter(st => st.id !== id));
    } catch (err) {
      alert('Falha ao apagar o tipo de camisola');
    }
  };

  const handleOpenOrderDialog = (order: Order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
    setOpenOrderDialog(true);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Painel de Administração
      </Typography>
      <Paper>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          aria-label="Admin tabs"
        >
          <Tab label="Pedidos" />
          <Tab label="Utilizadores" />
          <Tab label="Packs & Preços" />
          <Tab label="Tipos de Camisola" />
          <Tab label="Produtos" />
        </Tabs>

        {/* Orders Tab */}
        {tab === 0 && (
          <Box sx={{ p: isMobile ? 1 : 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: isMobile ? 'column' : 'row' }}>
              <Typography variant="h6">Todos os Pedidos</Typography>
              <Button variant="contained" onClick={handleExportOrders} sx={{ mt: isMobile ? 2 : 0 }}>Exportar para CSV</Button>
            </Box>
            <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
              <Table stickyHeader>
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
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.user?.email}</TableCell>
                      <TableCell>
                        <Typography
                          component="span"
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
                        </Typography>
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                      <TableCell>€{order.total_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleOpenOrderDialog(order)}>
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{ p: isMobile ? 1 : 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: isMobile ? 'column' : 'row' }}>
              <Typography variant="h6">Utilizadores</Typography>
              <Button variant="contained" onClick={() => setOpenAddUser(true)} sx={{ mt: isMobile ? 2 : 0 }}>Adicionar Utilizador</Button>
            </Box>
            {usersLoading ? <CircularProgress /> : usersError ? <Alert severity="error">{usersError}</Alert> : null}
            <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
              <Table stickyHeader>
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
                  {users.map((user, idx) => (
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Dialog open={openAddUser} onClose={() => setOpenAddUser(false)} fullScreen={fullScreenDialog}>
              <DialogTitle>Adicionar Novo Utilizador</DialogTitle>
              <DialogContent>
                <TextField
                  label="Endereço de Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={newUser.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <TextField
                  label="Palavra-passe"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={newUser.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Função</InputLabel>
                  <Select
                    value={newUser.role}
                    label="Função"
                    onChange={(e: any) => setNewUser({ ...newUser, role: e.target.value })}
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
          </Box>
        )}
        {tab === 2 && (
          <Box sx={{ p: isMobile ? 1 : 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: isMobile ? 'column' : 'row' }}>
              <Typography variant="h6">Packs</Typography>
              <Button variant="contained" onClick={() => handleOpenPackDialog(null)} sx={{ mt: isMobile ? 2 : 0 }}>Adicionar Pack</Button>
            </Box>
            {packsLoading ? <CircularProgress /> : packsError ? <Alert severity="error">{packsError}</Alert> :
              <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                <Table stickyHeader>
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
                        <TableCell>€{pack.price.toFixed(2)}</TableCell>
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
            }
            <Dialog open={openPackDialog} onClose={() => setOpenPackDialog(false)} fullScreen={fullScreenDialog} maxWidth="md" fullWidth>
              <DialogTitle>{editingPack ? 'Editar' : 'Criar'} Pack</DialogTitle>
              <DialogContent>
                <TextField
                  label="Nome do Pack"
                  fullWidth
                  margin="normal"
                  value={packForm.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackFormChange('name', e.target.value)}
                />
                <TextField
                  label="Preço"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={packForm.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackFormChange('price', Number(e.target.value))}
                />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Itens</Typography>
                {packForm.items.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Produto</InputLabel>
                      <Select
                        value={item.product_type}
                        label="Produto"
                        onChange={(e: any) => handlePackItemChange(idx, 'product_type', e.target.value)}
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
                          onChange={(e: any) => handlePackItemChange(idx, 'shirt_type_id', Number(e.target.value))}
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
                      sx={{ width: 100 }}
                      value={item.quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackItemChange(idx, 'quantity', Number(e.target.value))}
                      InputProps={{ inputProps: { min: 1 } }}
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
          </Box>
        )}
        {tab === 3 && (
          <Box sx={{ p: isMobile ? 1 : 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: isMobile ? 'column' : 'row' }}>
              <Typography variant="h6">Tipos de Camisola</Typography>
              <Button variant="contained" onClick={() => handleOpenShirtTypeDialog(null)} sx={{ mt: isMobile ? 2 : 0 }}>Adicionar Tipo</Button>
            </Box>
            {shirtTypesLoading ? <CircularProgress /> : shirtTypesError ? <Alert severity="error">{shirtTypesError}</Alert> :
              <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                <Table stickyHeader>
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
            }
            <Dialog open={openShirtTypeDialog} onClose={() => setOpenShirtTypeDialog(false)} fullScreen={fullScreenDialog}>
              <DialogTitle>{editingShirtType ? 'Editar' : 'Criar'} Tipo de Camisola</DialogTitle>
              <DialogContent>
                <TextField
                  label="Nome"
                  fullWidth
                  margin="normal"
                  value={shirtTypeForm.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShirtTypeForm({ ...shirtTypeForm, name: e.target.value })}
                />
                <TextField
                  label="Preço"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={shirtTypeForm.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShirtTypeForm({ ...shirtTypeForm, price: Number(e.target.value) })}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenShirtTypeDialog(false)}>Cancelar</Button>
                <Button onClick={handleSaveShirtType} variant="contained" color="primary">
                  Guardar
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {tab === 4 && (
          <Box sx={{ p: isMobile ? 1 : 3 }}>
            <ProductManagement />
          </Box>
        )}
      </Paper>
      
      {/* Dialogs */}
      <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)} fullScreen={fullScreenDialog} maxWidth="md" fullWidth>
        <DialogTitle>Detalhes do Pedido</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Morada de Entrega
              </Typography>
              <Box>
                <Typography component="p">{selectedOrder.address_nome}</Typography>
                <Typography component="p">{selectedOrder.address_morada}</Typography>
                <Typography component="p">{selectedOrder.address_codigo_postal} {selectedOrder.address_cidade}, {selectedOrder.address_distrito}</Typography>
                <Typography component="p">{selectedOrder.address_pais}</Typography>
                <Typography component="p">Telemóvel: {selectedOrder.address_telemovel}</Typography>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Itens da Encomenda</Typography>
                {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <Box key={idx} sx={{ border: '1px solid #eee', borderRadius: 2, p: 2, minWidth: 200 }}>
                        <Typography variant="subtitle2">{item.name || (item.product_type === 'tshirt' ? 'Camisola Personalizada' : 'Sapatilhas')}</Typography>
                        <Typography variant="body2">Tamanho: {item.size}</Typography>
                        <Typography variant="body2">Quantidade: {item.quantity || 1}</Typography>
                        {item.player_name && <Typography variant="body2">Nome do Jogador: {item.player_name}</Typography>}
                        {(item.image_front || item.image_back) && (
                           <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            {item.image_front && <Box component="img" src={item.image_front} alt="frente" sx={{ height: 60 }} />}
                            {item.image_back && <Box component="img" src={item.image_back} alt="costas" sx={{ height: 60 }} />}
                           </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : <Typography>Não há itens nesta encomenda.</Typography>}
              </Box>

              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Atualizar Estado</InputLabel>
                  <Select
                    value={orderStatus}
                    label="Atualizar Estado"
                    onChange={(e: any) => setOrderStatus(e.target.value)}
                  >
                    <MenuItem value="pending">Pendente</MenuItem>
                    <MenuItem value="processing">Em Processamento</MenuItem>
                    <MenuItem value="completed">Concluída</MenuItem>
                    <MenuItem value="cancelled">Cancelada</MenuItem>
                  </Select>
                </FormControl>
                {orderStatusError && <Alert severity="error" sx={{ mt: 1 }}>{orderStatusError}</Alert>}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrderDialog(false)}>Fechar</Button>
          <Button
            onClick={handleUpdateOrderStatus}
            variant="contained"
            disabled={orderStatusLoading}
          >
            {orderStatusLoading ? <CircularProgress size={24} /> : 'Atualizar Estado'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 