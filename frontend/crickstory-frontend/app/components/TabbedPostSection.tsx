'use client';

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import PostProfile from "./PostProfile";
import styles from "../css/Postprofile.module.css";
import { ImageIcon, BookmarkIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "@/app/utils/axios";
import { Post, PostsResponse } from "@/types/next-auth";
import ProfilePostSkeleton from "./ProfilePostSkeleton";

export default function TabbedPostSection({
    initialPosts,
    initialSavedPosts,
    postNextUrl,
    savedNextUrl,
    isCurrentUser,
    geistSansClass,
}: {
    initialPosts: Post[];
    initialSavedPosts: Post[];
    postNextUrl: string | null;
    savedNextUrl: string | null;
    isCurrentUser: boolean;
    geistSansClass: string;
}) {
    const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [savedPosts, setSavedPosts] = useState<Post[]>(initialSavedPosts);
    const [postNext, setPostNext] = useState<string | null>(postNextUrl);
    const [savedNext, setSavedNext] = useState<string | null>(savedNextUrl);

    const [loadingMore, setLoadingMore] = useState(false);
    const observerRef = useRef<HTMLDivElement>(null);

    const tabs = [
        { key: "posts", label: "Posts", icon: <ImageIcon size={16} /> },
        ...(isCurrentUser
            ? [{ key: "saved", label: "Saved", icon: <BookmarkIcon size={16} /> }]
            : []),
    ];

    const loadMore = async () => {
        if (loadingMore) return;

        const nextUrl = activeTab === "posts" ? postNext : savedNext;
        if (!nextUrl) return;

        try {
            setLoadingMore(true);
            const res = await axios.get<PostsResponse>(nextUrl);

            if (activeTab === "posts") {
                setPosts(prev => [...prev, ...res.data.results]);
                setPostNext(res.data.next);
            } else {
                setSavedPosts(prev => [...prev, ...res.data.results]);
                setSavedNext(res.data.next);
            }
        } catch (err) {
            console.error("Failed to load more posts", err);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) loadMore();
            },
            { threshold: 1.0 }
        );

        if (observerRef.current) observer.observe(observerRef.current);
        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [activeTab, postNext, savedNext]);

    const displayedPosts = activeTab === "posts" ? posts : savedPosts;

    return (
        <div className="w-full">
            <div className="flex justify-center border-b border-gray-300 mb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as "posts" | "saved")}
                        className={clsx(
                            "px-6 py-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wide",
                            activeTab === tab.key
                                ? "text-black border-b-2 border-black"
                                : "text-gray-500 hover:text-black"
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className={styles.postGrid}
                >
                    {displayedPosts.map(post => (
                        <PostProfile key={post.id} post={post} />
                    ))}
                </motion.div>
            </AnimatePresence>

            <div ref={observerRef} className="h-10" />
            {loadingMore && <ProfilePostSkeleton count={3} />}
        </div>
    );
}
