import apiClient from '../apiClient';

export const getLiveSessions = async (params?: { is_live?: boolean }) => {
    const response = await apiClient.get('/live-sessions/', { params });
    return response.data;
};

export const createLiveSession = async (data: { title: string; description: string; course?: string; meeting_link?: string; is_public: boolean }) => {
    const response = await apiClient.post('/live-sessions/', data);
    return response.data;
};

export const startLiveSession = async (id: number) => {
    const response = await apiClient.post(`/live-sessions/${id}/start/`);
    return response.data;
};

export const endLiveSession = async (id: number) => {
    const response = await apiClient.post(`/live-sessions/${id}/end/`);
    return response.data;
};

export const getUpcomingClasses = async () => {
    const response = await apiClient.get('/dashboard/upcoming-classes/');
    return response.data;
};
