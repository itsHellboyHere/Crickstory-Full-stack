// components/PostCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types/next-auth';
import InteractivePostActions from './InteractivePostActions';
import SavePostButton from './SavedPostButton';
import { memo } from 'react';
import styles from "../css/Post.module.css";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useState } from "react";
import { useRouter } from 'next/navigation'; // Changed from 'next/router'

interface PostCardProps {
    post: Post;
    currentUserId?: number;
}

function PostCard({ post, currentUserId }: PostCardProps) {
    const router = useRouter(); // Now using the correct router
    const isSaved = post.is_saved
    const isLiked = post.is_liked
    const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
        loop: false,
        slides: {
            perView: 1,
            spacing: 0,
        },
        dragSpeed: 0.5,
        created() {
            setLoaded(true);
        },
    });
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const handlePostClick = () => {
        router.push(`/posts/${post.id}`);
    };

    // Rest of your component remains the same...
    return (
        <article className={`bg-white  border border-gray-200 rounded-lg mb-6 ${styles.postCardContainer}`}>
            {/* Header */}
            <header className="flex items-center p-4">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <Link href={`/profile/${post.user.username}`}>
                        <Image
                            src={post.user.image || '/default-avatar.png'}
                            width={40}
                            height={40}
                            alt={post.user.name || post.user.username}
                            className="object-cover"
                        />
                    </Link>
                </div>
                <div className="flex-1">
                    <Link
                        href={`/profile/${post.user.username}`}
                        className="font-semibold hover:underline"
                    >
                        {post.user.name || post.user.username}
                    </Link>
                    {/* <p className="text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p> */}
                    {post.location && (
                        <p className="text-gray-500 text-xs mt-1">
                            {post.location}
                        </p>
                    )}
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
            </header>

            {/* Image/Video Slider */}
            {post.media.length > 0 && (
                <div className="relative aspect-square bg-black  overflow-hidden max-w-full">
                    <div
                        ref={sliderRef}
                        className="keen-slider h-full w-full overflow-hidden"
                        onClick={handlePostClick}
                    >
                        {post.media.map((media, index) => (
                            <div className="keen-slider__slide !w-full !max-w-full relative h-full" key={media.id}>
                                <div className="absolute inset-0 cursor-pointer w-full h-full">
                                    {media.media_type === 'image' ? (
                                        <div className="absolute inset-0 w-full h-full">
                                            <Image
                                                src={media.url}
                                                fill
                                                alt={`media-${index}`}
                                                className="object-cover"
                                                sizes="100vw"
                                            />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 w-full h-full">
                                            <video
                                                src={media.url}
                                                className="w-full h-full object-cover"
                                                playsInline
                                                muted
                                                loop
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation dots */}
                    {post.media.length > 1 && loaded && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                            {post.media.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        instanceRef.current?.moveToIdx(i);
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-4' : 'bg-gray-400 bg-opacity-50'} opacity-80`}
                                    aria-label={`Go to slide ${i + 1}`}
                                ></button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Rest of your component... */}
            <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <InteractivePostActions
                        postId={post.id}
                        initialLikes={post.likes_count}
                        initialComments={post.comments_count}
                        initialIsLiked={isLiked}
                    />
                    <SavePostButton
                        postId={post.id}
                        userId={currentUserId}
                        initiallySaved={isSaved}
                    />
                </div>

                <p className="text-sm mb-1">
                    <Link
                        href={`/profile/${post.user.username}`}
                        className="font-semibold mr-2 hover:underline"
                    >
                        {post.user.name || post.user.username}
                    </Link>
                    {post.title}
                </p>

                {post.comments_count === 0 ? (
                    <span className="text-gray-500 text-sm">No comments yet</span>
                ) : (
                    (
                        <div className="mt-1">
                            <Link
                                href={`/posts/${post.id}`}
                                className="text-gray-500 text-sm hover:underline"
                            >
                                View all {post.comments_count} comments
                            </Link>
                        </div>
                    )
                )}

                <p className="text-gray-400 text-xs mt-2">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
            </div>
        </article>
    );
}

export default memo(PostCard);