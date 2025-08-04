'use client';

import { useEffect, useState } from 'react';
import MobileNavLinks from '../mobile-navlinks';
export default function MobileSideNav() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setShow(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!show) return null;

    return (
        <div className="fixed  top-0 left-0 right-0 z-50 bg-white  shadow-md flex items-center justify-around px-2 py-2">
            <MobileNavLinks />

        </div>
    );
}
