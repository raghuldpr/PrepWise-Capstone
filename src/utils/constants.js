const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
export const API_BASE_URL = (rawApiBaseUrl.startsWith('http') && !rawApiBaseUrl.endsWith('/api') && !rawApiBaseUrl.endsWith('/api/'))
  ? rawApiBaseUrl.replace(/\/+$/, '') + '/api'
  : rawApiBaseUrl;

export const USER_ROLES = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
};

export const INTERVIEW_STATUS = {
  CREATED: 'CREATED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED',
};

export const MODULE_TYPES = {
  APTITUDE: 'APTITUDE',
  CODING: 'CODING',
  DSA: 'DSA',
  TECHNICAL: 'TECHNICAL',
  HR: 'HR',
};
