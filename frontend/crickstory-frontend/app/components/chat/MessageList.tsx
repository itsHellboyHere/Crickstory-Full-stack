"use client";

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessagesThunk } from "@/app/features/messageSlice";
import { RootState, AppDispatch } from "@/app/store/store";
import MessageSkeleton from "../MessageSkeleton";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import MediaViewerModal from "./MediaViewerModal";

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

    // First fetch
    useEffect(() => {
        if (!room) {
            dispatch(fetchMessagesThunk({ roomId, page: 1 }));
        }
    }, [dispatch, roomId, room]);

    // Scroll to bottom when messages load initially
    useEffect(() => {
        if (messages.length > 0 && containerRef.current) {
            requestAnimationFrame(() => {
                containerRef.current!.scrollTop = containerRef.current!.scrollHeight;
            });
        }
    }, [roomId, messages.length]);

    // Load older messages on scroll to top
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
    const [modalOpen, setModalOpen] = React.useState(false);
    const [modalMedia, setModalMedia] = React.useState<{ url: string | null; type: "image" | "video" } | null>(null);


    return (
        <div
            ref={containerRef}
            className="flex flex-col overflow-y-auto flex-1 p-4 space-y-3 scrollbar-custom"
        >
            <div ref={topRef} />

            {/* ⏳ Spinner while loading older messages */}
            {status === "loading" && messages.length > 0 && hasNextPage && (
                <div className="text-center text-sm text-gray-500 mb-2">Loading older messages...</div>
            )}

            {/* 🧱 Initial skeletons */}
            {status === "loading" && messages.length === 0 ? (
                <>
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className={i % 2 === 0 ? "self-start" : "self-end"}>
                            <MessageSkeleton />
                        </div>
                    ))}
                </>
            ) : (
                messages.map((msg) => {
                    if (!msg || !msg.id || !msg.sender) return null;
                    const isMe = msg.sender.username === user?.username;

                    return (
                        <div key={msg.id} className={`flex items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && msg.sender.image && (
                                <div className="w-8 h-8 mr-2 relative rounded-full overflow-hidden">
                                    <Image src={msg.sender.image} alt={msg.sender.username} fill className="object-cover rounded-full" />
                                </div>
                            )}

                            <div
                                className={`max-w-[70%] p-3 rounded-lg text-sm 
                  ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} 
                  ${isMe ? 'rounded-br-none' : 'rounded-bl-none'} 
                  space-y-1`}
                            >
                                {!isMe && (
                                    <p className="text-xs text-gray-500 mb-1">
                                        {msg.sender.name || msg.sender.username}
                                    </p>
                                )}

                                {msg.message_type === 'text' && (
                                    <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                                )}
                                {msg.message_type === 'image' && msg.file_url && (
                                    <Image
                                        src={msg.file_url}
                                        alt="Image message"
                                        width={250}
                                        height={250}
                                        className="rounded-md cursor-pointer "
                                        onClick={() => {
                                            setModalMedia({ url: msg.file_url, type: "image" });
                                            setModalOpen(true);
                                        }}
                                    />
                                )}
                                {msg.message_type === 'video' && msg.file_url && (
                                    <div className="cursor-pointer  " onClick={() => {
                                        setModalMedia({ url: msg.file_url, type: "video" });
                                        setModalOpen(true);
                                    }}>
                                        <video
                                            src={msg.file_url}
                                            className="rounded-md w-[250px] h-[400px] object-cover"
                                            muted
                                            preload="metadata"
                                        />

                                        <p className="text-xs mt-1 text-center text-gray-200">View</p>
                                    </div>
                                )}

                                {msg.message_type === 'file' && msg.file_url && (
                                    <Link href={msg.file_url} target="_blank" className="underline text-xs break-all">
                                        📎 Download File
                                    </Link>
                                )}
                                <MediaViewerModal
                                    isOpen={modalOpen}
                                    onClose={() => setModalOpen(false)}
                                    mediaType={modalMedia?.type || "image"}
                                    fileUrl={modalMedia?.url || ""}
                                />
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
