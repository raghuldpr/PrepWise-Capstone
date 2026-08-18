import api from './api';

export const createInterview = async (data) => {
  const response = await api.post('/interviews', data);
  return response.data;
};

export const startInterview = async (id) => {
  const response = await api.post(`/interviews/${id}/start`);
  return response.data;
};

export const answerQuestion = async (id, data) => {
  const response = await api.post(`/interviews/${id}/answer`, data);
  return response.data;
};

export const submitCodingAnswer = async (id, data) => {
  const response = await api.post(`/interviews/${id}/coding-submit`, data);
  return response.data;
};

export const completeInterview = async (id) => {
  const response = await api.post(`/interviews/${id}/complete`);
  return response.data;
};

export const getInterviewReport = async (id) => {
  const response = await api.get(`/interviews/${id}/report`);
  return response.data;
};

export const getUserInterviewHistory = async (page = 0, size = 10) => {
  const response = await api.get('/interviews/history', {
    params: { page, size }
  });
  return response.data;
};

export const getInterview = async (id) => {
  const response = await api.get(`/interviews/${id}`);
  return response.data;
};
