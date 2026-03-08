import apiClient from '../apiClient';

export const updateProfile = async (data: any) => {
    let headers = {};
    if (data instanceof FormData) {
        headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await apiClient.patch('/auth/profile/', data, { headers });
    return response.data;
};

export const requestEmailVerification = async () => {
    const response = await apiClient.post('/auth/verify-email/');
    return response.data;
};
