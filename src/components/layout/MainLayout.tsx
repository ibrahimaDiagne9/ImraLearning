import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface MainLayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
}

export const MainLayout = ({ children, onLogout }: MainLayoutProps) => {
    const location = useLocation();
    const isFullBleed = location.pathname === '/messages';

    return (
        <div className="min-h-screen bg-background text-gray-100 font-sans selection:bg-primary selection:text-white">
            <Navbar onLogout={onLogout} />
            <div className={isFullBleed ? "" : "container mx-auto px-4 lg:px-8 pt-6"}>
                <main className="min-w-0">
                    {children}
                </main>
            </div>
            {!isFullBleed && <Footer />}
        </div>
    );
};
