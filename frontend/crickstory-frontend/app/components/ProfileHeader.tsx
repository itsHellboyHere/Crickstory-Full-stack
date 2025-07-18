'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '../ui/posts/button'
import { useAuth } from '../context/AuthContext'
import { useFollow } from '../context/FollowContext'
import { useViewedProfile } from '@/app/context/ViewedProfileContext'
import { FollowModal } from './FollowModal'
import { FollowRequestsModal } from './FollowRequestsModal'
import axios from '@/app/utils/axios'
import toast from 'react-hot-toast'

export default function ProfileHeader({ loading }: { loading: boolean }) {
    const { profile, updateProfile } = useViewedProfile()
    const { user } = useAuth()
    const { fetchFollowers, fetchFollowing, sentRequests, fetchSentRequests, cancelFollowRequest } = useFollow()

    const [counts, setCounts] = useState({ followers: 0, following: 0 })
    const [modalOpen, setModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'followers' | 'following'>('followers')
    const [requestsModalOpen, setRequestsModalOpen] = useState(false)

    useEffect(() => {
        if (!profile) return
        const fetchCounts = async () => {
            try {
                const res = await axios.get(`/api/user/${profile.username}/follow-counts/`)
                setCounts(res.data)
            } catch (e) {
                console.error('Failed to fetch counts')
            }
        }
        fetchCounts()
    }, [profile?.username])

    const handleFollowToggle = async () => {
        if (!profile) return
        try {
            if (profile.is_following) {
                await axios.post(`/api/user/unfollow/${profile.username}/`)
                setCounts((prev) => ({ ...prev, followers: prev.followers - 1 }))
                updateProfile({ is_following: false })
            } else {
                await axios.post(`/api/user/follow/${profile.username}/`)
                if (profile.is_private) {
                    updateProfile({ has_requested: true })
                } else {
                    setCounts((prev) => ({ ...prev, followers: prev.followers + 1 }))
                    updateProfile({ is_following: true })
                }
            }
        } catch (err) {
            console.error('Follow toggle error:', err)
            toast.error('Something went wrong.')
        }
    }

    const handleClickFetch = async (type: 'followers' | 'following') => {
        if (!profile) return
        if (!profile.is_me && profile.is_private && !profile.is_following) {
            toast.error('This profile is private.')
            return
        }

        setModalType(type)
        setModalOpen(true)
        if (type === 'followers') await fetchFollowers(profile.username)
        else await fetchFollowing(profile.username)
    }

    if (loading || !profile) {
        return (
            <div className="animate-pulse flex flex-col md:flex-row gap-6 mb-4">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-gray-300 rounded-full" />
                <div className="space-y-3 flex-1">
                    <div className="h-5 w-32 bg-gray-300 rounded" />
                    <div className="h-4 w-40 bg-gray-200 rounded" />
                    <div className="h-4 w-60 bg-gray-200 rounded" />
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10 mb-6">
                <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden">
                    <Image
                        src={profile.image || '/default-avatar.png'}
                        alt={`${profile.username}'s avatar`}
                        fill
                        sizes="96px"
                        className="object-cover"
                    />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-xl font-semibold">{profile.username}</h1>
                        {profile.is_me ? (
                            <>
                                <Link href="/settings/profile">
                                    <Button>Edit Profile</Button>
                                </Link>
                                <Button onClick={() => setRequestsModalOpen(true)}>Follow Requests</Button>
                            </>
                        ) : profile.has_requested ? (
                            <Button disabled className="bg-gray-400 text-white">
                                Requested
                            </Button>
                        ) : (
                            <Button
                                onClick={handleFollowToggle}
                                className={
                                    profile.is_following
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }
                            >
                                {profile.is_following ? 'Unfollow' : 'Follow'}
                            </Button>
                        )}
                    </div>

                    <p className="text-gray-500">{profile.name}</p>
                    {profile.bio && <p className="text-gray-700 mt-1">{profile.bio}</p>}

                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <button onClick={() => handleClickFetch('followers')} className="hover:text-black hover:underline">
                            <strong>{counts.followers}</strong> followers
                        </button>
                        <button onClick={() => handleClickFetch('following')} className="hover:text-black hover:underline">
                            <strong>{counts.following}</strong> following
                        </button>
                    </div>
                </div>
            </div>

            <FollowModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                type={modalType}
                username={profile.username}
                isCurrentUser={profile.is_me}
                setCounts={profile.is_me ? setCounts : undefined}
                setIsFollowing={(val) => updateProfile({ is_following: val })}
            />

            {profile.is_me && (
                <FollowRequestsModal
                    open={requestsModalOpen}
                    onOpenChange={setRequestsModalOpen}
                    onAccept={(username) => console.log(`Accepted: ${username}`)}
                    onReject={(username) => console.log(`Rejected: ${username}`)}

                />
            )}
        </>
    )
}
