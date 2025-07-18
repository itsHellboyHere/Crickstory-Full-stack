'use client';
import { usePathname } from 'next/navigation';
import {

  HomeIcon,
  BellIcon,
  PlusIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '@/app/context/NotificationContext';
// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
import NotificationBell from '@/app/components/NotificationBell';

const links = [
  { name: 'Post', href: '/posts', icon: HomeIcon },
  {
    name: 'Create',
    href: '/posts/create',
    icon: PlusIcon
  },

  //   { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  // const session = await auth()
  const { user } = useAuth();
  const { notifications } = useNotification();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px]  grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
      {/* Notification bell */}
      <Link
        href="/notifications"
        className={clsx(
          'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
          {
            'bg-sky-100 text-blue-600': pathname === '/notifications',
          }
        )}
      >
        <div className="flex items-center">
          <NotificationBell />
        </div>
        <p className="hidden md:block">Notifications</p>
      </Link>

      {user?.username && (
        <Link
          href={`/profile/${user.username}`}
          className={clsx(
            'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
            {
              'bg-sky-100 text-blue-600': pathname.startsWith('/profile'),
            },
          )}
        >
          <UserIcon className="w-6" />
          <p className="hidden md:block">Profile</p>
        </Link>
      )

      }
    </>
  );
}
