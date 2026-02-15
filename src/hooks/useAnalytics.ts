import { useState, useEffect } from 'react';
import { getAnalytics } from '../services/api';

export interface AnalyticsData {
    total_revenue: number;
    total_students: number;
    total_assignments: number;
    avg_completion_rate: number;
    revenue_data: {
        name: string;
        revenue: number;
        users: number;
    }[];
    top_courses: {
        title: string;
        sales: number;
        revenue: number;
        growth: string;
    }[];
}

export const useAnalytics = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const result = await getAnalytics();
            setData(result);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch analytics', err);
            setError(err.message || 'Failed to fetch analytics data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    return { data, isLoading, error, refresh: fetchAnalytics };
};
