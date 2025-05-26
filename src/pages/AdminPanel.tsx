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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchOrders, updateOrderStatus } from '../store/slices/orderSlice';
import { Order } from '../types';
import { AppDispatch } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const AdminPanel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading } = useSelector((state: RootState) => state.order);

  // User management state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });
  const [tab, setTab] = useState(0);

  // Packs & Prices state
  const [packs, setPacks] = useState<any[]>([]);
  const [packsLoading, setPacksLoading] = useState(false);
  const [openPackDialog, setOpenPackDialog] = useState(false);
  const [editingPack, setEditingPack] = useState<any | null>(null);
  const [packForm, setPackForm] = useState({ name: '', items: [{ productType: 'tshirt', quantity: 1 }], price: 0 });

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    if (tab === 1) fetchUsers();
    if (tab === 2) fetchPacks();
    // eslint-disable-next-line
  }, [tab]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setUsers([]);
    }
    setUsersLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/.netlify/functions/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/.netlify/functions/users`,
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

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    dispatch(updateOrderStatus({ orderId, status }));
  };

  const fetchPacks = async () => {
    setPacksLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/packs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPacks(res.data);
    } catch (err) {
      setPacks([]);
    }
    setPacksLoading(false);
  };

  const handleDeletePack = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pack?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/.netlify/functions/packs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPacks(packs.filter((p) => p._id !== id));
    } catch (err) {
      alert('Failed to delete pack');
    }
  };

  const handleOpenPackDialog = (pack: any | null = null) => {
    setEditingPack(pack);
    if (pack) {
      setPackForm({ name: pack.name, items: pack.items, price: pack.price });
    } else {
      setPackForm({ name: '', items: [{ productType: 'tshirt', quantity: 1 }], price: 0 });
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
    setPackForm((prev) => ({ ...prev, items: [...prev.items, { productType: 'tshirt', quantity: 1 }] }));
  };

  const handleRemovePackItem = (idx: number) => {
    setPackForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleSavePack = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editingPack) {
        // Update
        const res = await axios.put(`${API_BASE_URL}/.netlify/functions/packs/${editingPack._id}`, packForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPacks(packs.map((p) => (p._id === editingPack._id ? res.data : p)));
      } else {
        // Create
        const res = await axios.post(`${API_BASE_URL}/.netlify/functions/packs`, packForm, {
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

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id}</TableCell>
                    <TableCell>{order.user}</TableCell>
                    <TableCell>
                      <Box>
                        {order.items.map((item, index) => (
                          <Box key={index} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              Type: {item.productType}
                            </Typography>
                            <Typography variant="body2">
                              Size: {item.size}
                            </Typography>
                            {item.playerName && (
                              <Typography variant="body2">
                                Player Name: {item.playerName}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={order.status}
                          label="Status"
                          onChange={(e) =>
                            handleStatusChange(
                              order._id,
                              e.target.value as Order['status']
                            )
                          }
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="processing">Processing</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => window.open(order.items[0].imageFront, '_blank')}
                      >
                        View Front Image
                      </Button>
                      {order.items[0].productType === 'tshirt' && order.items[0].imageBack && (
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => window.open(order.items[0].imageBack, '_blank')}
                          sx={{ ml: 1 }}
                        >
                          View Back Image
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tab === 1 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Users</Typography>
              <Button variant="contained" onClick={() => setOpenAddUser(true)}>
                Add User
              </Button>
            </Box>
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
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button color="error" onClick={() => handleDeleteUser(user._id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Packs & Prices</Typography>
              <Button variant="contained" onClick={() => handleOpenPackDialog()}>
                Add Pack
              </Button>
            </Box>
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
                    <TableRow key={pack._id}>
                      <TableCell>{pack.name}</TableCell>
                      <TableCell>
                        {pack.items.map((item: any, idx: number) => (
                          <span key={idx}>{item.quantity} x {item.productType}{idx < pack.items.length - 1 ? ', ' : ''}</span>
                        ))}
                      </TableCell>
                      <TableCell>${pack.price}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleOpenPackDialog(pack)}>Edit</Button>
                        <Button size="small" color="error" onClick={() => handleDeletePack(pack._id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Dialog open={openPackDialog} onClose={() => setOpenPackDialog(false)}>
              <DialogTitle>{editingPack ? 'Edit Pack' : 'Add Pack'}</DialogTitle>
              <DialogContent>
                <TextField
                  label="Name"
                  fullWidth
                  margin="normal"
                  value={packForm.name}
                  onChange={(e) => handlePackFormChange('name', e.target.value)}
                />
                {packForm.items.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                    <FormControl>
                      <InputLabel>Product</InputLabel>
                      <Select
                        value={item.productType}
                        label="Product"
                        onChange={(e) => handlePackItemChange(idx, 'productType', e.target.value)}
                      >
                        <MenuItem value="tshirt">T-Shirt</MenuItem>
                        <MenuItem value="shoes">Shoes</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Qty"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handlePackItemChange(idx, 'quantity', Number(e.target.value))}
                      sx={{ width: 80 }}
                    />
                    <Button onClick={() => handleRemovePackItem(idx)} color="error">Remove</Button>
                  </Box>
                ))}
                <Button onClick={handleAddPackItem} sx={{ mb: 2 }}>Add Item</Button>
                <TextField
                  label="Price"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={packForm.price}
                  onChange={(e) => handlePackFormChange('price', Number(e.target.value))}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenPackDialog(false)}>Cancel</Button>
                <Button onClick={handleSavePack} variant="contained">Save</Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default AdminPanel; 