'use client'
import styles from "@/app/css/Search.module.css";
import { useState } from "react";
import useInfiniteSearchQuery from "@/app/hooks/useUserSearch";
import Image from "next/image";
import Link from "next/link";
import { useDebounce } from "../hooks/useDebounce";

const TABS = ["all", "users", "posts"];

export default function SearchComponent() {
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "users" | "posts">("all");
    const debouncedQuery = useDebounce(input, 400);

    const {
        data,
        isLoading,
        isError,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteSearchQuery(debouncedQuery, activeTab);

    const handleTabChange = (tab: "all" | "users" | "posts") => {
        setActiveTab(tab);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    return (
        <div className="px-4 pb-4">
            <h2 className={styles.searchTitle}>Search</h2>

            <div className="sticky top-0 z-10 bg-white">
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder=" "
                        value={input}
                        onChange={handleChange}
                        className={styles.searchInput}
                    />
                    <label className={styles.floatingLabel}>
                        Search users or posts...
                    </label>
                </div>

                <div className="flex gap-4 mt-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab as any)}
                            className={`capitalize px-3 py-1 rounded ${activeTab === tab
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`${styles.searchResultsCard} mt-4`}>
                {input && !isLoading && data?.pages[0]?.users?.length === 0 && data?.pages[0]?.posts?.length === 0 && (
                    <p className="text-gray-500">No results found.</p>
                )}

                {data?.pages.map((page, pageIndex) => (
                    <div key={pageIndex}>
                        {(activeTab === "all" || activeTab === "users") &&
                            page.users?.map((item: any) => {
                                const user = item.document;
                                return (
                                    <Link href={`/profile/${user.username}`} key={user.id}>
                                        <div className={styles.card}>
                                            <Image
                                                src={user.image || "/default-avatar.png"}
                                                alt={user.username}
                                                width={48}
                                                height={48}
                                                className={styles.avatar}
                                            />
                                            <div className={styles.userInfo}>
                                                <p className={styles.name}>{user.name}</p>
                                                <p className={styles.username}>@{user.username}</p>
                                                <p className={`${styles.followCount} text-gray-500`}>
                                                    Followed by {user.follower_count}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}

                        {(activeTab === "all" || activeTab === "posts") &&
                            page.posts?.map((item: any) => {
                                const post = item.document;
                                return (
                                    <div
                                        key={post.id}
                                        className={` p-3 rounded-md mb-2 shadow ${styles.postSearchCard}`}
                                    >
                                        <h4 className="font-semibold text-lg">{post.title}</h4>
                                        <p className="text-sm text-gray-500">
                                            {post.location || ""}
                                        </p>
                                        <div className="text-xs mt-1 text-blue-600">
                                            {post.tags?.join(", ")}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ))}

                {hasNextPage && (
                    <button
                        onClick={() => fetchNextPage()}
                        className="mt-4 w-full py-2 text-blue-600 hover:underline"
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? "Loading more..." : "Load more"}
                    </button>
                )}

                {isLoading && (
                    <div className="mt-4 text-sm text-gray-500">Loading...</div>
                )}

                {isError && (
                    <div className="mt-4 text-red-500 text-sm">
                        Error fetching results. Try again later.
                    </div>
                )}
            </div>
        </div>
    );
}
