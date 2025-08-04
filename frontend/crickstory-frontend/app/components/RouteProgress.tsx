'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import '../css/nprogress.css';

NProgress.configure({ showSpinner: false });

export default function RouteProgress() {
    const pathname = usePathname();

    useEffect(() => {
        NProgress.start();

        // Slight delay to simulate loading
        const timer = setTimeout(() => {
            NProgress.done();
        }, 100);

        return () => {
            clearTimeout(timer);
        };
    }, [pathname]);

    return null;
}
