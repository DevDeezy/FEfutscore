import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAddresses, createAddress, updateAddress, deleteAddress } from '../../api';

export const getAddresses = createAsyncThunk(
  'address/getAddresses',
  async (userId: number) => await fetchAddresses(userId)
);

export const addAddress = createAsyncThunk(
  'address/addAddress',
  async (address: any) => await createAddress(address)
);

export const editAddress = createAsyncThunk(
  'address/editAddress',
  async (address: any) => await updateAddress(address)
);

export const removeAddress = createAsyncThunk(
  'address/removeAddress',
  async ({ id, userId }: { id: number; userId: number }) => {
    await deleteAddress(id, userId);
    return id;
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState: { addresses: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload;
        state.loading = false;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addresses.unshift(action.payload);
      })
      .addCase(editAddress.fulfilled, (state, action) => {
        const idx = state.addresses.findIndex((a: any) => a.id === action.payload.id);
        if (idx !== -1) state.addresses[idx] = action.payload;
      })
      .addCase(removeAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((a: any) => a.id !== action.payload);
      });
  },
});

export default addressSlice.reducer; 