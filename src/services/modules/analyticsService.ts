import apiClient from '../apiClient';

export const getAnalytics = async () => {
    const response = await apiClient.get('/analytics/');
    return response.data;
};

export const getStudentAnalytics = async () => {
    const response = await apiClient.get('/quizzes/student-analytics/');
    return response.data;
};

export const getPendingTasks = async () => {
    const response = await apiClient.get('/dashboard/pending-tasks/');
    return response.data;
};

export const getRecentActivity = async () => {
    const response = await apiClient.get('/dashboard/recent-activity/');
    return response.data;
};

export const getStudentReport = async () => {
    const response = await apiClient.get('/dashboard/student-report/');
    return response.data;
};
