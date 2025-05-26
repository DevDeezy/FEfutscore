import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Order, OrderState } from '../../types';

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  'order/create',
  async (orderData: { items: any[]; address: any }) => {
    const formData = new FormData();
    orderData.items.forEach((item, index) => {
      formData.append('image', item.image);
      formData.append('productType', item.productType);
      formData.append('size', item.size);
      formData.append('color', item.color);
    });
    formData.append('address', JSON.stringify(orderData.address));

    const response = await axios.post('/api/orders', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const fetchOrders = createAsyncThunk('order/fetchAll', async () => {
  const response = await axios.get('/api/orders');
  return response.data;
});

export const updateOrderStatus = createAsyncThunk(
  'order/updateStatus',
  async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
    const response = await axios.put(`/api/orders/${orderId}/status`, { status });
    return response.data;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create order';
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update order status';
      });
  },
});

export const { clearError } = orderSlice.actions;
export default orderSlice.reducer; 