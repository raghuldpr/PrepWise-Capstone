import api from './api';

export const getCategories = async () => {
  const response = await api.get('/questions/categories');
  return response.data;
};

export const getQuestions = async (params = {}) => {
  const response = await api.get('/questions', { params });
  return response.data; // Page object: { content, totalElements, totalPages, ... }
};

export const getQuestionById = async (id, includeAnswers = false) => {
  const response = await api.get(`/questions/${id}`, {
    params: { includeAnswers },
  });
  return response.data;
};

export const submitAttempt = async (attemptData) => {
  // attemptData: { questionId, selectedAnswer, timeTakenSeconds }
  const response = await api.post('/attempts', attemptData);
  return response.data; // AttemptResultDto: { attemptId, questionId, isCorrect, score, selectedAnswer, correctAnswer, explanation, currentAccuracy, attemptedAt }
};

export const getUserProgress = async () => {
  const response = await api.get('/progress');
  return response.data;
};

export const getWeakAreas = async (threshold = 60.0) => {
  const response = await api.get('/progress/weak-areas', {
    params: { threshold },
  });
  return response.data;
};

export const getCategoryProgress = async (categoryId) => {
  const response = await api.get(`/progress/${categoryId}`);
  return response.data;
};

export const getCompanyPreparation = async (companyId) => {
  const response = await api.get(`/companies/${companyId}/preparation`);
  return response.data;
};

export const getCompanies = async () => {
  const response = await api.get('/companies');
  return response.data;
};
