'use client';

import { useNotification } from '@/app/context/NotificationContext';
import Image from 'next/image';
import Link from 'next/link';
export default function NotificationList() {
    const { notifications, markAsSeen } = useNotification();
    console.log(notifications)
    return (
        <div className="max-w-md mx-auto mt-6 px-4">
            <h2 className="text-xl font-bold mb-4 text-center">Notifications</h2>
            {notifications.length === 0 ? (
                <p className="text-gray-500 text-center">No notifications yet.</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((notif) => {
                        const isPostRelated = notif.type === 'like' || notif.type === 'comment';
                        const profileImage = notif.extra_data.profile_image;
                        const postImage = notif.extra_data.post_image;
                        const username = notif.extra_data.username;
                        const postId = notif.extra_data.post_id;

                        return (
                            <li
                                key={notif.id}
                                className={`flex items-center p-4 rounded-lg shadow-sm cursor-pointer gap-4 ${notif.is_seen ? 'bg-white' : 'bg-blue-50'}`}
                                onClick={() => markAsSeen(notif.id)}
                            >
                                {/* User Profile Image */}
                                {profileImage && (
                                    <Link href={`/profile/${username}`}>
                                        <Image
                                            src={profileImage}
                                            alt="Profile"
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover"
                                        />
                                    </Link>
                                )}

                                {/* Notification Text */}
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">{notif.message}</p>
                                    {username && (
                                        <p className="text-sm text-gray-600">@{username}</p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                        {notif.created_at
                                            ? new Date(notif.created_at).toLocaleString()
                                            : 'Just now'}
                                    </p>
                                </div>

                                {/* Post Image for likes/comments */}
                                {isPostRelated && postImage && postId && (
                                    <Link href={`/posts/${postId}`}>
                                        <Image
                                            src={postImage}
                                            alt="Post thumbnail"
                                            width={50}
                                            height={50}
                                            className="rounded-md object-cover"
                                        />
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
