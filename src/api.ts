import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://befutscore.netlify.app'; 

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

// Order States API
export async function getOrderStates() {
  const response = await axios.get(`${API_BASE_URL}/.netlify/functions/getOrderStates`);
  return response.data;
}

export async function updateOrderState(data: { id: number; name: string; color: string; description?: string }) {
  const response = await axios.put(`${API_BASE_URL}/.netlify/functions/updateOrderState`, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

// App Settings API
export async function getAppSettings() {
  const response = await axios.get(`${API_BASE_URL}/.netlify/functions/getAppSettings`, {
    headers: {
      'Cache-Control': 'max-age=3600', // Cache for 1 hour
    },
  });
  return response.data;
}

export async function updateAppSettings(settings: any) {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_BASE_URL}/.netlify/functions/updateAppSettings`, 
    { settings }, 
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return response.data;
} 