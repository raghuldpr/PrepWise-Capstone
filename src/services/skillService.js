import api from './api';

export const getAllSkills = async () => {
  const response = await api.get('/skills');
  return response.data;
};

export const analyzeSkillGap = async (targetRole) => {
  const response = await api.post('/skills/analyze', { targetRole });
  return response.data;
};

export const getLatestGapAnalysis = async () => {
  const response = await api.get('/skills/gap-analysis');
  return response.data;
};
