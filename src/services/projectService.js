import api from './api';

export const recommendProjects = async (requestData) => {
  const response = await api.post('/projects/recommend', requestData);
  return response.data;
};

export const getProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const saveProject = async (id) => {
  const response = await api.post(`/projects/${id}/save`);
  return response.data;
};

export const getSavedProjects = async () => {
  const response = await api.get('/projects/saved');
  return response.data;
};
