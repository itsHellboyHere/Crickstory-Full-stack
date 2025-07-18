'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import axios from '@/app/utils/axios';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Comment } from '@/types/next-auth';
import { connectCommentSocket } from '../utils/commentsocket';

export default function CommentList({ postId }: { postId: number }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [nextUrl, setNextUrl] = useState<string | null>(`/api/posts/${postId}/comments/`);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchPage = useCallback(async () => {
        if (!nextUrl || loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await axios.get(nextUrl);
            // results are from newest to oldest
            const newComments = res.data.results;
            setComments(prev => {
                const merged = [...prev, ...newComments];
                const unique = new Map(merged.map(comment => [comment.id, comment]));
                return Array.from(unique.values());
            });
            setNextUrl(res.data.next?.replace('http://localhost:8000', ''));
        } catch {
            toast.error('Could not load comments');
        } finally {
            setLoadingMore(false);
        }
    }, [nextUrl, loadingMore]);

    useEffect(() => {
        fetchPage();
    }, []);


    useEffect(() => {
        const socket = connectCommentSocket(postId);
        socket.onmessage = (event) => {
            const newComment = JSON.parse(event.data);
            setComments(prev => {
                const updated = [
                    newComment,
                    ...prev.filter(c => c.id !== newComment.id),
                ];
                return updated;
            });

        };
        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [postId]);

    return (
        <div className="h-full overflow-y-auto scrollbar-hide  will-change-transform">
            {comments.map((c) => (
                <div key={c.id} className="flex gap-3 items-start px-2 mt-2">
                    <Link href={`/profile/${c.user.username}`}>
                        <div className="w-9 h-9 relative shrink-0 hover:opacity-80 transition-all">
                            <Image
                                src={c.user.image || '/default-avatar.png'}
                                alt={c.user.username}
                                fill
                                className="rounded-full object-contain border"
                            />
                        </div>
                    </Link>
                    <div className="min-w-0">
                        <p className="bg-gray-100 rounded-lg p-2 text-sm leading-snug w-full whitespace-pre-wrap break-all overflow-hidden">
                            <Link href={`/profile/${c.user.username}`} className="font-semibold mr-2">
                                {c.user.username}
                            </Link>
                            <span>{c.content}</span>
                        </p>
                        <span className="text-xs text-gray-500 mt-1">
                            {new Date(c.created_at).toLocaleString()}
                        </span>
                    </div>
                </div>
            ))}

            {nextUrl && (
                <div className="text-center py-2">
                    <button
                        onClick={fetchPage}
                        className="text-sm text-blue-500 hover:underline disabled:text-gray-400"
                    >
                        {loadingMore ? 'Loading...' : 'Load more comments'}
                    </button>
                </div>
            )}
        </div>
    );
}
