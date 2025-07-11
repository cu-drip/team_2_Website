import axios from 'axios';

export const BACKEND_URL = 'http://localhost:8080';

export const API = {
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  PROFILE: '/api/me',
};

export function login(data) {
  return axios.post(`${BACKEND_URL}${API.LOGIN}`, data);
}

export function register(data) {
  return axios.post(`${BACKEND_URL}${API.REGISTER}`, data);
}

export function getProfile(token) {
  return axios.get(`${BACKEND_URL}${API.PROFILE}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function withInlineParam(path, search) {
  const params = new URLSearchParams(search);
  if (params.has('inline')) {
    const value = params.get('inline');
    return value === null || value === '' || value === 'true'
      ? `${path}?inline`
      : `${path}?inline=${value}`;
  }
  return path;
} 