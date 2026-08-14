import api from './api';

export const getAccount = async () => {
  const res = await api.get('/loyalty/account');
  return res.data.data;
};

export const getHistory = async (params = {}) => {
  const res = await api.get('/loyalty/history', { params });
  return res.data.data;
};

export const redeemPoints = async ({ bookingId, points, bookingAmountInRs }) => {
  const res = await api.post('/loyalty/redeem', { bookingId, points, bookingAmountInRs });
  return res.data.data;
};

export const checkTierDiscount = async () => {
  const res = await api.get('/loyalty/tier-discount');
  return res.data.data;
};

export const applyTierDiscount = async (bookingAmountInRs = 0) => {
  const res = await api.post('/loyalty/tier-discount/apply', { bookingAmountInRs });
  return res.data.data;
};
