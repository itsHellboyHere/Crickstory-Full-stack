'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/app/utils/axios';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';

type Member = {
    username: string;
    name?: string;
    image?: string | null;
};

type RoomData = {
    id?: number;
    room_type?: string;
    display_name?: string;
    name?: string;
    display_avatar?: string | null;
    members?: Member[];
};

export default function ChatHeader({ roomId }: { roomId: number }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<RoomData>({});
    const { user } = useAuth();

    useEffect(() => {
        const fetchRoomById = async (Id: number) => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/chat/rooms/${Id}`);
                setData(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoomById(roomId);
    }, [roomId]);

    if (loading) {
        return <div className="h-17 w-full bg-gray-100 animate-pulse" />;
    }

    const isGroup = data.room_type === 'group';

    const otherMember = data.members?.find((m) => m.username !== user?.username);

    const title = isGroup
        ? data.display_name || data.name || `Group ${data.id}`
        : otherMember?.name?.trim() || otherMember?.username || 'DM';

    const avatar = isGroup
        ? data.display_avatar
        : otherMember?.image;

    return (
        <div className="px-3 py-3 mt-2  bg-white shadow-sm sticky top-0 z-10 flex items-center space-x-3 md:ml-1 md:mt-0">
            {avatar ? (
                <div className="relative w-10 h-10">
                    <Image
                        src={avatar}
                        alt="Avatar"
                        layout="fill"
                        className="rounded-full object-cover"
                        sizes="40px"
                    />
                </div>
            ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300" />
            )}
            <h2 className="font-semibold text-lg truncate">{title}</h2>
        </div>
    );
}
