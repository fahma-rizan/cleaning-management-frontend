import api from './api';

export const getItems = async (params = {}) => {
  const res = await api.get('/inventory', { params });
  return res.data.data;
};

export const getItem = async (id) => {
  const res = await api.get(`/inventory/${id}`);
  return res.data.data;
};

export const createItem = async (data) => {
  const res = await api.post('/inventory', data);
  return res.data.data;
};

export const updateItem = async (id, data) => {
  const res = await api.put(`/inventory/${id}`, data);
  return res.data.data;
};

export const deleteItem = async (id) => {
  const res = await api.delete(`/inventory/${id}`);
  return res.data;
};

export const adjustStock = async (id, data) => {
  const res = await api.post(`/inventory/${id}/adjust`, data);
  return res.data.data;
};

export const getLowStock = async () => {
  const res = await api.get('/inventory/low-stock');
  return res.data.data;
};

export const getItemTransactions = async (id, params = {}) => {
  const res = await api.get(`/inventory/${id}/transactions`, { params });
  return res.data.data;
};
