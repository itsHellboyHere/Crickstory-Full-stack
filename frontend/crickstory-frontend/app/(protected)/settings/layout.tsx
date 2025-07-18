

import SideNav from '@/app/ui/posts/sidenav';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings',
    description: "Access All Your Settings at once.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}