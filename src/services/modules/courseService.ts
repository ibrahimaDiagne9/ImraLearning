import apiClient from '../apiClient';

export const getCourses = async (params?: any) => {
    const response = await apiClient.get('/courses/', { params });
    return response.data;
};

export const getInstructorCourses = async () => {
    const response = await apiClient.get('/courses/', { params: { is_instructor: true } });
    return response.data;
};

export const getCourseReviews = async (courseId: number) => {
    const response = await apiClient.get(`/courses/${courseId}/reviews/`);
    return response.data;
};

export const postCourseReview = async (courseId: number, data: { rating: number; comment: string }) => {
    const response = await apiClient.post(`/courses/${courseId}/reviews/`, data);
    return response.data;
};

export const inviteStudent = async (email: string, name: string, courseId: number) => {
    const response = await apiClient.post('/courses/invite/', { email, name, course_id: courseId });
    return response.data;
};

export const createLesson = async (data: any) => {
    const response = await apiClient.post('/lessons/', data);
    return response.data;
};
