export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://befutscore.netlify.app'; 

import axios from 'axios';

// Address API
export async function fetchAddresses(userId: number) {
  const response = await axios.get(`${API_BASE_URL}/.netlify/functions/getaddresses?userId=${userId}`);
  return response.data;
}

export async function createAddress(address: any) {
  const response = await axios.post(`${API_BASE_URL}/.netlify/functions/createaddress`, address, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

export async function updateAddress(address: any) {
  const response = await axios.put(`${API_BASE_URL}/.netlify/functions/updateaddress`, address, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

export async function deleteAddress(id: number, userId: number) {
  const response = await axios.delete(`${API_BASE_URL}/.netlify/functions/deleteaddress`, {
    headers: {
      'Content-Type': 'application/json',
    },
    data: { id, userId },
  });
  return response.data;
} 