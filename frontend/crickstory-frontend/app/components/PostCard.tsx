// components/PostCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/types/next-auth';
import InteractivePostActions from './InteractivePostActions';
import SavePostButton from './SavedPostButton';
import { memo } from 'react';
import styles from "../css/Post.module.css"
interface PostCardProps {
    post: Post;
    currentUserId?: number;
}

function PostCard({ post, currentUserId }: PostCardProps) {
    // console.log("post: ", post)
    const isSaved = post.saved_by.some(save => save.user.id === currentUserId);
    const isLiked = post.likes.some(like => like.user.id === currentUserId);

    return (
        <article className="bg-white border border-gray-200 rounded-lg mb-6">
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
                    <p className="text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
            </header>

            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
                <Link href={`/posts/${post.id}`}>
                    <Image
                        src={post.imageUrl}
                        fill
                        alt={post.title}
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </Link>

            </div>

            {/* Actions */}
            <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <InteractivePostActions
                        postId={post.id}
                        initialLikes={post.likes.length}
                        initialComments={post.comments.length}
                        initialIsLiked={isLiked}
                    />
                    <SavePostButton
                        postId={post.id}
                        userId={currentUserId}
                        initiallySaved={isSaved}
                    />
                </div>

                {/* Likes */}
                {/* {post.likes.length > 0 && (
                    <p className="font-semibold text-sm mb-1">
                        {post.likes.length} like{post.likes.length !== 1 ? 's' : ''}
                    </p>
                )} */}

                {/* Caption */}
                <p className="text-sm mb-1">
                    <Link
                        href={`/profile/${post.user.username}`}
                        className="font-semibold mr-2 hover:underline"
                    >
                        {post.user.name || post.user.username}
                    </Link>
                    {post.title}
                </p>

                {/* Comments */}
                {post.comments.length > 0 && (
                    <div className="mt-1">
                        {post.comments.length > 2 ? (
                            <Link
                                href={`/posts/${post.id}`}
                                className="text-gray-500 text-sm hover:underline"
                            >
                                View all {post.comments.length} comments
                            </Link>
                        ) : (
                            <div className="space-y-1">
                                {post.comments.map(comment => (
                                    <p key={comment.id} className="text-sm">
                                        <Link
                                            href={`/profile/${comment.user.username}`}
                                            className="font-semibold mr-2 hover:underline"
                                        >
                                            {comment.user.name || comment.user.username}
                                        </Link>
                                        {comment.content}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Timestamp */}
                <p className="text-gray-400 text-xs mt-2">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
            </div>
        </article>
    );
}
export default memo(PostCard);