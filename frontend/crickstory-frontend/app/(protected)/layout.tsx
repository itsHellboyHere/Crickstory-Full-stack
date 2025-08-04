'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import CricketLoader from '../components/CrickLoader';
import ScoreboardLoader from '../components/ScoreLoader';

import DeskTopSideNav from '../ui/desktop-sidenav';
import MobileSideNav from '../ui/posts/mobile-sidenav';
import clsx from 'clsx';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showUI, setShowUI] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      } else {
        setShowUI(true);
      }
    }
  }, [user, loading, pathname, router]);

  if (loading || !showUI) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6 ">
        <CricketLoader size={100} speed={1.2} />
        <ScoreboardLoader text="SPORTSTORY" />
      </div>
    );
  }



  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      {/* Sidebar */}
      <MobileSideNav />
      <div className={clsx(
        'hidden md:block flex-none  transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}>
        <DeskTopSideNav
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(prev => !prev)}
        />
      </div>

      {/* Main content */}
      <div className="flex-grow pt-14  p-0 md:overflow-y-auto scroll-smooth md:p-0">
        {children}
      </div>
    </div>
  );
}
