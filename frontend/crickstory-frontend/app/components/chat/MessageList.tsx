"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessagesThunk } from "@/app/features/messageSlice";
import { RootState, AppDispatch } from "@/app/store/store";
import MessageSkeleton from "../MessageSkeleton";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import MediaViewerModal from "./MediaViewerModal";
import useChatSocket from "@/app/hooks/useChatSocket";

interface Props {
    roomId: number;
}

export default function MessageList({ roomId }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const containerRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    const room = useSelector((state: RootState) => state.messages.messagesByRoom[roomId]);
    const messages = room?.messages || [];
    const status = room?.status || "idle";
    const nextPage = room?.nextPage;
    const hasNextPage = room?.hasNextPage;

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        });
    };

    useEffect(() => {
        if (!room) {
            dispatch(fetchMessagesThunk({ roomId, page: 1 }));
        }
    }, [dispatch, roomId, room]);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [roomId, messages.length]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && status !== "loading") {
                    const prevHeight = containerRef.current?.scrollHeight ?? 0;
                    dispatch(fetchMessagesThunk({ roomId, page: nextPage! })).then(() => {
                        requestAnimationFrame(() => {
                            if (containerRef.current) {
                                const newHeight = containerRef.current.scrollHeight;
                                containerRef.current.scrollTop = newHeight - prevHeight;
                            }
                        });
                    });
                }
            },
            { root: containerRef.current, threshold: 1.0 }
        );

        const topEl = topRef.current;
        if (topEl) observer.observe(topEl);
        return () => {
            if (topEl) observer.unobserve(topEl);
        };
    }, [nextPage, hasNextPage, status, dispatch, roomId]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMedia, setModalMedia] = useState<{ url: string | null; type: "image" | "video" } | null>(null);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    useEffect(() => {
        if (typingUser) {
            scrollToBottom(); // Make sure typing indicator is visible
            const timeout = setTimeout(() => setTypingUser(null), 3000);
            return () => clearTimeout(timeout);
        }
    }, [typingUser]);

    useChatSocket(roomId, (username: string | null) => {
        if (username && username !== user?.username) {
            setTypingUser(username);
        }
    });


    return (
        <div
            ref={containerRef}
            className="flex flex-col overflow-y-auto flex-1 px-4 py-6 gap-3 scrollbar-custom pb-6"
        >
            <div ref={topRef} />

            {status === "loading" && messages.length > 0 && hasNextPage && (
                <div className="text-center text-sm text-gray-500 mb-2">Loading older messages...</div>
            )}

            {status === "loading" && messages.length === 0 ? (
                <>
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className={i % 2 === 0 ? "self-start" : "self-end"}>
                            <MessageSkeleton />
                        </div>
                    ))}
                </>
            ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-500 mt-10 space-y-2">
                    <div className="text-4xl">💬</div>
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs text-gray-400">Say something to start the conversation!</p>
                </div>
            ) : (
                messages.map((msg) => {
                    if (!msg || !msg.id || !msg.sender) return null;
                    const isMe = msg.sender.username === user?.username;
                    const isMedia = msg.message_type === "image" || msg.message_type === "video";

                    return (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                            {!isMe && msg.sender.image && (
                                <div className="w-8 h-8 mb-1 relative rounded-full overflow-hidden">
                                    <Image
                                        src={msg.sender.image}
                                        alt={msg.sender.username}
                                        fill
                                        className="object-cover rounded-full"
                                    />
                                </div>
                            )}

                            {!isMedia && (
                                <div
                                    className={`relative max-w-[75%] px-4 py-3 text-sm rounded-2xl shadow-md transition-all duration-300
                                        ${isMe
                                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none ml-auto"
                                            : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                                        } group`}
                                >
                                    {!isMe && (
                                        <p className="text-xs text-gray-500 mb-1">
                                            {msg.sender.name || msg.sender.username}
                                        </p>
                                    )}

                                    {msg.message_type === "text" && (
                                        <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                                    )}

                                    {msg.message_type === "file" && msg.file_url && (
                                        <Link
                                            href={msg.file_url}
                                            target="_blank"
                                            className="underline text-xs break-all text-blue-600"
                                        >
                                            📎 Download File
                                        </Link>
                                    )}
                                </div>
                            )}

                            {msg.message_type === "image" && msg.file_url && (
                                <div
                                    className="group relative overflow-hidden rounded-lg cursor-pointer max-w-[75%]"
                                    onClick={() => {
                                        setModalMedia({ url: msg.file_url, type: "image" });
                                        setModalOpen(true);
                                    }}
                                >
                                    {!isMe && (
                                        <p className="text-xs text-gray-500 mb-1">
                                            {msg.sender.name || msg.sender.username}
                                        </p>
                                    )}
                                    <Image
                                        src={msg.file_url}
                                        alt="Image message"
                                        width={250}
                                        height={250}
                                        className="transition-transform duration-300 group-hover:scale-105 rounded-md"
                                    />
                                </div>
                            )}

                            {msg.message_type === "video" && msg.file_url && (
                                <div
                                    className="cursor-pointer group overflow-hidden rounded-md max-w-[75%]"
                                    onClick={() => {
                                        setModalMedia({ url: msg.file_url, type: "video" });
                                        setModalOpen(true);
                                    }}
                                >
                                    {!isMe && (
                                        <p className="text-xs text-gray-500 mb-1">
                                            {msg.sender.name || msg.sender.username}
                                        </p>
                                    )}
                                    <video
                                        src={msg.file_url}
                                        className="rounded-md w-[250px] h-[400px] object-cover group-hover:scale-[1.02] transition-transform"
                                        muted
                                        preload="metadata"
                                    />
                                    <p className="text-xs mt-1 text-center text-gray-400">View</p>
                                </div>
                            )}
                        </div>
                    );
                })
            )}

            <div
                className={`transition-opacity duration-200 ease-in ${typingUser ? "opacity-100" : "opacity-0"
                    }`}
                style={{ minHeight: "15px" }}
            >
                {typingUser && (
                    <div className="px-2 pt-2 text-xs text-gray-500 italic">
                        {typingUser} is typing...
                    </div>
                )}
            </div>


            <MediaViewerModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                mediaType={modalMedia?.type || "image"}
                fileUrl={modalMedia?.url || ""}
            />
        </div>
    );
}
