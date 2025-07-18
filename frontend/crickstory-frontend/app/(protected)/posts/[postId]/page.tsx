'use client'
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import { BookmarkIcon, EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

import InteractivePostActions from "@/app/components/InteractivePostActions";
import PostModal from "@/app/components/PostModal";
import SavePostButton from "@/app/components/SavedPostButton";
import axios from "@/app/utils/axios"
import { useParams, useRouter } from "next/navigation";
import { Post } from "@/types/next-auth";
import { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import CommentSection from "@/app/components/CommentSection";
import CommentModalMobile from "@/app/components/CommentModalMobile";

export default function PostPage() {
    const { user } = useAuth();
    const params = useParams();
    const postId = Number(params?.postId);
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const router = useRouter();

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
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
    });
    const [desktopSliderRef, desktopInstanceRef] = useKeenSlider<HTMLDivElement>({
        loop: false,
        slides: {
            perView: 1,
            spacing: 0,
        },
        dragSpeed: 0.5,
        created() {
            setLoaded(true);
        },
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
    });
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`/api/posts/${postId}/`);
                setPost(res.data);
            } catch (err: any) {
                if (err?.response?.status === 404) {
                    setError("Post not found.");
                } else {
                    setError("Something went wrong. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };
        if (!isNaN(postId)) fetchPost();
    }, [postId, router]);

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center text-gray-500 animate-pulse">
                    <div className="h-6 w-6 mb-4 rounded-full bg-gray-300 mx-auto" />
                    <p className="text-sm">Loading post...</p>
                </div>
            </main>
        );
    }

    if (error || !post) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <p className="text-lg font-semibold">{error}</p>
                    <Link
                        href="/posts"
                        className="text-blue-500 hover:underline mt-2 inline-block"
                    >
                        Go back to Posts
                    </Link>
                </div>
            </main>
        );
    }

    const isAuthor = user?.username === post.user.username;
    const isSaved = post.is_saved

    return (
        <main className="min-h-screen">
            {/* Mobile View - Single Column */}
            <div className="md:hidden">
                {/* Post Header */}
                <div className="bg-white p-3 border-b flex items-center sticky top-0 z-10 backdrop-blur-sm">
                    <Link href="/posts" className="mr-2 p-1 hover:bg-gray-100 rounded-full">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <div className="flex-1 text-center font-semibold">Post</div>
                </div>

                {/* Post Content */}
                <div className="bg-white mb-2 rounded-lg shadow-sm mx-2 mt-2"
                    style={{
                        boxShadow: "rgba(0, 0, 0, 0.07) 0px 1px 1px, rgba(0, 0, 0, 0.07) 0px 2px 2px, rgba(0, 0, 0, 0.07) 0px 4px 4px, rgba(0, 0, 0, 0.07) 0px 8px 8px, rgba(0, 0, 0, 0.07) 0px 16px 16px"
                    }}>
                    {/* Author Info */}
                    <div className="flex items-center p-3">
                        <Link
                            href={`/profile/${post.user.username}`}
                            className="group relative flex-shrink-0"
                        >
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                <Image
                                    src={post.user.image || "/default-avatar.png"}
                                    width={40}
                                    height={40}
                                    className="border border-white w-full h-full object-cover"
                                    alt={post.user.name || "User"}
                                />
                            </div>
                        </Link>
                        <div className="flex-1 ml-3">
                            <Link
                                href={`/profile/${post.user.username}`}
                                className="font-semibold hover:text-blue-500 transition-colors"
                            >
                                {post.user.username}
                            </Link>
                            <p className="text-gray-500 text-xs">
                                {new Date(post.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Media Slider */}
                    {post.media.length > 0 && (
                        <div className="relative aspect-square bg-black">
                            <div ref={sliderRef} className="keen-slider h-full w-full">
                                {post.media.map((media, index) => (
                                    <div key={media.id} className="keen-slider__slide relative h-full w-full">
                                        {media.media_type === 'image' ? (
                                            <Image
                                                src={media.url}
                                                fill
                                                className="object-contain"
                                                alt={`Post media ${index + 1}`}
                                                sizes="100vw"
                                                priority={index === 0}
                                            />
                                        ) : (
                                            <video
                                                src={media.url}
                                                className="w-full h-full object-contain"
                                                controls
                                                playsInline
                                            />
                                        )}
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

                    {/* Actions */}
                    <div className="p-4">
                        <InteractivePostActions
                            postId={post.id}
                            initialLikes={post.likes_count}
                            initialComments={post.comments_count}
                            initialIsLiked={post.is_liked}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-sm whitespace-pre-line">
                                <Link
                                    href={`/profile/${post.user.username}`}
                                    className="font-semibold hover:text-blue-500 mr-2"
                                >
                                    {post.user.username}
                                </Link>
                                {post.title}
                            </p>
                            {user && (
                                <SavePostButton
                                    initiallySaved={isSaved}
                                    postId={post.id}
                                    userId={user.id}
                                />
                            )}
                        </div>
                        {/* Caption & Date */}
                        <div className="mt-2">
                            {post.location && (
                                <p className="text-gray-500 text-xs mt-1">
                                    {post.location}
                                </p>
                            )}
                            <p className="text-gray-400 text-xs mt-2">
                                {new Date(post.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                {/* <div className="bg-white rounded-lg shadow-sm mx-2 mb-16 px-4 py-4"
                    style={{
                        boxShadow: "rgba(0, 0, 0, 0.07) 0px 1px 1px, rgba(0, 0, 0, 0.07) 0px 2px 2px, rgba(0, 0, 0, 0.07) 0px 4px 4px, rgba(0, 0, 0, 0.07) 0px 8px 8px, rgba(0, 0, 0, 0.07) 0px 16px 16px"
                    }}>
                    <div className="h-[50vh] overflow-hidden bg-sk rounded-lg shadow-sm mx-2 mb-16 px-4 py-4">
                        <CommentSection postId={postId} />
                    </div>
                </div> */}
                <div className="bg-white rounded-lg shadow-sm mx-2 mb-16 h-[10vh] flex flex-col justify-center items-center">
                    {/* <div className="flex-1 min-h-0 overflow-hidden">
                        <CommentSection postId={postId} />
                    </div> */}
                    <CommentModalMobile postId={postId} />
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:flex items-center justify-center min-h-screen p-4">
                <div className="flex max-w-5xl w-full h-[90vh] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                    style={{
                        boxShadow: "rgba(240, 46, 170, 0.4) -5px 5px, rgba(240, 46, 170, 0.3) -10px 10px, rgba(240, 46, 170, 0.2) -15px 15px, rgba(240, 46, 170, 0.1) -20px 20px, rgba(240, 46, 170, 0.05) -25px 25px"
                    }}>

                    {/* Left Column - Media */}
                    <div className="flex-1 flex items-center h-full justify-center bg-black overflow-hidden" style={{ maxHeight: '90vh' }}>
                        {post.media.length > 0 && (
                            <div className="relative w-full h-full">
                                <div ref={desktopSliderRef} className="keen-slider h-full w-full">
                                    {post.media.map((media, index) => (
                                        <div key={media.id} className="keen-slider__slide flex justify-center items-center h-full w-full">
                                            {media.media_type === 'image' ? (
                                                <Image
                                                    src={media.url}
                                                    fill
                                                    className="object-contain"
                                                    alt={`Post media ${index + 1}`}
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                    priority={index === 0}
                                                />
                                            ) : (
                                                <video
                                                    src={media.url}
                                                    className="w-full h-full object-contain"
                                                    controls
                                                    playsInline
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Optional Navigation Dots (Desktop) */}
                                {post.media.length > 1 && loaded && (
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                                        {post.media.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    desktopInstanceRef.current?.moveToIdx(i);
                                                }}
                                                className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-4' : 'bg-gray-400 bg-opacity-50'
                                                    } opacity-80`}
                                                aria-label={`Go to slide ${i + 1}`}
                                            ></button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                    {/* Right Column - Content */}
                    <div className="flex-1 max-w-md flex h-[90vh] flex-col border-l border-gray-200">
                        {/* Author Header */}
                        <div className="p-4 border-b border-gray-200 flex-shrink-0 ">
                            <Link
                                href={`/profile/${post.user.username}`}
                                className="flex items-center space-x-3 group"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                                    <Image
                                        src={post.user.image || "/default-avatar.png"}
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                        alt={post.user.name || "User"}
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold group-hover:text-blue-500 transition-colors">
                                        {post.user.username}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(post.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 min-h-0">
                            <CommentSection postId={postId} />
                        </div>

                        {/* Fixed Action Bar */}
                        <div className="border-t border-gray-200 p-2 bg-white flex-shrink-0 ">
                            <div className="flex items-center justify-between mb-2">
                                <InteractivePostActions
                                    postId={post.id}
                                    initialLikes={post.likes_count}
                                    initialComments={post.comments_count}
                                    initialIsLiked={post.is_liked}
                                />
                                {user && (
                                    <SavePostButton
                                        initiallySaved={isSaved}
                                        postId={post.id}
                                        userId={user.id}
                                    />
                                )}
                            </div>
                            {/* <p className="font-semibold text-sm mb-3">
                                {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                            </p> */}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}