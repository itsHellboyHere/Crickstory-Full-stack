'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import CricketLoader from '../components/CrickLoader';
import ScoreboardLoader from '../components/ScoreLoader';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showUI, setShowUI] = useState(false);

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
    return <div className="flex flex-col justify-center items-center h-screen  dark:bg-zinc-900 ">
      <CricketLoader size={100} speed={1.2} />
      <ScoreboardLoader text='6LOADING' />
    </div>;
  }

  return <>{children}</>;
}
