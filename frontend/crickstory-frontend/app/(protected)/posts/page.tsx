'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchPosts } from '@/app/lib/fetchPosts';
import PostCard from '@/app/components/PostCard';
import PostSkeleton from '@/app/components/PostSkeleton';
import { useAuth } from '@/app/context/AuthContext';
import { Post } from '@/types/next-auth';
import Image from 'next/image';

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { user } = useAuth();

    const loadPosts = useCallback(async () => {
        if (!hasMore || loading) return;

        setLoading(true);
        try {
            const data = await fetchPosts(cursor || undefined);

            setPosts(prev => {
                const newPosts = data.results.filter(
                    newPost => !prev.some(post => post.id === newPost.id)
                );
                return [...prev, ...newPosts];
            });

            const nextCursor = data.next ? new URL(data.next).searchParams.get('cursor') : null;
            console.log(nextCursor)
            setCursor(nextCursor);
            setHasMore(!!nextCursor);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    }, [cursor, hasMore, loading]);

    const handleScroll = useCallback(() => {
        if (
            window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.scrollHeight - 100 &&
            hasMore &&
            !loading
        ) {
            loadPosts();
        }
    }, [hasMore, loading, loadPosts]);

    useEffect(() => {
        if (posts.length === 0) {
            loadPosts();
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll, loadPosts, posts.length]);

    // ✅ Auto - load if screen is not filled
    useEffect(() => {
        const checkIfFillNeeded = () => {
            if (
                document.documentElement.scrollHeight <= window.innerHeight &&
                hasMore &&
                !loading
            ) {
                loadPosts();
            }
        };

        checkIfFillNeeded();

        const interval = setInterval(checkIfFillNeeded, 500);
        return () => clearInterval(interval);
    }, [posts, hasMore, loading, loadPosts]);
    // ✅ Pull-to-refresh
    const handleRefresh = async () => {
        setPosts([]);
        setCursor(null);
        setHasMore(true);
        await loadPosts();
    };
    const [showTopBtn, setShowTopBtn] = useState(false);
    console.log("scroll-y ", window.scrollY)
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
            <div className="max-w-2xl mx-auto pb-20 mt-4  min-h-screen">
                <div className="flex justify-center my-4">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2  text-gray-600 rounded hover:bg-sky-200 transition"
                    >
                        <Image src="/cricket-bat.svg" alt="Refresh" width={24} height={24} />
                        Refresh Feed
                    </button>
                </div>

                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard
                            key={`post-${post.id}-${post.created_at}`}
                            post={post}
                            currentUserId={user?.id}
                        />
                    ))}
                </div>

                {loading && <PostSkeleton count={3} />}

                {!hasMore && posts.length > 0 && (
                    <div className="text-center py-6 text-gray-500">
                        You've reached the end of the feed
                    </div>
                )}
            </div>


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


