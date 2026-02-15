import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { CourseData } from '../components/studio/StudioTypes';

export const useCourses = (params = {}) => {
    return useQuery({
        queryKey: ['courses', params],
        queryFn: async () => {
            const { data } = await api.get('/courses/', { params });
            return data;
        },
    });
};

export const useCourseDetail = (courseId?: string) => {
    return useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            if (!courseId || courseId === 'new') return null;
            const { data } = await api.get(`/courses/${courseId}/`);
            return data;
        },
        enabled: !!courseId && courseId !== 'new',
    });
};

export const useSaveCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ courseId, payload }: { courseId?: string; payload: Partial<CourseData> }) => {
            if (courseId && courseId !== 'new') {
                const { data } = await api.put(`/courses/${courseId}/`, payload);
                return data;
            } else {
                const { data } = await api.post('/courses/', payload);
                return data;
            }
        },
        onSuccess: (data) => {
            // Invalidate both the list and the specific course cache
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['course', String(data.id)] });
        },
    });
};

export const useInstructorCourses = (instructorId?: string | number) => {
    return useQuery({
        queryKey: ['courses', { instructor: instructorId }],
        queryFn: async () => {
            const { data } = await api.get('/courses/', { params: { instructor: instructorId } });
            return data;
        },
        enabled: !!instructorId,
    });
};
