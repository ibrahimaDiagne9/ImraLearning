import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

type UserRole = 'teacher' | 'student';

interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    xp_points: number;
    avatar?: string;
    bio?: string;
    location?: string;
    timezone?: string;
    date_joined?: string;
    is_pro?: boolean;
    membership?: {
        tier: string;
        start_date: string;
        end_date: string;
        is_active: boolean;
    };
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    userRole: UserRole;
    isPro: boolean;
    tier: string;
    xp: number;
    login: (credentials: { username: string; password: string }) => Promise<void>;
    register: (userData: { username: string; email: string; password: string; role: UserRole }) => Promise<void>;
    logout: () => void;
    setIsPro: (val: boolean) => void;
    setTier: (tier: string) => void;
    setUserRole: (role: UserRole) => void;
    addXP: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('access_token'));
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRoleState] = useState<UserRole>((localStorage.getItem('userRole') as UserRole) || 'student');
    const [isPro, setIsProState] = useState<boolean>(localStorage.getItem('isPro') === 'true');
    const [tier, setTierState] = useState<string>(localStorage.getItem('tier') || 'free');
    const [xp, setXP] = useState<number>(parseInt(localStorage.getItem('xp') || '0'));

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/profile/');
            const profile = response.data;
            setUser(profile);
            setUserRoleState(profile.role);
            setXP(profile.xp_points);
            setIsProState(profile.is_pro || false);
            setTierState(profile.membership?.tier || 'free');
            localStorage.setItem('userRole', profile.role);
            localStorage.setItem('xp', profile.xp_points.toString());
            localStorage.setItem('isPro', (profile.is_pro || false).toString());
            localStorage.setItem('tier', profile.membership?.tier || 'free');
        } catch (error) {
            console.error('Failed to fetch profile', error);
            logout();
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated]);

    interface LoginCredentials {
        username: string;
        password: string;
    }

    interface RegisterData {
        username: string;
        email: string;
        password: string;
        role: UserRole;
    }

    const login = async (credentials: LoginCredentials) => {
        const response = await api.post('/token/', credentials);
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        setIsAuthenticated(true);
        await fetchProfile();
    };

    const register = async (userData: RegisterData) => {
        await api.post('/auth/register/', userData);
        await login({ username: userData.username, password: userData.password });
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('xp');
        localStorage.removeItem('isPro');
        setIsAuthenticated(false);
        setUser(null);
        setIsProState(false);
    };

    const setIsPro = (val: boolean) => {
        setIsProState(val);
        localStorage.setItem('isPro', val.toString());
    };

    const setTier = (tier: string) => {
        setTierState(tier);
        localStorage.setItem('tier', tier);
    };

    const setUserRole = (role: UserRole) => {
        setUserRoleState(role);
        localStorage.setItem('userRole', role);
    };

    const addXP = async (amount: number) => {
        try {
            const response = await api.post('/learning/add-xp/', { xp: amount });
            const newXP = response.data.xp_points;

            setXP(newXP);
            localStorage.setItem('xp', newXP.toString());
        } catch (error) {
            console.error('Failed to update XP on server', error);
            // Fallback to local update if server fails? 
            // For now just log, security first.
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            userRole,
            isPro,
            tier,
            xp,
            login,
            register,
            logout,
            setIsPro,
            setTier,
            setUserRole,
            addXP
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
