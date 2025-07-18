'use client';

import Image from 'next/image';
import { lusitana } from './fonts';

export default function AcmeLogo({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="flex items-center justify-center h-full">
      {isCollapsed ? (
        // Show icon when collapsed
        <Image src="/cricket-bat.svg" alt="SportStory" width={24} height={24} />
      ) : (
        // Show full name when expanded
        <p
          className={`${lusitana.className} text-md md:text-xl font-bold text-gray-800 leading-none`}
        >
          SportStory
        </p>
      )}
    </div>
  );
}
