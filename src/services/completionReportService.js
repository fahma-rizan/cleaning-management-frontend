import api from './api';

export const getReports = (params) =>
  api.get('/completion-reports', { params }).then(r => r.data.data);

export const getReportByBooking = (bookingId) =>
  api.get(`/completion-reports/booking/${bookingId}`).then(r => r.data.data);

export const verifyReport = (id, payload) =>
  api.post(`/completion-reports/${id}/verify`, payload).then(r => r.data.data);

export const submitReport = (bookingId, payload) =>
  api.post(`/completion-reports/booking/${bookingId}`, payload).then(r => r.data.data);
