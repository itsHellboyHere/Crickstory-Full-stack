'use client';

import { useTransition, useState } from "react";
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import toast from "react-hot-toast";
import { toggleSave } from "../lib/toggleSave";

type SavePostButtonProps = {
    postId: number;
    userId?: number;
    initiallySaved: boolean;
};

export default function SavePostButton({
    postId,
    userId,
    initiallySaved
}: SavePostButtonProps) {
    const [isSaved, setIsSaved] = useState(initiallySaved);
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            try {
                const result = await toggleSave(postId); // returns { saved: true/false }
                setIsSaved(result.saved);
                toast.success(result.saved ? "Post saved!" : "Removed from saved posts.");
            } catch (error: any) {
                console.error("Save error:", error);
                toast.error(
                    error.response?.data?.error || "Failed to save post. Please try again."
                );
            }
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className="p-2 rounded-md hover:bg-gray-100 transition"
        >
            {isSaved ? (
                <BookmarkSolid className="w-6 h-6 text-blue-600" />
            ) : (
                <BookmarkOutline className="w-6 h-6 text-gray-600" />
            )}
        </button>
    );
}
