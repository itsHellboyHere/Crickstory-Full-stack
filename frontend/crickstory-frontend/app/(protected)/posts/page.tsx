'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

import PostCard from '@/app/components/PostCard';
import PostSkeleton from '@/app/components/PostSkeleton';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import { RootState, AppDispatch } from '@/app/store/store';
import { fetchPostsThunk, resetPosts } from '@/app/features/postsSlice';
import { useAppDispatch, useAppSelector } from '@/app/store/hook';
import { usePostFeedSocket } from '@/app/hooks/usePostFeedSocket';
export default function PostsPage() {
    const dispatch = useAppDispatch();
    const { posts, status, nextCursor, hasMore } = useAppSelector((state: RootState) => state.posts)
    const { user } = useAuth();
    const loadMoreRef = useRef<HTMLDivElement>(null); // Ref for IntersectionObserver

    usePostFeedSocket();
    const loadPosts = useCallback(() => {
        if (status === 'loading' || !hasMore) return;
        dispatch(fetchPostsThunk(nextCursor || undefined));

    }, [dispatch, status, hasMore, nextCursor]);


    useEffect(() => {
        if (posts.length === 0) {
            loadPosts();
        }
    }, [loadPosts, posts.length]);


    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && status !== 'loading') {
                    loadPosts();
                }
            },
            {
                root: null,
                threshold: 1.0,
            }
        );

        const el = loadMoreRef.current;
        if (el) observer.observe(el);
        return () => {
            if (el) observer.unobserve(el);
        };
    }, [loadPosts, hasMore, status]);

    // ✅ Pull-to-refresh
    const handleRefresh = async () => {
        dispatch(resetPosts());
        dispatch(fetchPostsThunk(undefined))
    };


    const [showTopBtn, setShowTopBtn] = useState(false);

    useEffect(() => {
        const handleShowBtn = () => {
            if (window.scrollY > window.innerHeight * 0.2) {
                setShowTopBtn(true);
            } else {
                setShowTopBtn(false);
            }
        };
        handleShowBtn();
        window.addEventListener('scroll', handleShowBtn);
        return () => window.removeEventListener('scroll', handleShowBtn);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <div className="max-w-2xl mx-auto pb-20 mt-4 min-h-screen">
                {/* Refresh Button */}
                <div className="flex justify-center my-4">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded hover:bg-sky-200 transition"
                    >
                        <Image src="/cricket-bat.svg" alt="Refresh" width={24} height={24} />
                        Refresh Feed
                    </button>
                </div>

                {/* Post List */}
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard
                            key={`post-${post.id}-${post.created_at}`}
                            post={post}
                            currentUserId={user?.id}
                        />
                    ))}
                </div>

                {/* Skeleton Loader */}
                {status === 'loading' && <PostSkeleton count={3} />}

                {/* End Message */}
                {!hasMore && posts.length > 0 && (
                    <div className="text-center py-6 text-gray-500">
                        You've reached the end of the feed
                    </div>
                )}

                {/* Sentinel for IntersectionObserver */}
                <div ref={loadMoreRef} className="h-10" />
            </div>

            {/* Scroll to top */}
            {showTopBtn && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 bg-blue-500 p-3 rounded-full shadow-lg hover:bg-blue-600 transition z-50"
                    aria-label="Scroll to top"
                >
                    <Image src="/cricket-bat.svg" alt="Top" width={24} height={24} />
                </button>
            )}
        </>
    );
}
