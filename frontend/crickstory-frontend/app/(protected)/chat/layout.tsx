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
            <aside className=" w-1/3 lg:w-1/4  overflow-y-auto"
                style={{
                    boxShadow: "rgba(3, 102, 214, 0.3) 0px 0px 0px 3px"
                }}
            >
                {/* <ChatSidebar /> */}
                <ChatSidebar />
            </aside>
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    )
}
