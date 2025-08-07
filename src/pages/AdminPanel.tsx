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
  Checkbox,
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
import { sendOrderEmail, EmailTemplateParams } from '../services/emailService';

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
    price: 0,
    cost_price: 0,
  });

  // Order details dialog state
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderStatusLoading, setOrderStatusLoading] = useState(false);
  const [orderStatusError, setOrderStatusError] = useState<string | null>(null);
  const [orderPrice, setOrderPrice] = useState<number>(0);
  const [orderPriceLoading, setOrderPriceLoading] = useState(false);
  const [orderPriceError, setOrderPriceError] = useState<string | null>(null);

  // Shirt Types state
  const [shirtTypes, setShirtTypes] = useState<any[]>([]);
  const [shirtTypesLoading, setShirtTypesLoading] = useState(false);
  const [shirtTypesError, setShirtTypesError] = useState<string | null>(null);
  const [openShirtTypeDialog, setOpenShirtTypeDialog] = useState(false);
  const [editingShirtType, setEditingShirtType] = useState<any | null>(null);
  const [shirtTypeForm, setShirtTypeForm] = useState({ name: '', price: 0, cost_price: 0 });

  const fullScreenDialog = useMediaQuery(theme.breakpoints.down('md'));

  const [statusFilter, setStatusFilter] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<
    'pending' | 'processing' | 'completed' | 'cancelled' | 'CSV' | 'Em Processamento' | 'Para analizar' | 'Em pagamento' | ''
  >('');
  const [bulkLoading, setBulkLoading] = useState(false);

  // Pricing Configuration state
  const [pricingConfigs, setPricingConfigs] = useState<any[]>([]);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Patches state
  const [patches, setPatches] = useState<any[]>([]);
  const [patchesLoading, setPatchesLoading] = useState(false);
  const [patchesError, setPatchesError] = useState<string | null>(null);
  const [openPatchDialog, setOpenPatchDialog] = useState(false);
  const [editingPatch, setEditingPatch] = useState<any | null>(null);
  const [patchForm, setPatchForm] = useState({ name: '', image: '', price: 0 });
  const [pricingError, setPricingError] = useState<string | null>(null);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };
  const handleSelectAllOrders = (checked: boolean) => {
    setSelectedOrderIds(checked ? filteredOrders.map((o) => o.id) : []);
  };
  const handleBulkStatusChange = (e: any) => setBulkStatus(e.target.value);
  const handleApplyBulkStatus = async () => {
    if (!bulkStatus || selectedOrderIds.length === 0) return;
    setBulkLoading(true);
    try {
      for (const orderId of selectedOrderIds) {
        await dispatch(updateOrderStatus({ orderId, status: bulkStatus }));
      }
      setSelectedOrderIds([]);
      setBulkStatus('');
      dispatch(fetchOrders());
    } finally {
      setBulkLoading(false);
    }
  };

  // Fetch orders, users, and packs on mount
  useEffect(() => {
    dispatch(fetchOrders());
    fetchUsers();
    fetchPacks();
    fetchShirtTypes();
    fetchPricingConfigs();
    fetchPatches();
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
        price: pack.price,
        cost_price: pack.cost_price || 0,
      });
    } else {
      setPackForm({
        name: '',
        items: [{ product_type: 'tshirt', quantity: 1, shirt_type_id: 0, shirt_type_name: '' }],
        price: 0,
        cost_price: 0,
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
      await dispatch(updateOrderStatus({ orderId: selectedOrder.id, status: orderStatus as 'pending' | 'processing' | 'completed' | 'cancelled' | 'Para analizar' | 'Em pagamento' }));
      
      // Send email notification if status is "Em pagamento"
      if (orderStatus === 'Em pagamento') {
        try {
          const user = users.find(u => u.id === selectedOrder.user_id);
          if (user && (user.email || user.userEmail)) {
            const emailToUse = user.userEmail || user.email;
            
            // Prepare email template parameters
            const templateParams: EmailTemplateParams = {
              order_number: selectedOrder.id.toString()
            };

            await sendOrderEmail(templateParams);
            console.log('Email sent successfully for order:', selectedOrder.id);
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          // Don't fail the entire request if email fails
        }
      }
      
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

  // Update order price
  const handleUpdateOrderPrice = async () => {
    if (!selectedOrder) return;
    setOrderPriceLoading(true);
    setOrderPriceError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/.netlify/functions/updateorderprice/${selectedOrder.id}`, 
        { total_price: orderPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(fetchOrders());
      setOrderPriceError(null);
    } catch (err: any) {
      setOrderPriceError(err.response?.data?.error || 'Falha ao atualizar o preço');
    } finally {
      setOrderPriceLoading(false);
    }
  };

  // Change status to "Em pagamento"
  const handleChangeToPayment = async () => {
    if (!selectedOrder) return;
    setOrderStatusLoading(true);
    setOrderStatusError(null);
    try {
      await dispatch(updateOrderStatus({ orderId: selectedOrder.id, status: 'Em pagamento' }));
      
      // Send email notification
      try {
        const user = users.find(u => u.id === selectedOrder.user_id);
        if (user && (user.email || user.userEmail)) {
          const emailToUse = user.userEmail || user.email;
          
          // Prepare email template parameters
          const templateParams: EmailTemplateParams = {
            order_number: selectedOrder.id.toString()
          };

          await sendOrderEmail(templateParams);
          console.log('Email sent successfully for order:', selectedOrder.id);
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the entire request if email fails
      }
      
      setOpenOrderDialog(false);
      dispatch(fetchOrders());
    } catch (err: any) {
      setOrderStatusError(err.response?.data?.error || 'Falha ao alterar o estado');
    } finally {
      setOrderStatusLoading(false);
    }
  };

  // Add to CSV handler
  const handleAddToCSV = async (orderId: string) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: 'CSV' }));
      dispatch(fetchOrders());
    } catch (err) {
      alert('Falha ao marcar encomenda para CSV');
    }
  };

  // Export only orders with status 'CSV'
  const handleExportOrders = async () => {
    const csvOrders = orders.filter((o) => o.status === 'CSV');
    if (csvOrders.length === 0) {
      alert('Não há encomendas marcadas para exportar.');
      return;
    }
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/.netlify/functions/exportorders`,
        { orders: csvOrders },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      saveAs(new Blob([response.data]), 'encomendas.xlsx');
      // After export, refresh orders (their status will be updated by backend)
      dispatch(fetchOrders());
    } catch (err) {
      console.error('Error exporting orders:', err);
      alert('Falha ao exportar encomendas. Veja a consola para mais detalhes.');
    }
    setExporting(false);
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
    setShirtTypeForm(shirtType ? { name: shirtType.name, price: shirtType.price, cost_price: shirtType.cost_price || 0 } : { name: '', price: 0, cost_price: 0 });
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
    setOrderPrice(order.total_price);
    setOpenOrderDialog(true);
  };

  // Pricing Configuration functions
  const fetchPricingConfigs = async () => {
    setPricingLoading(true);
    setPricingError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getpricingconfig`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPricingConfigs(res.data);
    } catch (err: any) {
      setPricingError('Falha ao carregar configurações de preços');
      setPricingConfigs([]);
    }
    setPricingLoading(false);
  };

  const handleUpdatePricing = async (key: string, price: number, cost_price: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/.netlify/functions/updatepricingconfig`, 
        { key, price, cost_price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPricingConfigs(); // Refresh the list
    } catch (err: any) {
      alert('Falha ao atualizar configuração de preço');
    }
  };

  const handleUpdateUserEmail = async (userId: string, userEmail: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/.netlify/functions/updateuseremail/${userId}`, 
        { userEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      alert('Falha ao atualizar email do utilizador');
    }
  };

  const handleUpdateInstagramName = async (userId: string, instagramName: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/.netlify/functions/updateInstagramName/${userId}`, 
        { instagramName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      alert('Falha ao atualizar nome do Instagram');
    }
  };

  // Patch management functions
  const fetchPatches = async () => {
    setPatchesLoading(true);
    setPatchesError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/.netlify/functions/getPatches`);
      setPatches(response.data);
    } catch (error: any) {
      setPatchesError('Erro ao carregar patches');
      console.error('Error fetching patches:', error);
    } finally {
      setPatchesLoading(false);
    }
  };

  const handleDeletePatch = async (id: number) => {
    if (window.confirm('Tem a certeza que deseja eliminar este patch?')) {
      try {
        await axios.delete(`${API_BASE_URL}/.netlify/functions/deletePatch/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchPatches();
      } catch (error) {
        console.error('Error deleting patch:', error);
      }
    }
  };

  const handleOpenPatchDialog = (patch: any | null = null) => {
    if (patch) {
      setEditingPatch(patch);
      setPatchForm({ name: patch.name, image: patch.image, price: patch.price || 0 });
    } else {
      setEditingPatch(null);
      setPatchForm({ name: '', image: '', price: 0 });
    }
    setOpenPatchDialog(true);
  };

  const handleSavePatch = async () => {
    if (!patchForm.name || !patchForm.image) {
      alert('Nome e imagem são obrigatórios');
      return;
    }

    try {
      if (editingPatch) {
        // Update existing patch
        await axios.put(`${API_BASE_URL}/.netlify/functions/updatePatch/${editingPatch.id}`, patchForm, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      } else {
        // Create new patch
        await axios.post(`${API_BASE_URL}/.netlify/functions/createPatch`, patchForm, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }
      setOpenPatchDialog(false);
      fetchPatches();
    } catch (error) {
      console.error('Error saving patch:', error);
    }
  };

  // Filtered orders
  const filteredOrders = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

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
          <Tab label="Patches" />
          <Tab label="Configuração de Preços" />
        </Tabs>

        {/* Orders Tab */}
        {tab === 0 && (
          <Box sx={{ p: isMobile ? 1 : 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: isMobile ? 'column' : 'row' }}>
              <Typography variant="h6">Todos os Pedidos</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Filtrar por Estado</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Filtrar por Estado"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="pending">Pendente</MenuItem>
                    <MenuItem value="Para analizar">Para Analisar</MenuItem>
                    <MenuItem value="Em pagamento">Em Pagamento</MenuItem>
                    <MenuItem value="CSV">CSV</MenuItem>
                    <MenuItem value="Em Processamento">Em Processamento</MenuItem>
                    <MenuItem value="completed">Concluída</MenuItem>
                    <MenuItem value="cancelled">Cancelada</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={handleExportOrders} sx={{ mt: isMobile ? 2 : 0 }} disabled={exporting}>
                  Exportar para CSV
                </Button>
              </Box>
            </Box>
            {/* Bulk status update controls */}
            {statusFilter === 'all' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Alterar Estado Selecionados</InputLabel>
                  <Select
                    value={bulkStatus}
                    label="Alterar Estado Selecionados"
                    onChange={handleBulkStatusChange}
                  >
                    <MenuItem value="pending">Pendente</MenuItem>
                    <MenuItem value="Para analizar">Para Analisar</MenuItem>
                    <MenuItem value="Em pagamento">Em Pagamento</MenuItem>
                    <MenuItem value="processing">Em Processamento</MenuItem>
                    <MenuItem value="completed">Concluída</MenuItem>
                    <MenuItem value="cancelled">Cancelada</MenuItem>
                    <MenuItem value="CSV">CSV</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={bulkLoading || !bulkStatus || selectedOrderIds.length === 0}
                  onClick={handleApplyBulkStatus}
                >
                  {bulkLoading ? 'A atualizar...' : 'Aplicar Estado'}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {selectedOrderIds.length} selecionado(s)
                </Typography>
              </Box>
            )}
            <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedOrderIds.length > 0 && selectedOrderIds.length < filteredOrders.length}
                        checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                        onChange={e => handleSelectAllOrders(e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>ID da Encomenda</TableCell>
                    <TableCell>Utilizador</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Data de Criação</TableCell>
                    <TableCell>Preço</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} selected={selectedOrderIds.includes(order.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                        />
                      </TableCell>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.user?.email}${order.user?.instagramName ? ' (' + order.user.instagramName + ')' : ''}</TableCell>
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
                              : order.status === 'Para analizar'
                              ? 'purple'
                              : order.status === 'Em pagamento'
                              ? 'red'
                              : order.status === 'Em Processamento'
                              ? 'blue'
                              : order.status === 'completed'
                              ? 'green'
                              : order.status === 'CSV'
                              ? 'brown'
                              : 'red',
                          }}
                        >
                          {order.status === 'pending' ? 'Pendente' :
                            order.status === 'Para analizar' ? 'Para Analisar' :
                            order.status === 'Em pagamento' ? 'Em Pagamento' :
                            order.status === 'Em Processamento' ? 'Em Processamento' :
                            order.status === 'completed' ? 'Concluída' :
                            order.status === 'CSV' ? 'CSV' :
                            order.status === 'cancelled' ? 'Cancelada' :
                            order.status}
                        </Typography>
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                      <TableCell>€{order.total_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleOpenOrderDialog(order)} sx={{ mr: 1 }}>
                          Detalhes
                        </Button>
                        {order.status !== 'CSV' && order.status !== 'Para analizar' && order.status !== 'Em pagamento' && order.status !== 'Em Processamento' && order.status !== 'completed' && order.status !== 'cancelled' && (
                          <Button onClick={() => handleAddToCSV(order.id.toString())} color="secondary" variant="outlined">
                            Adicionar ao CSV
                          </Button>
                        )}
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
                      <TableCell>Email Notificações</TableCell>
                      <TableCell>Instagram</TableCell>
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
                        <TableCell>
                          <TextField
                            size="small"
                            value={user.userEmail || ''}
                            onChange={(e) => handleUpdateUserEmail(user._id || user.id, e.target.value)}
                            placeholder="Email para notificações"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={user.instagramName || ''}
                            onChange={(e) => handleUpdateInstagramName(user._id || user.id, e.target.value)}
                            placeholder="Nome Instagram"
                          />
                        </TableCell>
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
                      <TableCell>Preço Custo</TableCell>
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
                        <TableCell>€{pack.cost_price ? pack.cost_price.toFixed(2) : '-'}</TableCell>
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
                <TextField
                  label="Preço Custo"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={packForm.cost_price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePackFormChange('cost_price', Number(e.target.value))}
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

        {/* Patch Dialog - Moved outside tabs so it can be accessed from any tab */}
        <Dialog 
          open={openPatchDialog} 
          onClose={() => setOpenPatchDialog(false)} 
          fullScreen={fullScreenDialog} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            {editingPatch ? 'Editar' : 'Criar'} Patch
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Nome do Patch"
              fullWidth
              margin="normal"
              value={patchForm.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatchForm({ ...patchForm, name: e.target.value })}
            />
            <TextField
              label="URL da Imagem"
              fullWidth
              margin="normal"
              value={patchForm.image}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatchForm({ ...patchForm, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <TextField
              label="Preço (€)"
              type="number"
              fullWidth
              margin="normal"
              value={patchForm.price}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatchForm({ ...patchForm, price: Number(e.target.value) })}
              inputProps={{ step: 0.01, min: 0 }}
            />
            {patchForm.image && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Pré-visualização:</Typography>
                <Box
                  component="img"
                  src={patchForm.image}
                  alt="Preview"
                  sx={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain', border: '1px solid #eee', borderRadius: 1 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPatchDialog(false)}>Cancelar</Button>
            <Button onClick={handleSavePatch} variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
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
                      <TableCell>Preço Custo</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shirtTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell>{type.name}</TableCell>
                        <TableCell>€{type.price.toFixed(2)}</TableCell>
                        <TableCell>€{type.cost_price ? type.cost_price.toFixed(2) : '-'}</TableCell>
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
                <TextField
                  label="Preço Custo"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={shirtTypeForm.cost_price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShirtTypeForm({ ...shirtTypeForm, cost_price: Number(e.target.value) })}
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
        {tab === 5 && (
          <Box sx={{ p: isMobile ? 1 : 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: isMobile ? 'column' : 'row' }}>
              <Typography variant="h6">Gestão de Patches</Typography>
              <Button 
                variant="contained" 
                onClick={() => handleOpenPatchDialog()}
              >
                Adicionar Patch
              </Button>
            </Box>
            {patchesLoading ? (
              <CircularProgress />
            ) : patchesError ? (
              <Alert severity="error">{patchesError}</Alert>
            ) : (
              <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Imagem</TableCell>
                      <TableCell>Preço (€)</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patches.map((patch) => (
                      <TableRow key={patch.id}>
                        <TableCell>{patch.name}</TableCell>
                        <TableCell>
                          <Box
                            component="img"
                            src={patch.image}
                            alt={patch.name}
                            sx={{ width: 60, height: 60, objectFit: 'contain', border: '1px solid #eee', borderRadius: 1 }}
                          />
                        </TableCell>
                        <TableCell>{patch.price || 0}</TableCell>
                        <TableCell>
                          <Typography
                            component="span"
                            style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              color: 'white',
                              backgroundColor: patch.active ? 'green' : 'red',
                            }}
                          >
                            {patch.active ? 'Ativo' : 'Inativo'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleOpenPatchDialog(patch)}
                            sx={{ mr: 1 }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeletePatch(patch.id)}
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
        {tab === 6 && (
          <Box sx={{ p: isMobile ? 1 : 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: isMobile ? 'column' : 'row' }}>
              <Typography variant="h6">Configuração de Preços</Typography>
            </Box>
            {pricingLoading ? <CircularProgress /> : pricingError ? <Alert severity="error">{pricingError}</Alert> :
              <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Preço de Venda (€)</TableCell>
                      <TableCell>Preço de Custo (€)</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { key: 'patch_price', name: 'Preço por Patch', defaultPrice: 2, defaultCost: 1 },
                      { key: 'number_price', name: 'Preço por Número', defaultPrice: 3, defaultCost: 1.5 },
                      { key: 'name_price', name: 'Preço por Nome', defaultPrice: 3, defaultCost: 1.5 },
                    ].map((item) => {
                      const config = pricingConfigs.find(c => c.key === item.key);
                      return (
                        <TableRow key={item.key}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={config?.price || item.defaultPrice}
                              onChange={(e) => {
                                const newPrice = parseFloat(e.target.value) || 0;
                                const newCost = config?.cost_price || item.defaultCost;
                                handleUpdatePricing(item.key, newPrice, newCost);
                              }}
                              inputProps={{ step: 0.01, min: 0 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={config?.cost_price || item.defaultCost}
                              onChange={(e) => {
                                const newCost = parseFloat(e.target.value) || 0;
                                const newPrice = config?.price || item.defaultPrice;
                                handleUpdatePricing(item.key, newPrice, newCost);
                              }}
                              inputProps={{ step: 0.01, min: 0 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              Atualizado automaticamente
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            }
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
                        {/* PATCH IMAGES SECTION */}
                        {(item.patch_images ?? []).length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                              Patches:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {(item.patch_images ?? []).map((img: string, pidx: number) => (
                                <Box key={pidx} sx={{ display: 'inline-block' }}>
                                  <Box component="img" src={img} alt={`patch ${pidx + 1}`} sx={{ height: 40, border: '1px solid #ccc', borderRadius: 1 }} />
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                        {/* END PATCH IMAGES SECTION */}
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
                    <MenuItem value="Para analizar">Para Analisar</MenuItem>
                    <MenuItem value="Em pagamento">Em Pagamento</MenuItem>
                    <MenuItem value="processing">Em Processamento</MenuItem>
                    <MenuItem value="completed">Concluída</MenuItem>
                    <MenuItem value="cancelled">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                {orderStatusError && <Alert severity="error" sx={{ mt: 1 }}>{orderStatusError}</Alert>}
              </Box>

              {/* Price update section - only show for "Para analizar" orders */}
              {selectedOrder?.status === 'Para analizar' && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Definir Preço</Typography>
                  <TextField
                    fullWidth
                    label="Preço Total (€)"
                    type="number"
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(parseFloat(e.target.value) || 0)}
                    inputProps={{ step: 0.01, min: 0 }}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateOrderPrice}
                    disabled={orderPriceLoading}
                    sx={{ mr: 2 }}
                  >
                    {orderPriceLoading ? <CircularProgress size={24} /> : 'Atualizar Preço'}
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleChangeToPayment}
                    disabled={orderStatusLoading}
                    sx={{ mr: 2 }}
                  >
                    {orderStatusLoading ? <CircularProgress size={24} /> : 'Mudar para Em Pagamento'}
                  </Button>
                  {orderPriceError && <Alert severity="error" sx={{ mt: 1 }}>{orderPriceError}</Alert>}
                </Box>
              )}
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