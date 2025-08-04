

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Profile',
    description: "Access All Your Posts at One Place.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}