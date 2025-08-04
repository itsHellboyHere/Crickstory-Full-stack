'use client'

import useRooms from "@/app/hooks/useRooms";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
export default function ChatRoomList() {
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
    } = useRooms();
    const router = useRouter();
    const rooms = data?.pages.flatMap(page => page.results) || [];
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth()
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (status === 'pending') {
        return <div className="p-4 text-center">Loading rooms...</div>;
    }

    if (status === "error") {
        return <div className="p-4 text-red-500">Error: {error?.message}</div>;
    }

    return (
        <div className="flex-1  overflow-y-auto  scrollbar-custom">
            {rooms.map((room) => {
                // Get the other member in DM ()
                const otherMember = room.members.length > 1
                    ? room.members.find(member => member.id !== user?.id)
                    : room.members[0];

                // Determine avatar URL
                const avatarUrl = room.display_avatar ||
                    otherMember?.image ||
                    "/default-avatar.png";

                // Determine display name
                const displayName = room.display_name ||
                    room.name ||
                    otherMember?.username ||
                    "Unknown User";

                return (
                    <div
                        key={room.id}
                        className="flex items-center gap-3 p-4   hover:bg-sky-100 cursor-pointer"
                        onClick={() => router.push(`/chat/${room.id}`)}
                        style={{
                            boxShadow: "rgba(0, 0, 0, 0.45) 0px 25px 20px -30px",
                        }}
                    >
                        {/* Avatar */}
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <Image
                                src={avatarUrl}
                                alt={displayName}
                                fill
                                className="object-cover"
                                sizes="40px"
                                onError={(e) => {
                                    // Fallback to default avatar if image fails to load
                                    const img = e.target as HTMLImageElement;
                                    img.src = "/default-avatar.png";
                                }}
                            />
                        </div>

                        {/* Room info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate ">
                                {displayName}
                            </h3>
                            {room.last_message && (
                                <p className="text-sm text-gray-500 truncate">
                                    {room.last_message.content}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Loading indicator at the bottom */}
            <div ref={loadMoreRef} className="h-8 flex items-center justify-center">
                {isFetchingNextPage && <p className="text-sm text-gray-500">Loading more rooms...</p>}
            </div>

            {/* Initial loading indicator */}
            {isFetching && !isFetchingNextPage && (
                <div className="p-4 text-center text-gray-500">Loading...</div>
            )}
        </div>
    );
}