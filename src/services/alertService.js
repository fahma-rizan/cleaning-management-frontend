import api from './api';

export const getActiveAlerts = () =>
  api.get('/alerts').then(r => r.data.data);

export const getAlertHistory = (params) =>
  api.get('/alerts/history', { params }).then(r => r.data.data);
