import apiClient from '../apiClient';

export const upgradeMembership = async (planId: string) => {
    const response = await apiClient.post('/membership/upgrade/', { planId });
    return response.data;
};

export const createPayDunyaCheckout = async (courseId: number) => {
    const response = await apiClient.post('/payments/paydunya/checkout/', { course_id: courseId });
    return response.data;
};

export const verifyPayDunyaPayment = async (token: string) => {
    const response = await apiClient.post('/payments/paydunya/ipn/', { token });
    return response.data;
};
