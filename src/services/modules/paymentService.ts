import apiClient from '../apiClient';

export const upgradeMembership = async (planId: string, paymentType: string, phoneNumber: string) => {
    const response = await apiClient.post('/membership/upgrade/', { 
        planId,
        paymentType,
        phoneNumber
    });
    return response.data;
};

export const createBictorysCheckout = async (courseId: number, paymentType: string, phoneNumber: string) => {
    const response = await apiClient.post('/payments/bictorys/checkout/', {
        course_id: courseId,
        payment_type: paymentType,
        phone_number: phoneNumber
    });
    return response.data;
};
