import apiClient from '../apiClient';

export const getNotifications = async () => {
    const response = await apiClient.get('/notifications/');
    return response.data;
};

export const markNotificationRead = async (id: string | number) => {
    const response = await apiClient.post(`/notifications/${id}/read/`);
    return response.data;
};

export const markAllNotificationsRead = async () => {
    const response = await apiClient.post('/notifications/mark-all-read/');
    return response.data;
};

export const clearNotifications = async () => {
    const response = await apiClient.post('/notifications/clear/');
    return response.data;
};
