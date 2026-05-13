import api from './api';

export const getMonthlyReport = (year, month) =>
  api.get('/reports/monthly', { params: { year, month } }).then(r => r.data.data);

export const getAnomalySummary = (year, month) =>
  api.get('/reports/anomalies', { params: { year, month } }).then(r => r.data.data);
