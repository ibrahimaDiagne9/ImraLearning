import apiClient from '../apiClient';

export const toggleLessonCompletion = async (id: number) => {
    const response = await apiClient.post(`/lessons/${id}/toggle-completion/`);
    return response.data;
};

export const submitQuiz = async (quizId: number, answers: any) => {
    const response = await apiClient.post(`/quizzes/${quizId}/submit/`, { answers });
    return response.data;
};

export const getCertificates = async () => {
    const response = await apiClient.get('/certificates/');
    return response.data;
};

export const getCertificateDetail = async (id: string) => {
    const response = await apiClient.get(`/certificates/${id}/`);
    return response.data;
};

export const createAssignment = async (lessonId: number, data: any) => {
    const response = await apiClient.post(`/lessons/${lessonId}/assignment/`, data);
    return response.data;
};

export const getSubmissions = async () => {
    const response = await apiClient.get('/assignments/submissions/');
    return response.data;
};

export const gradeSubmission = async (submissionId: number, data: { grade: number; feedback?: string }) => {
    const response = await apiClient.post(`/submissions/${submissionId}/grade/`, data);
    return response.data;
};

export const submitAssignment = async (assignmentId: number, data: { content: string; file?: File }) => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.file) {
        formData.append('file', data.file);
    }

    const response = await apiClient.post(`/assignments/${assignmentId}/submit/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
