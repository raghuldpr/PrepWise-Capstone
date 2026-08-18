import api from './api';

export const generateRoadmap = async (targetRole, targetTechnology) => {
  const response = await api.post('/roadmap/generate', { targetRole, targetTechnology });
  return response.data;
};

export const getUserRoadmaps = async () => {
  const response = await api.get('/roadmap');
  return response.data;
};

export const getRoadmapById = async (id) => {
  const response = await api.get(`/roadmap/${id}`);
  return response.data;
};
