import apiClient from '../apiClient';

export const updateProfile = async (data: any) => {
    const response = await apiClient.patch('/auth/profile/', data);
    return response.data;
};
