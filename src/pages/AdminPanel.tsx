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
  const [packForm, setPackForm] = useState<Omit<Pack, '_id'>>({
    name: '',
    items: [{ product_type: 'tshirt', quantity: 1, shirt_type: 'New' }],
    price: 0
  });

  // Order details dialog state
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderStatusLoading, setOrderStatusLoading] = useState(false);
  const [orderStatusError, setOrderStatusError] = useState<string | null>(null);

  // Fetch orders, users, and packs on mount
  useEffect(() => {
    dispatch(fetchOrders());
    fetchUsers();
    fetchPacks();
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
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/.netlify/functions/deleteUser/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id && u.id !== id));
    } catch (err) {
      alert('Failed to delete user');
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
      alert('Failed to add user');
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

  const handleDeletePack = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pack?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/.netlify/functions/deletepack/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPacks(packs.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete pack');
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
        items: [{ product_type: 'tshirt', quantity: 1, shirt_type: 'New' }],
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
      items: prev.items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  };

  const handleAddPackItem = () => {
    setPackForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_type: 'tshirt', quantity: 1, shirt_type: 'New' }]
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
        const res = await axios.put(`${API_BASE_URL}/.netlify/functions/updatepack/${editingPack.id}`, packForm, {
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
      alert('Failed to save pack');
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    setOrderStatusLoading(true);
    setOrderStatusError(null);
    try {
      await dispatch(updateOrderStatus({ orderId: selectedOrder._id || selectedOrder.id, status: orderStatus as 'pending' | 'processing' | 'completed' | 'cancelled' }));
      setOpenOrderDialog(false);
      dispatch(fetchOrders());
    } catch (err) {
      setOrderStatusError('Failed to update order status');
    }
    setOrderStatusLoading(false);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Orders" />
          <Tab label="Users" />
          <Tab label="Packs & Prices" />
        </Tabs>
        {tab === 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" color="primary" onClick={handleExportOrders}>
                Export Orders to Excel
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(orders) && orders.length > 0 ? (
                    orders.map((order, idx) => (
                      <TableRow key={order._id || idx}>
                        <TableCell>{order._id}</TableCell>
                        <TableCell>
                          {typeof order.user === 'object'
                            ? ((order.user as any)?.email || (order.user as any)?.id || JSON.stringify(order.user))
                            : order.user}
                        </TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell>{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</TableCell>
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
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
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
              <Typography variant="h6">Users</Typography>
              <Button variant="contained" onClick={() => setOpenAddUser(true)}>
                Add User
              </Button>
            </Box>
            {usersLoading ? <CircularProgress /> : usersError ? <Alert severity="error">{usersError}</Alert> : null}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map((user, idx) => (
                      <TableRow key={user._id || user.id || idx}>
                        <TableCell>{typeof user.email === 'string' ? user.email : ''}</TableCell>
                        <TableCell>{typeof user.role === 'string' ? user.role : ''}</TableCell>
                        <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</TableCell>
                        <TableCell>
                          <Button color="error" onClick={() => handleDeleteUser(user._id || user.id)}>
                            Delete
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
              <DialogTitle>Add User</DialogTitle>
              <DialogContent>
                <TextField
                  label="Email"
                  fullWidth
                  margin="normal"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={newUser.role}
                    label="Role"
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenAddUser(false)}>Cancel</Button>
                <Button onClick={handleAddUser} variant="contained">Add</Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        {tab === 2 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" color="primary" onClick={() => handleOpenPackDialog()}>
                Add New Pack
              </Button>
            </Box>
            {packsLoading ? (
              <CircularProgress />
            ) : packsError ? (
              <Alert severity="error">{packsError}</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {packs.map((pack) => (
                      <TableRow key={pack.id}>
                        <TableCell>{pack.name}</TableCell>
                        <TableCell>
                          {pack.items.map((item, idx) => (
                            <Box key={idx} sx={{ mb: 1 }}>
                              {item.quantity}x {item.product_type === 'tshirt' ? 'T-Shirt' : 'Shoes'}
                              {item.product_type === 'tshirt' && item.shirt_type && ` (${item.shirt_type})`}
                            </Box>
                          ))}
                        </TableCell>
                        <TableCell>${pack.price}</TableCell>
                        <TableCell>
                          <Button onClick={() => handleOpenPackDialog(pack)} sx={{ mr: 1 }}>
                            Edit
                          </Button>
                          <Button onClick={() => handleDeletePack(pack.id)} color="error">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Dialog open={openPackDialog} onClose={() => setOpenPackDialog(false)} maxWidth="md" fullWidth>
              <DialogTitle>{editingPack ? 'Edit Pack' : 'Add Pack'}</DialogTitle>
              <DialogContent>
                <TextField
                  label="Name"
                  fullWidth
                  margin="normal"
                  value={packForm.name}
                  onChange={(e) => handlePackFormChange('name', e.target.value)}
                />
                <TextField
                  label="Price"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={packForm.price}
                  onChange={(e) => handlePackFormChange('price', Number(e.target.value))}
                />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Items</Typography>
                {packForm.items.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Product</InputLabel>
                      <Select
                        value={item.product_type}
                        label="Product"
                        onChange={(e) => handlePackItemChange(idx, 'product_type', e.target.value)}
                      >
                        <MenuItem value="tshirt">T-Shirt</MenuItem>
                        <MenuItem value="shoes">Shoes</MenuItem>
                      </Select>
                    </FormControl>
                    {item.product_type === 'tshirt' && (
                      <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Shirt Type</InputLabel>
                        <Select
                          value={item.shirt_type}
                          label="Shirt Type"
                          onChange={(e) => handlePackItemChange(idx, 'shirt_type', e.target.value)}
                        >
                          <MenuItem value="Old">Old</MenuItem>
                          <MenuItem value="New">New</MenuItem>
                          <MenuItem value="Icon">Icon</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                    <TextField
                      label="Quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handlePackItemChange(idx, 'quantity', Number(e.target.value))}
                      sx={{ width: 100 }}
                    />
                    <Button onClick={() => handleRemovePackItem(idx)} color="error">
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button onClick={handleAddPackItem} sx={{ mt: 1 }}>
                  Add Item
                </Button>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenPackDialog(false)}>Cancel</Button>
                <Button onClick={handleSavePack} variant="contained" color="primary">
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        {/* Order Details Dialog */}
        <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Order ID: {selectedOrder._id || selectedOrder.id}
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
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Order Items</Typography>
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <Box key={idx} sx={{ border: '1px solid #eee', borderRadius: 2, p: 2, minWidth: 200 }}>
                          <Typography variant="subtitle2">{item.product_type === 'tshirt' ? 'T-Shirt' : 'Shoes'}</Typography>
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
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={orderStatus}
                      label="Status"
                      onChange={(e) => setOrderStatus(e.target.value)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                  {orderStatusError && <Alert severity="error" sx={{ mt: 2 }}>{orderStatusError}</Alert>}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenOrderDialog(false)}>Close</Button>
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