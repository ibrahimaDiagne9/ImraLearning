import apiClient from '../apiClient';

export const getDiscussions = async () => {
    const response = await apiClient.get('/discussions/');
    return response.data;
};

export const createDiscussion = async (data: any) => {
    const response = await apiClient.post('/discussions/', data);
    return response.data;
};

export const resolveDiscussion = async (id: number, isResolved: boolean) => {
    const response = await apiClient.patch(`/discussions/${id}/`, { is_resolved: isResolved });
    return response.data;
};

export const postReply = async (discussionId: number, content: string) => {
    const response = await apiClient.post(`/discussions/${discussionId}/reply/`, { content });
    return response.data;
};

export const getDiscussionDetails = async (id: number) => {
    const response = await apiClient.get(`/discussions/${id}/`);
    return response.data;
};

export const likeDiscussion = async (id: number) => {
    const response = await apiClient.post(`/discussions/${id}/like/`);
    return response.data;
};

export const likeReply = async (id: number) => {
    const response = await apiClient.post(`/replies/${id}/like/`);
    return response.data;
};

export const getLeaderboard = async () => {
    const response = await apiClient.get('/leaderboard/');
    return response.data;
};

// Messaging
export const getConversations = async () => {
    const response = await apiClient.get('/conversations/');
    return response.data;
};

export const createConversation = async (email?: string, userId?: string) => {
    const response = await apiClient.post('/conversations/', { email, user_id: userId });
    return response.data;
};

export const getMessages = async (conversationId: string) => {
    const response = await apiClient.get(`/conversations/${conversationId}/messages/`);
    return response.data;
};

export const sendMessage = async (conversationId: string, content: string) => {
    const response = await apiClient.post(`/conversations/${conversationId}/messages/`, { content });
    return response.data;
};

export const markMessagesRead = async (conversationId: string) => {
    const response = await apiClient.post(`/conversations/${conversationId}/read/`);
    return response.data;
};
