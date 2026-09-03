import api from './api';

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export const getUserSettings = async () => {
  const response = await api.get('/users/settings');
  return response.data;
};

export const updateUserSettings = async (settingsData) => {
  const response = await api.put('/users/settings', settingsData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.post('/users/change-password', passwordData);
  return response.data;
};

export const getUserAnalytics = async () => {
  const response = await api.get('/users/analytics');
  return response.data;
};
