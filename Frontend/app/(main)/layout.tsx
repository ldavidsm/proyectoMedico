'use client';

import { Sidebar } from '@/components/hub/Sidebar';
import { Header } from '@/components/shared/Header';
import { useState } from 'react';

export default function MainLayout({
    children
}: {
    children: React.ReactNode
}) {
    const [activeSection, setActiveSection] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
