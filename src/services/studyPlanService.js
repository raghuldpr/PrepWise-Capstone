import api from './api';

export const generateStudyPlan = async (data) => {
  const response = await api.post('/study-plan/generate', data);
  return response.data;
};

export const getUserStudyPlans = async () => {
  const response = await api.get('/study-plan');
  return response.data;
};

export const getStudyPlanById = async (id) => {
  const response = await api.get(`/study-plan/${id}`);
  return response.data;
};
