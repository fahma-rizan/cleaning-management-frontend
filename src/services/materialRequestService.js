import api from './api';

export const getRequests = (params) =>
  api.get('/material-requests', { params }).then(r => r.data.data);

export const approveRequest = (id) =>
  api.post(`/material-requests/${id}/approve`).then(r => r.data.data);

export const rejectRequest = (id, reason) =>
  api.post(`/material-requests/${id}/reject`, { reason }).then(r => r.data.data);

export const getRequestByBooking = (bookingId) =>
  api.get(`/material-requests/booking/${bookingId}`).then(r => r.data.data);
