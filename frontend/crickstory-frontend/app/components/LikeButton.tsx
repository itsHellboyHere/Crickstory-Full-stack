'use client';
import { useState } from 'react';
import axios from "@/app/utils/axios";
import { useRouter } from 'next/navigation';

export default function LikeButton({
    postId,
    initialLikes,
    isLiked: initialIsLiked
}: {
    postId: number;
    initialLikes: number;
    isLiked: boolean;
}) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleClick = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const res = await axios.post(`/api/posts/${postId}/like/`);
            const { liked, total_likes = 0 } = res.data;
            console.log(res.data)
            setIsLiked(liked);
            setLikes(total_likes);

            router.refresh();
        } finally {
            setIsLoading(false);
        }
    };
    console.log("likes ", likes)
    const renderLikeText = () => {
        if (likes === 0) return "Be the first to like this";
        if (isLiked && likes === 1) return "Liked by you";
        if (isLiked) return `Liked by you and ${likes - 1} other${likes - 1 === 1 ? '' : 's'}`;
        return `${likes} like${likes === 1 ? '' : 's'}`;
    };

    return (
        <div className="flex flex-row items-start gap-2">
            <button
                onClick={handleClick}
                disabled={isLoading}
                className={`flex items-center  px-3 py-1.5 rounded-full transition-colors
                    ${isLiked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-100'}
                    ${isLoading ? 'opacity-70' : ''}`}
                aria-label={isLiked ? 'Unlike' : 'Like'}
            >
                {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></span>
                ) : isLiked ? (
                    <span className="text-red-500">❤️</span>
                ) : (
                    <span className="text-gray-500">🤍</span>
                )}
            </button>

            {/* Only render like text below */}
            <p className="text-xs text-gray-600 ml-2 px-2 py-2.5">{renderLikeText()}</p>
        </div>
    );
}
