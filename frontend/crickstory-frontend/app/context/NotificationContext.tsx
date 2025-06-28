'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode
} from 'react';
import axios from '@/app/utils/axios';
import { connectSocket } from '@/app/utils/socket';

type Notification = {
    id: number;
    message: string;
    type: string;
    is_seen: boolean;
    created_at: string;
    sender_username?: string;
    extra_data?: any;
};

type ContextType = {
    notifications: Notification[];
    unseenCount: number;
    markAsSeen: (id: number) => Promise<void>;
};

const NotificationContext = createContext<ContextType>({
    notifications: [],
    unseenCount: 0,
    markAsSeen: async () => { },
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load persisted notifications on mount
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const res = await axios.get('/api/notifications/');
                setNotifications(res.data);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };
        loadNotifications();
    }, []);

    //  WebSocket connection
    useEffect(() => {
        const socket = connectSocket();

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📥 New notification:", data);

            setNotifications((prev) => [
                {
                    id: data.id,
                    message: data.message,
                    type: data.type,
                    is_seen: false,
                    created_at: new Date().toISOString(),
                    extra_data: data.extra_data,
                    
                },
                ...prev,
            ]);
        };


        return () => socket.close();
    }, []);

    const markAsSeen = async (id: number) => {
        try {
            await axios.post(`/api/notifications/${id}/seen/`);
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === id ? { ...notif, is_seen: true } : notif
                )
            );
        } catch (err) {
            console.error("Failed to mark notification as seen", err);
        }
    };

    const unseenCount = notifications.filter((n) => !n.is_seen).length;

    return (
        <NotificationContext.Provider value={{ notifications, unseenCount, markAsSeen }}>
            {children}
        </NotificationContext.Provider>
    );
};
