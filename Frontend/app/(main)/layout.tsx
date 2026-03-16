'use client';

import { Sidebar } from '@/components/hub/Sidebar';
import { Header } from '@/components/shared/Header';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function MainLayout({
    children
}: {
    children: React.ReactNode
}) {
    const [activeSection, setActiveSection] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50">
                <main className="flex-1">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                mobileOpen={sidebarOpen}
                onMobileClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col min-h-screen md:ml-16 lg:ml-64">
                <Header
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    menuOpen={sidebarOpen}
                />
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
