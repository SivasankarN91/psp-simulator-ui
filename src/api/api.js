import axios from 'axios';

const API = axios.create({
  baseURL: 'https://psp-simulator.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const startSimulation = (data) => API.post('/simulate', data);
export const getSimulation = (id) => API.get(`/simulate/${id}`);
export const getAllSimulations = () => API.get('/simulations');
export const getWebhookLogs = (id) => API.get(`/simulate/${id}/webhooks`);