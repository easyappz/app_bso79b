import api from './axios';

export function getAuthHeader() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return {};
  }
  return { Authorization: `Token ${token}` };
}

export async function register({ username, password }) {
  const response = await api.post('/api/auth/register/', {
    username,
    password,
  });
  return response.data;
}

export async function login({ username, password }) {
  const response = await api.post('/api/auth/login/', {
    username,
    password,
  });
  return response.data;
}

export async function getCurrentMember() {
  const headers = getAuthHeader();
  const response = await api.get('/api/auth/me/', {
    headers,
  });
  return response.data;
}

export async function getProfile() {
  const headers = getAuthHeader();
  const response = await api.get('/api/profile/', {
    headers,
  });
  return response.data;
}

export async function updateProfile(payload) {
  const headers = getAuthHeader();
  const response = await api.put('/api/profile/', payload, {
    headers,
  });
  return response.data;
}
