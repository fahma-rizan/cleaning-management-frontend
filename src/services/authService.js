import api from './api';

export const register = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data.data;
};

export const verifyEmail = async (data) => {
  const res = await api.post('/auth/verify-email', data);
  return res.data;
};

export const login = async (credentials, remember = false) => {
  const res = await api.post('/auth/login', credentials);
  const { accessToken, user } = res.data.data;
  if (remember) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('rememberMe', '1');
  } else {
    sessionStorage.setItem('accessToken', accessToken);
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('accessToken');
  }
  return { accessToken, user };
};

export const refreshToken = async () => {
  const res = await api.post('/auth/refresh-token');
  const { accessToken } = res.data.data;
  if (localStorage.getItem('rememberMe')) {
    localStorage.setItem('accessToken', accessToken);
  } else {
    sessionStorage.setItem('accessToken', accessToken);
  }
  return accessToken;
};

export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('rememberMe');
  sessionStorage.removeItem('accessToken');
};

export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await api.post('/auth/reset-password', data);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get('/auth/profile');
  return res.data.data;
};

export const updateProfile = async ({ name, phone }) => {
  const res = await api.put('/auth/profile', { name, phone });
  return res.data.data;
};

export const forceChangePassword = async ({ newPassword }) => {
  const res = await api.post('/auth/force-change-password', { newPassword });
  const { accessToken } = res.data?.data || {};
  if (accessToken) {
    if (localStorage.getItem('rememberMe')) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      sessionStorage.setItem('accessToken', accessToken);
    }
  }
  return res.data;
};
