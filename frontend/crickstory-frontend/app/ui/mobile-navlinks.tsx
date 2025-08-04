'use client';

import { usePathname } from 'next/navigation';
import {
    HomeIcon,
    BellIcon,
    PlusIcon,
    UserIcon,
    PowerIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import clsx from 'clsx';
import { useAuth } from '@/app/context/AuthContext';
import NotificationBell from '@/app/components/NotificationBell';

const links = [
    { name: 'Post', href: '/posts', icon: HomeIcon },
    { name: 'Create', href: '/posts/create', icon: PlusIcon },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },

];

export default function MobileNavLinks() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="flex items-center justify-around w-full">
            {links.map((link) => {
                const LinkIcon = link.icon;
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            'flex items-center justify-center p-2 rounded-md hover:bg-sky-100',
                            {
                                'bg-sky-100 text-blue-600': pathname === link.href,
                            }
                        )}
                    >
                        <LinkIcon className="w-6 h-6" />
                    </Link>
                );
            })}

            <Link
                href="/notifications"
                className={clsx(
                    'flex items-center justify-center p-2 rounded-md hover:bg-sky-100',
                    {
                        'bg-sky-100 text-blue-600': pathname === '/notifications',
                    }
                )}
            >
                <NotificationBell />
            </Link>

            {user?.username && (
                <Link
                    href={`/profile/${user.username}`}
                    className={clsx(
                        'flex items-center justify-center p-2 rounded-md hover:bg-sky-100',
                        {
                            'bg-sky-100 text-blue-600': pathname.startsWith('/profile'),
                        }
                    )}
                >
                    <UserIcon className="w-6 h-6" />
                </Link>
            )}
            <button
                onClick={logout}
                className={clsx(
                    'flex h-[48px] items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600',

                )}
            >
                <PowerIcon className="w-6" />

            </button>
        </div>
    );
}
