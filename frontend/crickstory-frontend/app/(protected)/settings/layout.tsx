

import SideNav from '@/app/ui/posts/sidenav';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings',
    description: "Access All Your Settings at once.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <SideNav />
            </div>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-0">{children}</div>
        </div>
    );
}