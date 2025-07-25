'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import axios from '@/app/utils/axios'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useFollow } from '../context/FollowContext'
import { Button } from '../ui/posts/button'
import { FollowToggleButton } from './FollowToggleButton'
import type { FollowerItem, FollowingItem } from '@/types/next-auth'
import { useAuth } from '../context/AuthContext'

import { Loader2 } from 'lucide-react'


interface FollowModalProps {
    username: string
    type: 'followers' | 'following'
    open: boolean
    onOpenChange: (open: boolean) => void
    isCurrentUser: boolean
    setCounts?: React.Dispatch<React.SetStateAction<{ followers: number; following: number }>>
    setIsFollowing: (value: boolean) => void
}

export function FollowModal({
    username,
    type,
    open,
    onOpenChange,
    isCurrentUser,
    setCounts,
    setIsFollowing
}: FollowModalProps) {
    const {
        followers,
        following,
        fetchFollowers,
        fetchFollowing,
        removeFromFollowers,
        removeFromFollowing,
        updateFollowers,
        updateFollowing,
        loadMoreFollowers,
        loadMoreFollowing,
        nextFollowersPage,
        nextFollowingPage,
        sentRequests,
        fetchSentRequests,
        cancelFollowRequest
    } = useFollow()

    const [loading, setLoading] = useState(true)
    const { user: loggedInUser } = useAuth()

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true)
            if (type === 'followers') await fetchFollowers(username)
            else await fetchFollowing(username)
            await fetchSentRequests()
            setLoading(false)
        }
        if (open) fetchList()
    }, [open, type, username])

    const list = type === 'followers' ? followers : following

    const handleRemove = async (id: number, userUsername: string) => {
        try {
            if (type === 'followers') {
                await axios.post(`/api/user/remove-follower/${userUsername}/`)
                removeFromFollowers(id)
                if (isCurrentUser && setCounts) {
                    setCounts(prev => ({ ...prev, followers: prev.followers - 1 }))
                }
            } else {
                await axios.post(`/api/user/unfollow/${userUsername}/`)
                removeFromFollowing(id)
                if (isCurrentUser && setCounts) {
                    setCounts(prev => ({ ...prev, following: prev.following - 1 }))
                }
                if (setIsFollowing && userUsername === username) {
                    setIsFollowing(false)
                }
            }
        } catch (err) {
            console.error('Failed to remove user:', err)
        }
    }

    return (
        <Dialog open={open} onClose={() => onOpenChange(false)} className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                    <DialogTitle className="text-lg font-semibold mb-4 capitalize">{type}</DialogTitle>

                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="animate-spin w-6 h-6 text-gray-600" />
                        </div>
                    ) : list.length === 0 ? (
                        <p className="text-gray-500">No {type} yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {list.map((item: FollowerItem | FollowingItem) => {
                                const user = type === 'followers' ? (item as FollowerItem).follower : (item as FollowingItem).following
                                const isFollowing = item.is_following
                                const itemId = item.id
                                const hasRequested = sentRequests.some(req => req.username === user.username)

                                return (
                                    <li key={itemId} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={user.image || '/default-avatar.png'}
                                                alt={user.username}
                                                width={40}
                                                height={40}
                                                className="rounded-full object-cover"
                                            />
                                            <Link href={`/profile/${user.username}`} className="hover:underline">
                                                {user.username}
                                            </Link>
                                        </div>

                                        {user.username === loggedInUser?.username ? null : isCurrentUser ? (
                                            <Button onClick={() => handleRemove(itemId, user.username)}>Remove</Button>
                                        ) : (
                                            <FollowToggleButton
                                                userId={user.id}
                                                username={user.username}
                                                initialIsFollowing={isFollowing}
                                                initialHasRequested={hasRequested}
                                                setCounts={user.username === loggedInUser?.username ? setCounts : undefined}
                                                onFollowChange={(id, newIsFollowing) => {
                                                    if (type === 'followers') {
                                                        updateFollowers(
                                                            followers.map(f =>
                                                                f.follower.id === id ? { ...f, is_following: newIsFollowing } : f
                                                            )
                                                        )
                                                    } else {
                                                        updateFollowing(
                                                            following.map(f =>
                                                                f.following.id === id ? { ...f, is_following: newIsFollowing } : f
                                                            )
                                                        )
                                                    }
                                                    if (setCounts && user.username === username) {
                                                        setCounts(prev => ({
                                                            ...prev,
                                                            followers: prev.followers + (newIsFollowing ? 1 : -1)
                                                        }))
                                                        setIsFollowing(newIsFollowing)
                                                    }
                                                }}
                                            />
                                        )}
                                    </li>
                                )
                            })}
                            {(type === 'followers' && nextFollowersPage) || (type === 'following' && nextFollowingPage) ? (
                                <li className="text-center">
                                    <Button
                                        onClick={() => (type === 'followers' ? loadMoreFollowers() : loadMoreFollowing())}
                                    >
                                        Load More
                                    </Button>
                                </li>
                            ) : null}
                        </ul>
                    )}
                </DialogPanel>
            </div>
        </Dialog>
    )
}
