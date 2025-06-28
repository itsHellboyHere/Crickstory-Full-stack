'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import axios from '@/app/utils/axios'
import { Button } from '../ui/posts/button'
import { useAuth } from '../context/AuthContext'
import { useFollow } from '../context/FollowContext'
import { FollowModal } from './FollowModal'

type Profile = {
    username: string
    image?: string
    name?: string
    bio?: string
}

export default function ProfileHeader() {
    const { user: currentUser } = useAuth()
    const { username } = useParams()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFollowing, setIsFollowing] = useState(false)
    const [counts, setCounts] = useState({ followers: 0, following: 0 })

    const {
        followers,
        following,
        fetchFollowers,
        fetchFollowing,
        loadMoreFollowers,
        loadMoreFollowing
    } = useFollow()

    const isCurrentUser = profile?.username === currentUser?.username

    const [modalOpen, setModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'followers' | 'following'>('followers')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = username
                    ? `/api/user/profiles/${username}/`
                    : `/api/user/profile/`
                const res = await axios.get(url)
                setProfile(res.data)

                if (res.data.username !== currentUser?.username) {
                    const statusRes = await axios.get(`/api/user/${res.data.username}/is-following/`)
                    setIsFollowing(statusRes.data.is_following)
                }

                const countsRes = await axios.get(`/api/user/${res.data.username}/follow-counts/`)
                setCounts(countsRes.data)
            } catch (err: any) {
                console.error(err)
                if (err.response?.status === 404) notFound()
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [username])

    const handleClickFetch = async (type: 'followers' | 'following') => {
        if (!profile) return
        setModalType(type)
        setModalOpen(true)
        if (type === 'followers') {
            await fetchFollowers(profile.username)
        } else {
            await fetchFollowing(profile.username)
        }
    }

    if (loading || !profile) {
        return (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10 mb-6 animate-pulse">
                {/* Avatar Skeleton */}
                <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full bg-gray-300" />

                <div className="flex-1 space-y-2">
                    {/* Username & Button Skeleton */}
                    <div className="flex items-center gap-4">
                        <div className="h-5 w-32 bg-gray-300 rounded" />
                        <div className="h-8 w-24 bg-gray-300 rounded" />
                    </div>

                    {/* Name Skeleton */}
                    <div className="h-4 w-24 bg-gray-300 rounded" />

                    {/* Bio Skeleton */}
                    <div className="h-4 w-48 bg-gray-200 rounded" />

                    {/* Followers / Following Skeleton */}
                    <div className="flex gap-4 mt-2 text-sm">
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                    </div>
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
                        {isCurrentUser ? (
                            <Link href="/settings/profile">
                                <Button>Edit Profile</Button>
                            </Link>
                        ) : (
                            <Button onClick={async () => {
                                if (isFollowing) {
                                    await axios.post(`/api/user/unfollow/${profile.username}/`)
                                    setIsFollowing(false)


                                    setCounts(prev => ({ ...prev, followers: prev.followers - 1 }))
                                } else {
                                    await axios.post(`/api/user/follow/${profile.username}/`)
                                    setIsFollowing(true)

                                    setCounts(prev => ({ ...prev, followers: prev.followers + 1 }))

                                }
                            }}
                                className={isFollowing ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
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



            {modalOpen && <FollowModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                type={modalType}
                username={profile.username}
                isCurrentUser={isCurrentUser}
                setCounts={isCurrentUser ? setCounts : undefined}
                setIsFollowing={setIsFollowing}
            />}

        </>
    )
}
