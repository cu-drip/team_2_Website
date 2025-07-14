import axios from "axios";

export function withInlineParam(path, search) {
    const params = new URLSearchParams(search);
    if (params.has("inline")) {
        const value = params.get("inline");
        return value === null || value === "" || value === "true" ? `${path}?inline` : `${path}?inline=${value}`;
    }
    return path;
}

export function formatTimestamp(timestamp) {
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
}

export const BACKEND_URL = `https://t-competition.ru`;

// Auth API endpoints
export const API = {
    LOGIN: "/api/v1web/auth/login",
    REGISTER: "/api/v1web/auth/register",
    PROFILE: "/api/v1web/auth/me",
    USER_BY_ID: (userId) => `/api/v1web/users/${userId}`,
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
    MATCHES: "/api/v1web/feedback/matches",
    TOURNAMENTS: "/api/v1web/feedback/tournaments",
    ADMIN_USER_MATCHES: (userId) => `/api/v1web/admin/users/${userId}/matches`,
    ADMIN_USER_TOURNAMENTS: (userId) => `/api/v1web/admin/users/${userId}/tournaments`,
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
    CHATS: "/api/v1web/chats",
    CHAT_USERS: (chatId) => `/api/v1web/chats/${chatId}/users`,
    CHAT_USER: (chatId, userId) => `/api/v1web/chats/${chatId}/users/${userId}`,
    CHAT_MESSAGES: (chatId) => `/api/v1web/chats/${chatId}/messages`,
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
export const WEBSOCKET_URL = "ws://51.250.38.151:8086/ws/chats";

export function getWebSocketUrl(chatId, token) {
    return `${WEBSOCKET_URL}/${chatId}?token=${token}`;
}

// Competition Service API endpoints
export const TOURNAMENT_API = {
    TOURNAMENTS: "/api/v1web/tournaments",
    TOURNAMENT: (tournamentId) => `/api/v1web/tournaments/${tournamentId}`,
    TOURNAMENT_PARTICIPANTS: (tournamentId) => `/api/v1web/tournaments/${tournamentId}/participants`,
    TOURNAMENT_PARTICIPANT: (tournamentId, participantId) => `/api/v1web/tournaments/${tournamentId}/participants/${participantId}`,
    TOURNAMENT_NOTIFY: (tournamentId) => `/api/v1web/tournaments/${tournamentId}/notify`,
    USER_TOURNAMENTS: (userId) => `/api/v1web/tournaments/users/${userId}`,
    USER_TOURNAMENTS_DETAILS: (userId) => `/api/v1web/tournaments/users/${userId}/details`,
    USER_ONGOING_TOURNAMENTS: (userId) => `/api/v1web/tournaments/users/${userId}/ongoing`,
    USER_OPEN_REGISTRATION: (userId) => `/api/v1web/tournaments/users/${userId}/open-registration`,
    USER_ENDED_TOURNAMENTS: (userId) => `/api/v1web/tournaments/users/${userId}/ended`,
};

// Tournament management functions
export function getTournaments(token) {
    return axios.get(`${BACKEND_URL}${TOURNAMENT_API.TOURNAMENTS}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function createTournament(data, token) {
    return axios.post(`${BACKEND_URL}${TOURNAMENT_API.TOURNAMENTS}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getTournament(tournamentId, token) {
    return axios.get(`${BACKEND_URL}${TOURNAMENT_API.TOURNAMENT(tournamentId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function updateTournament(tournamentId, data, token) {
    return axios.put(`${BACKEND_URL}${TOURNAMENT_API.TOURNAMENT(tournamentId)}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function patchTournament(tournamentId, data, token) {
    return axios.patch(`${BACKEND_URL}${TOURNAMENT_API.TOURNAMENT(tournamentId)}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function deleteTournament(tournamentId, token) {
    return axios.delete(`${BACKEND_URL}${TOURNAMENT_API.TOURNAMENT(tournamentId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getTournamentParticipants(tournamentId, token) {
    return axios.get(`${BACKEND_URL}${TOURNAMENT_API.TOURNAMENT_PARTICIPANTS(tournamentId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function registerParticipant(tournamentId, participantId, participantType, token) {
    return axios.post(
        `${BACKEND_URL}${TOURNAMENT_API.TOURNAMENT_PARTICIPANT(tournamentId, participantId)}`,
        {},
        {
            params: { participantType },
            headers: { Authorization: `Bearer ${token}` },
        }
    );
}

export function unregisterParticipant(tournamentId, participantId, participantType, token) {
    return axios.delete(`${BACKEND_URL}${TOURNAMENT_API.TOURNAMENT_PARTICIPANT(tournamentId, participantId)}`, {
        params: { participantType },
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function notifyTournamentParticipants(tournamentId, token) {
    return axios.post(
        `${BACKEND_URL}${TOURNAMENT_API.TOURNAMENT_NOTIFY(tournamentId)}`,
        {},
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
}

// User tournament functions
export function getUserTournaments(userId, token, state = null, participantType = null) {
    const params = {};
    if (state) params.state = state;
    if (participantType) params.participantType = participantType;

    return axios.get(`${BACKEND_URL}${TOURNAMENT_API.USER_TOURNAMENTS(userId)}`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getUserTournamentsDetails(userId, token, state = null) {
    const params = {};
    if (state) params.state = state;

    return axios.get(`${BACKEND_URL}${TOURNAMENT_API.USER_TOURNAMENTS_DETAILS(userId)}`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getUserOngoingTournaments(userId, token) {
    return axios.get(`${BACKEND_URL}${TOURNAMENT_API.USER_ONGOING_TOURNAMENTS(userId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getUserOpenRegistrationTournaments(userId, token) {
    return axios.get(`${BACKEND_URL}${TOURNAMENT_API.USER_OPEN_REGISTRATION(userId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getUserEndedTournaments(userId, token) {
    return axios.get(`${BACKEND_URL}${TOURNAMENT_API.USER_ENDED_TOURNAMENTS(userId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Team API endpoints
export const TEAM_API = {
    TEAMS: "/api/v1web/teams",
    TEAM: (teamId) => `/api/v1web/teams/${teamId}`,
    TEAM_PARTICIPANTS: (teamId) => `/api/v1web/teams/${teamId}/participants`,
    TEAM_PARTICIPANT: (teamId, userId) => `/api/v1web/teams/${teamId}/participants/${userId}`,
};

// Team management functions
export function getTeams(token) {
    return axios.get(`${BACKEND_URL}${TEAM_API.TEAMS}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function createTeam(data, token) {
    return axios.post(`${BACKEND_URL}${TEAM_API.TEAMS}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getTeam(teamId, token) {
    return axios.get(`${BACKEND_URL}${TEAM_API.TEAM(teamId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function updateTeam(teamId, data, token) {
    return axios.put(`${BACKEND_URL}${TEAM_API.TEAM(teamId)}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function patchTeam(teamId, data, token) {
    return axios.patch(`${BACKEND_URL}${TEAM_API.TEAM(teamId)}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function deleteTeam(teamId, token) {
    return axios.delete(`${BACKEND_URL}${TEAM_API.TEAM(teamId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getTeamParticipants(teamId, token) {
    return axios.get(`${BACKEND_URL}${TEAM_API.TEAM_PARTICIPANTS(teamId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function addTeamParticipant(teamId, userId, token) {
    return axios.post(
        `${BACKEND_URL}${TEAM_API.TEAM_PARTICIPANT(teamId, userId)}`,
        {},
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
}

export function removeTeamParticipant(teamId, userId, token) {
    return axios.delete(`${BACKEND_URL}${TEAM_API.TEAM_PARTICIPANT(teamId, userId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Competition Engine API endpoints
export const COMPETITION_API = {
    TOURS: "/api/v1web/tour",
    TOUR: (tourId) => `/api/v1web/tour/${tourId}`,
    BRACKET: (tourId) => `/api/v1web/bracket/${tourId}`,
    TOUR_MATCHES: (tourId) => `/api/v1web/tour/${tourId}/matches`,
    TOUR_MATCH: (tourId, matchId) => `/api/v1web/tour/${tourId}/matches/${matchId}`,
    MATCH: (matchId) => `/api/v1web/matches/${matchId}`,
};

// Tournament (Tour) management functions
export function createTour(data, token) {
    return axios.post(`${BACKEND_URL}${COMPETITION_API.TOURS}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getTour(tourId, token) {
    return axios.get(`${BACKEND_URL}${COMPETITION_API.TOUR(tourId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function updateTour(tourId, data, token) {
    return axios.put(`${BACKEND_URL}${COMPETITION_API.TOUR(tourId)}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function deleteTour(tourId, token) {
    return axios.delete(`${BACKEND_URL}${COMPETITION_API.TOUR(tourId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Bracket management functions
export function getBracket(tourId, token) {
    return axios.get(`${BACKEND_URL}${COMPETITION_API.BRACKET(tourId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function updateBracket(tourId, data, token) {
    return axios.patch(`${BACKEND_URL}${COMPETITION_API.BRACKET(tourId)}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Match management functions
export function getTourMatches(tourId, token) {
    return axios.get(`${BACKEND_URL}${COMPETITION_API.TOUR_MATCHES(tourId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function createTourMatch(tourId, data, token) {
    return axios.post(`${BACKEND_URL}${COMPETITION_API.TOUR_MATCHES(tourId)}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getTourMatch(tourId, matchId, token) {
    return axios.get(`${BACKEND_URL}${COMPETITION_API.TOUR_MATCH(tourId, matchId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function updateTourMatch(tourId, matchId, data, token) {
    return axios.put(`${BACKEND_URL}${COMPETITION_API.TOUR_MATCH(tourId, matchId)}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function patchTourMatch(tourId, matchId, data, token) {
    return axios.patch(`${BACKEND_URL}${COMPETITION_API.TOUR_MATCH(tourId, matchId)}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function deleteTourMatch(tourId, matchId, token) {
    return axios.delete(`${BACKEND_URL}${COMPETITION_API.TOUR_MATCH(tourId, matchId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Global match access (read-only)
export function getMatch(matchId, token) {
    return axios.get(`${BACKEND_URL}${COMPETITION_API.MATCH(matchId)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}
