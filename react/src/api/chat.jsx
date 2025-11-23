import api from './axios';
import { getAuthHeader } from './auth';

export async function getMessages() {
  const headers = getAuthHeader();
  const response = await api.get('/api/chat/messages/', {
    headers,
  });
  return response.data;
}

export async function sendMessage({ content }) {
  const headers = getAuthHeader();
  const response = await api.post(
    '/api/chat/messages/',
    { content },
    { headers }
  );
  return response.data;
}
