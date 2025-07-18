'use client';
import Link from 'next/link';
import DeskTopNavLinks from './desktop-navlinks';
import AcmeLogo from './acme-logo';
import { PowerIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/app/context/AuthContext';
import clsx from 'clsx';

export default function DeskTopSideNav({
    isCollapsed,
    onToggle,
}: {
    isCollapsed: boolean;
    onToggle: () => void;
}) {
    const { logout } = useAuth();

    return (
        <div className="flex h-full flex-col px-3 py-4 transition-all duration-300  ease-in-out bg-white">
            <div className="flex justify-end mb-2">
                <button
                    onClick={onToggle}
                    className="text-gray-600 hover:text-gray-900 transition"
                >
                    {isCollapsed ? (
                        <ChevronDoubleRightIcon className="h-5 w-5" />
                    ) : (
                        <ChevronDoubleLeftIcon className="h-5 w-5" />
                    )}
                </button>
            </div>

            <Link
                className="mb-2 flex h-14 items-center justify-start bg-sky-200 rounded-md p-3 md:h-16"
                href="/"
            >
                <div className={clsx('text-white transition-all', isCollapsed ? 'w-10' : 'w-32')}>
                    <AcmeLogo isCollapsed={isCollapsed} />
                </div>
            </Link>

            <div className="flex grow flex-col space-y-2">
                <DeskTopNavLinks isCollapsed={isCollapsed} />

                <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>

                <button
                    onClick={logout}
                    className={clsx(
                        'flex h-[48px] items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600',
                        isCollapsed ? 'justify-center' : 'justify-start md:px-3'
                    )}
                >
                    <PowerIcon className="w-6" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    );
}
