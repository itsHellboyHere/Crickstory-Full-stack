'use client';
import { useEffect, useRef, useState } from 'react';
import axios from '@/app/utils/axios';
import toast from 'react-hot-toast';

export default function AddCommentInput({ postId }: { postId: number }) {
    const [content, setContent] = useState('');
    const [posting, setPosting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setPosting(true);
        try {
            await axios.post(`/api/posts/${postId}/comments/`, { content });
            setContent('');
        } catch {
            toast.error('Failed to add comment.');
        } finally {
            setPosting(false);
        }
    };

    // Auto resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center  gap-2 bg-white z-20 p-2"
        >
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 resize-none rounded-xl border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 break-words overflow-hidden"
                rows={1}
                maxLength={500}
                disabled={posting}
            />
            <button
                type="submit"
                disabled={posting || !content.trim()}
                className="text-blue-500 font-semibold  px-2 py-2  text-sm disabled:opacity-40"
            >
                Post
            </button>
        </form>
    );
}
