import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Avatar,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  alpha,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EuroIcon from '@mui/icons-material/Euro';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarIcon from '@mui/icons-material/Star';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { Order, OrderItem } from '../types';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProducts: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  topCategories: { name: string; quantity: number; revenue: number }[];
  topCustomers: { email: string; orders: number; totalSpent: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number; color: string }[];
  recentGrowth: number;
}

const AdminAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      calculateAnalytics();
    }
  }, [orders, timeRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/.netlify/functions/getOrders?limit=1000`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const orderList = Array.isArray(res.data) ? res.data : (res.data.orders || []);
      setOrders(orderList);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const now = new Date();
    let cutoffDate = new Date(0);

    switch (timeRange) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        cutoffDate = new Date(0);
        break;
    }

    const filteredOrders = orders.filter(order => new Date(order.created_at) >= cutoffDate);
    const previousPeriodStart = new Date(cutoffDate.getTime() - (now.getTime() - cutoffDate.getTime()));
    const previousOrders = orders.filter(
      order => new Date(order.created_at) >= previousPeriodStart && new Date(order.created_at) < cutoffDate
    );

    // Calculate total revenue
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    const recentGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Calculate total orders
    const totalOrders = filteredOrders.length;

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate total products sold
    const totalProducts = filteredOrders.reduce((sum, order) => {
      return sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0) || 0);
    }, 0);

    // Calculate top products
    const productMap = new Map<string, { quantity: number; revenue: number }>();
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        const name = item.name || 'Produto Desconhecido';
        const existing = productMap.get(name) || { quantity: 0, revenue: 0 };
        productMap.set(name, {
          quantity: existing.quantity + (item.quantity || 1),
          revenue: existing.revenue + ((item.price || 0) * (item.quantity || 1)),
        });
      });
    });
    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate top categories
    const categoryMap = new Map<string, { quantity: number; revenue: number }>();
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        const category = item.product_type || 'Outros';
        const existing = categoryMap.get(category) || { quantity: 0, revenue: 0 };
        categoryMap.set(category, {
          quantity: existing.quantity + (item.quantity || 1),
          revenue: existing.revenue + ((item.price || 0) * (item.quantity || 1)),
        });
      });
    });
    const topCategories = Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate top customers
    const customerMap = new Map<string, { orders: number; totalSpent: number }>();
    filteredOrders.forEach(order => {
      const email = order.user?.email || order.clientInstagram || 'Anónimo';
      const existing = customerMap.get(email) || { orders: 0, totalSpent: 0 };
      customerMap.set(email, {
        orders: existing.orders + 1,
        totalSpent: existing.totalSpent + (order.total_price || 0),
      });
    });
    const topCustomers = Array.from(customerMap.entries())
      .map(([email, data]) => ({ email, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // Calculate revenue by month
    const monthMap = new Map<string, number>();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    filteredOrders.forEach(order => {
      const date = new Date(order.created_at);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + (order.total_price || 0));
    });
    const revenueByMonth = Array.from(monthMap.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-6);

    // Calculate orders by status
    const statusMap = new Map<string, { count: number; color: string }>();
    filteredOrders.forEach(order => {
      const status = order.orderState?.name_admin || order.orderState?.name || order.status || 'Desconhecido';
      const color = order.orderState?.color || '#666';
      const existing = statusMap.get(status) || { count: 0, color };
      statusMap.set(status, { count: existing.count + 1, color });
    });
    const ordersByStatus = Array.from(statusMap.entries())
      .map(([status, data]) => ({ status, ...data }))
      .sort((a, b) => b.count - a.count);

    setAnalytics({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalProducts,
      topProducts,
      topCategories,
      topCustomers,
      revenueByMonth,
      ordersByStatus,
      recentGrowth,
    });
  };

  // Stats Card Component
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    trend, 
    subtitle,
    color = 'primary.main' 
  }: { 
    title: string; 
    value: string; 
    icon: React.ReactNode; 
    trend?: number;
    subtitle?: string;
    color?: string;
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(color === 'primary.main' ? '#00E676' : color, 0.15),
              color: color,
            }}
          >
            {icon}
          </Box>
          {trend !== undefined && (
            <Chip
              icon={trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
              label={`${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`}
              size="small"
              sx={{
                bgcolor: trend >= 0 ? 'rgba(46,213,115,0.15)' : 'rgba(255,71,87,0.15)',
                color: trend >= 0 ? '#2ED573' : '#FF4757',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Bar Chart Component (CSS-based)
  const BarChart = ({ data, title }: { data: { label: string; value: number }[]; title: string }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.map((item, index) => (
              <Box key={index}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    €{item.value.toFixed(0)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(item.value / maxValue) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, #00E676 ${100 - (item.value / maxValue) * 100}%, #00B248 100%)`,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Donut Chart Component (CSS-based)
  const DonutChart = ({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let cumulativePercentage = 0;

    const gradientStops = data.map(item => {
      const percentage = (item.value / total) * 100;
      const start = cumulativePercentage;
      cumulativePercentage += percentage;
      return { color: item.color, start, end: cumulativePercentage };
    });

    const conicGradient = gradientStops
      .map(stop => `${stop.color} ${stop.start}% ${stop.end}%`)
      .join(', ');

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Box
              sx={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: `conic-gradient(${conicGradient})`,
                position: 'relative',
                flexShrink: 0,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              {data.slice(0, 5).map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1, fontSize: '0.85rem' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">Sem dados disponíveis</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Dashboard de Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visão geral do desempenho da loja
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={timeRange}
            label="Período"
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          >
            <MenuItem value="7d">Últimos 7 dias</MenuItem>
            <MenuItem value="30d">Últimos 30 dias</MenuItem>
            <MenuItem value="90d">Últimos 90 dias</MenuItem>
            <MenuItem value="all">Todo o tempo</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Receita Total"
            value={`€${analytics.totalRevenue.toFixed(2)}`}
            icon={<EuroIcon sx={{ fontSize: 28 }} />}
            trend={analytics.recentGrowth}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Total de Pedidos"
            value={analytics.totalOrders.toString()}
            icon={<ShoppingCartIcon sx={{ fontSize: 28 }} />}
            color="#3498DB"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Valor Médio"
            value={`€${analytics.averageOrderValue.toFixed(2)}`}
            icon={<LocalOfferIcon sx={{ fontSize: 28 }} />}
            color="#FFD700"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Produtos Vendidos"
            value={analytics.totalProducts.toString()}
            icon={<InventoryIcon sx={{ fontSize: 28 }} />}
            color="#9B59B6"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <BarChart
            title="Receita por Mês"
            data={analytics.revenueByMonth.map(item => ({
              label: item.month,
              value: item.revenue,
            }))}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DonutChart
            title="Pedidos por Estado"
            data={analytics.ordersByStatus.map(item => ({
              label: item.status,
              value: item.count,
              color: item.color,
            }))}
          />
        </Grid>
      </Grid>

      {/* Tables Row */}
      <Grid container spacing={3}>
        {/* Top Products */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <StarIcon sx={{ color: 'secondary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Produtos Mais Vendidos
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell align="right">Receita</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: index === 0 ? 'secondary.main' : 'rgba(255,255,255,0.1)',
                                color: index === 0 ? 'secondary.contrastText' : 'text.secondary',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              {index + 1}
                            </Avatar>
                            <Typography variant="body2" sx={{ 
                              maxWidth: 120, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {product.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={product.quantity} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            €{product.revenue.toFixed(0)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <CategoryIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Categorias Mais Vendidas
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {analytics.topCategories.map((category, index) => {
                  const maxRevenue = Math.max(...analytics.topCategories.map(c => c.revenue), 1);
                  return (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: `hsl(${index * 60}, 70%, 50%)`,
                            }}
                          />
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {category.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {category.quantity} un.
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            €{category.revenue.toFixed(0)}
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(category.revenue / maxRevenue) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: `hsl(${index * 60}, 70%, 50%)`,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PeopleIcon sx={{ color: '#3498DB' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Melhores Clientes
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {analytics.topCustomers.map((customer, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: index === 0 ? 'rgba(0,230,118,0.08)' : 'rgba(255,255,255,0.02)',
                      border: index === 0 ? '1px solid rgba(0,230,118,0.2)' : '1px solid transparent',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: index === 0 ? 'primary.main' : 'rgba(255,255,255,0.1)',
                        color: index === 0 ? 'primary.contrastText' : 'text.primary',
                        fontWeight: 600,
                      }}
                    >
                      {customer.email.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {customer.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer.orders} pedidos
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        €{customer.totalSpent.toFixed(0)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalytics;

