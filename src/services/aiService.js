import api from './api';

export const askAiQuestion = async (data) => {
  const response = await api.post('/ai/ask', data);
  return response.data;
};

export const getAiConversations = async () => {
  const response = await api.get('/ai/conversations');
  return response.data;
};

export const getAiConversationById = async (id) => {
  const response = await api.get(`/ai/conversations/${id}`);
  return response.data;
};

export const deleteAiConversation = async (id) => {
  const response = await api.delete(`/ai/conversations/${id}`);
  return response.data;
};
