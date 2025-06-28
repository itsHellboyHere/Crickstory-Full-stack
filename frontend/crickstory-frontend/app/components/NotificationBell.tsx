'use client';

import { useNotification } from '@/app/context/NotificationContext';
import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationBell() {
    const { unseenCount } = useNotification();

    return (
        <div className="relative">
            <BellIcon className="h-6 w-6 text-black" />
            {unseenCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-white text-xs flex items-center justify-center">
                    {unseenCount}
                </span>
            )}
        </div>
    );
}
