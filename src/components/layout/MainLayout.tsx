import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';


interface MainLayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
}


export const MainLayout = ({ children, onLogout }: MainLayoutProps) => {
    return (
        <div className="min-h-screen bg-background text-gray-100 font-sans selection:bg-primary selection:text-white">
            <Navbar
                onLogout={onLogout}
            />
            <div className="container mx-auto px-4 lg:px-8 pt-6">
                <main className="min-w-0">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
};
