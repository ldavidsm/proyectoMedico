'use client';

import { Sidebar } from '@/components/hub/Sidebar';
import { Header } from '@/components/shared/Header';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function MainLayout({
    children
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const [activeSection, setActiveSection] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isAuthenticated, isLoading } = useAuth();

    // Sync activeSection with current pathname
    useEffect(() => {
        if (pathname.startsWith('/settings')) setActiveSection('settings');
        else if (pathname.startsWith('/my-courses')) setActiveSection('learning');
        else if (pathname.startsWith('/become-instructor')) setActiveSection('become-creator');
        else if (pathname.startsWith('/collections')) setActiveSection('home');
        else if (pathname.startsWith('/course')) setActiveSection('home');
        else setActiveSection('home');
    }, [pathname]);

    // Player pages get a clean layout (no sidebar/padding)
    const isPlayerPage = pathname.includes('/learn');
    if (isPlayerPage) {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent" />
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
