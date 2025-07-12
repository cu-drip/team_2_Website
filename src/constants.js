import axios from "axios";

export function withInlineParam(path, search) {
    const params = new URLSearchParams(search);
    if (params.has("inline")) {
        const value = params.get("inline");
        return value === null || value === "" || value === "true" ? `${path}?inline` : `${path}?inline=${value}`;
    }
    return path;
}

export const BACKEND_URL = `http://51.250.38.151:8066`;

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

export function getMatchFeedback(matchId, token, page = 0, size = 20) {
    return axios.get(`${BACKEND_URL}${FEEDBACK_API.MATCHES}`, {
        params: { matchId, page, size },
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function postMatchFeedback(data, token) {
    return axios.post(`${BACKEND_URL}${FEEDBACK_API.MATCHES}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getTournamentFeedback(tournamentId, token, page = 0, size = 20) {
    return axios.get(`${BACKEND_URL}${FEEDBACK_API.TOURNAMENTS}`, {
        params: { tournamentId, page, size },
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function postTournamentFeedback(data, token) {
    return axios.post(`${BACKEND_URL}${FEEDBACK_API.TOURNAMENTS}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getAdminUserMatchFeedback(userId, token, page = 0, size = 20) {
    return axios.get(`${BACKEND_URL}${FEEDBACK_API.ADMIN_USER_MATCHES(userId)}`, {
        params: { page, size },
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getAdminUserTournamentFeedback(userId, token, page = 0, size = 20) {
    return axios.get(`${BACKEND_URL}${FEEDBACK_API.ADMIN_USER_TOURNAMENTS(userId)}`, {
        params: { page, size },
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Chat API endpoints
export const CHAT_API = {
    CHATS: "/api/v1/chats",
    CHAT_USERS: (chatId) => `/api/v1/chats/${chatId}/users`,
    CHAT_USER: (chatId, userId) => `/api/v1/chats/${chatId}/users/${userId}`,
    CHAT_MESSAGES: (chatId) => `/api/v1/chats/${chatId}/messages`,
};

// Chat management functions
export function getChats(token) {
    return axios.get(`${BACKEND_URL}${CHAT_API.CHATS}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function createChat(data, token) {
    return axios.post(`${BACKEND_URL}${CHAT_API.CHATS}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Chat users management functions
export function getChatUsers(chatId, token) {
    return axios.get(`${BACKEND_URL}${CHAT_API.CHAT_USERS(chatId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function addUsersToChat(chatId, data, token) {
    return axios.post(`${BACKEND_URL}${CHAT_API.CHAT_USERS(chatId)}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function addUserToChat(chatId, userId, token) {
    return axios.post(
        `${BACKEND_URL}${CHAT_API.CHAT_USER(chatId, userId)}`,
        {},
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
}

export function removeUserFromChat(chatId, userId, token) {
    return axios.delete(`${BACKEND_URL}${CHAT_API.CHAT_USER(chatId, userId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function updateUserStatus(chatId, userId, data, token) {
    return axios.patch(`${BACKEND_URL}${CHAT_API.CHAT_USER(chatId, userId)}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Chat messages functions
export function getChatMessages(chatId, token, limit = 100, after = null) {
    const params = { limit: limit };
    if (after !== null) params.after = after;

    return axios.get(`${BACKEND_URL}${CHAT_API.CHAT_MESSAGES(chatId)}`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
    });
}

// WebSocket connection helper
export const WEBSOCKET_URL = "ws://51.250.38.151:8000/ws/chats";

export function getWebSocketUrl(chatId, token) {
    return `${WEBSOCKET_URL}/${chatId}?token=${token}`;
}

export const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    try {
        const date = new Date(timestamp);
        return date.toLocaleString({
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return timestamp;
    }
};
