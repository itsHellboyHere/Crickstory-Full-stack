'use client'

import { useMediaQuery } from 'react-responsive';
import { useState, useRef } from 'react';
import ChatRoomList from '@/app/components/chat/ChatRoomList';

export default function ChatPage() {
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [showBtn, setShowBtn] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const handleScroll = () => {
        const scrollTop = scrollRef.current?.scrollTop || 0;
        setShowBtn(scrollTop > 120);
    };

    if (isMobile) {
        return (
            <main className="h-[90vh] flex flex-col relative">
                <header className="sticky top-0 bg-white z-10 p-4 border-b text-lg font-semibold shadow-sm">
                    Chat
                </header>

                <section
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto scrollbar-custom relative"
                    onScroll={handleScroll}
                >
                    <ChatRoomList />
                </section>

                {showBtn && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition-all"
                        aria-label="Scroll to top"
                    >
                        ↑
                    </button>
                )}
            </main>
        );
    }

    return (
        <div className="h-full flex items-center justify-center text-gray-500">
            Select a conversation to start chatting 💬
        </div>
    );
}