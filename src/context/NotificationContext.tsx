import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

export type NotificationType = 'message' | 'achievement' | 'course' | 'grade' | 'system';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    timestamp: string;
    isRead: boolean;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    fetchNotifications: () => Promise<void>;
    addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { isAuthenticated } = useAuth();

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const data = await api.getNotifications();
            // Adapt backend data to frontend interface if needed
            const adapted = (data || []).map((n: any) => ({
                id: (n.id || '').toString(),
                type: n.type || 'system',
                title: n.title || 'Notification',
                description: n.description || '',
                timestamp: n.timestamp || 'Now',
                isRead: !!n.is_read,
                link: n.link
            }));
            setNotifications(adapted);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchNotifications();
        // Polling every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const addNotification = (n: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...n,
            id: Math.random().toString(36).substr(2, 9),
            isRead: false,
            timestamp: 'Just now'
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = async (id: string) => {
        try {
            await api.markNotificationRead(id);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const clearAll = async () => {
        try {
            await api.clearNotifications();
            setNotifications([]);
        } catch (error) {
            console.error('Failed to clear notifications', error);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            fetchNotifications,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
