'use client'
import ChatSidebar from '@/app/components/chat/ChatSidebar'
import { useMediaQuery } from 'react-responsive'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useMediaQuery({ maxWidth: 768 })


    if (isMobile) {
        // Allow page.tsx to fully handle mobile layout
        return <>{children}</>
    }

    return (
        <div className="flex h-screen">
            <aside className="w-1/3 lg:w-1/4 border-r overflow-y-auto">
                {/* <ChatSidebar /> */}
                <ChatSidebar />
            </aside>
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    )
}
