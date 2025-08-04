// components/PostCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types/next-auth';
import InteractivePostActions from './InteractivePostActions';
import SavePostButton from './SavedPostButton';
import { memo, useState } from 'react';
import styles from '../css/Post.module.css';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { useRouter } from 'next/navigation';

interface PostCardProps {
    post: Post;
    currentUserId?: number;
}

function PostCard({ post, currentUserId }: PostCardProps) {
    const router = useRouter();
    const isSaved = post.is_saved;
    const isLiked = post.is_liked;

    const [currentSlide, setCurrentSlide] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
        loop: false,
        slides: {
            perView: 1,
            spacing: 0,
        },
        dragSpeed: 0.5,
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
        created() {
            setLoaded(true);
        },
    });

    const handlePostClick = () => {
        router.push(`/posts/${post.id}`);
    };

    return (
        <article className={`bg-white border border-gray-200 rounded-lg mb-6 ${styles.postCardContainer}`}>
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
                    <Link href={`/profile/${post.user.username}`} className="font-semibold hover:underline">
                        {post.user.name || post.user.username}
                    </Link>
                    {post.location && (
                        <p className="text-gray-500 text-xs mt-1">{post.location}</p>
                    )}
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
            </header>

            {/* Media Slider */}
            {post.media.length > 0 && (
                <div
                    onClick={handlePostClick}
                    className="relative aspect-square bg-black overflow-hidden max-w-full cursor-pointer"
                >
                    <div
                        ref={sliderRef}
                        className="keen-slider h-full w-full overflow-hidden"
                    >
                        {post.media.map((media, index) => (
                            <div
                                className="keen-slider__slide !w-full !max-w-full relative h-full"
                                key={media.id}
                            >
                                <div className="absolute inset-0 w-full h-full">
                                    {media.media_type === 'image' ? (
                                        <Image
                                            src={media.url}
                                            fill
                                            alt={`media-${index}`}
                                            className="object-cover"
                                            sizes="100vw"
                                        />
                                    ) : (
                                        <video
                                            src={media.url}
                                            className="w-full h-full object-cover"
                                            muted
                                            autoPlay
                                            playsInline
                                            loop
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Dots */}
                    {post.media.length > 1 && loaded && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                            {post.media.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        instanceRef.current?.moveToIdx(i);
                                    }}
                                    className={`h-3 w-3 md:h-4 md:w-4 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-white scale-125' : 'bg-gray-400 bg-opacity-50'
                                        }`}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
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
                    <div className="mt-1">
                        <Link
                            href={`/posts/${post.id}`}
                            className="text-gray-500 text-sm hover:underline"
                        >
                            View all {post.comments_count} comments
                        </Link>
                    </div>
                )}

                <p className="text-gray-400 text-xs mt-2">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
            </div>
        </article>
    );
}

export default memo(PostCard);
