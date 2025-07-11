import axios from "axios";

export function withInlineParam(path, search) {
  const params = new URLSearchParams(search);
  if (params.has("inline")) {
    const value = params.get("inline");
    return value === null || value === "" || value === "true"
      ? `${path}?inline`
      : `${path}?inline=${value}`;
  }
  return path;
}

export const BACKEND_URL = "http://localhost:8080";

// Auth API endpoints
export const API = {
  LOGIN: "/api/v1/auth/login",
  REGISTER: "/api/v1/auth/register",
  PROFILE: "/api/v1/auth/me",
  USER_BY_ID: (userId) => `/api/v1/users/${userId}`,
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

export function getUserById(userId, token) {
  return axios.get(`${BACKEND_URL}${API.USER_BY_ID(userId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Feedback API endpoints
export const FEEDBACK_API = {
  MATCHES: "/api/v1/feedback/matches",
  TOURNAMENTS: "/api/v1/feedback/tournaments",
  ADMIN_USER_MATCHES: (userId) => `/api/v1/admin/users/${userId}/matches`,
  ADMIN_USER_TOURNAMENTS: (userId) => `/api/v1/admin/users/${userId}/tournaments`,
};

export function getMatchFeedback(matchId, token) {
  return axios.get(`${BACKEND_URL}${FEEDBACK_API.MATCHES}`, {
    params: { matchId },
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function postMatchFeedback(data, token) {
  return axios.post(`${BACKEND_URL}${FEEDBACK_API.MATCHES}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getTournamentFeedback(tournamentId, token) {
  return axios.get(`${BACKEND_URL}${FEEDBACK_API.TOURNAMENTS}`, {
    params: { tournamentId },
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function postTournamentFeedback(data, token) {
  return axios.post(`${BACKEND_URL}${FEEDBACK_API.TOURNAMENTS}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getAdminUserMatchFeedback(userId, token) {
  return axios.get(`${BACKEND_URL}${FEEDBACK_API.ADMIN_USER_MATCHES(userId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getAdminUserTournamentFeedback(userId, token) {
  return axios.get(`${BACKEND_URL}${FEEDBACK_API.ADMIN_USER_TOURNAMENTS(userId)}`, {
      headers: { Authorization: `Bearer ${token}` },
  });
}
