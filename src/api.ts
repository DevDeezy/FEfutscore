export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://befutscore.netlify.app'; 

// Address API
export async function fetchAddresses(userId: number) {
  const res = await fetch(`/api/getaddresses?userId=${userId}`);
  return res.json();
}

export async function createAddress(address: any) {
  const res = await fetch('/api/createaddress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  });
  return res.json();
}

export async function updateAddress(address: any) {
  const res = await fetch('/api/updateaddress', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  });
  return res.json();
}

export async function deleteAddress(id: number, userId: number) {
  const res = await fetch('/api/deleteaddress', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, userId }),
  });
  return res;
} 