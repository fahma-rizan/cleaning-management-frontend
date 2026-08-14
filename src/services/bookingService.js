import api from './api';

export const createBooking = async (data) => {
  const res = await api.post('/bookings', data);
  return res.data.data;
};

export const getBookings = async ({ page = 1, limit = 10, status } = {}) => {
  const params = { page, limit };
  if (status) params.status = status;
  const res = await api.get('/bookings', { params });
  return res.data.data;
};

export const getBookingById = async (id) => {
  const res = await api.get(`/bookings/${id}`);
  return res.data.data;
};

export const updateBookingStatus = async (id, payload) => {
  const res = await api.patch(`/bookings/${id}/status`, payload);
  return res.data.data;
};

export const getMyStats = async () => {
  const res = await api.get('/bookings/my-stats');
  return res.data.data;
};
