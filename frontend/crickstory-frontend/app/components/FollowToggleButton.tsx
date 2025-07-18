"use client"

import { useState } from 'react'
import axios from '@/app/utils/axios'
import { Button } from '../ui/posts/button'
import { useFollow } from '../context/FollowContext'
import { useAuth } from '../context/AuthContext'
import { Check, X } from 'lucide-react'

type FollowToggleProps = {
    userId: number
    username: string
    initialIsFollowing: boolean
    initialHasRequested?: boolean
    setCounts?: React.Dispatch<
        React.SetStateAction<{ followers: number; following: number }>
    >
    onFollowChange?: (userId: number, following: boolean) => void
}

export function FollowToggleButton({
    userId,
    username,
    initialIsFollowing,
    initialHasRequested = false,
    setCounts,
    onFollowChange
}: FollowToggleProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [hasRequested, setHasRequested] = useState(initialHasRequested)
    const [loading, setLoading] = useState(false)
    const { cancelFollowRequest } = useFollow()
    const { user } = useAuth()

    const toggleFollow = async () => {
        try {
            setLoading(true)
            if (isFollowing) {
                await axios.post(`/api/user/unfollow/${username}/`)
                setIsFollowing(false)
                setCounts?.(prev => ({ ...prev, followers: prev.followers - 1 }))
                onFollowChange?.(userId, false)
            } else {
                const res = await axios.post(`/api/user/follow/${username}/`)
                if (res.data.success?.includes("request")) {
                    setHasRequested(true)
                } else {
                    setIsFollowing(true)
                    setCounts?.(prev => ({ ...prev, followers: prev.followers + 1 }))
                    onFollowChange?.(userId, true)
                }
            }
        } catch (err) {
            console.error('Follow toggle failed:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCancelRequest = async () => {
        try {
            setLoading(true)
            await cancelFollowRequest(username)
            setHasRequested(false)
        } catch (err) {
            console.error("Failed to cancel request", err)
        } finally {
            setLoading(false)
        }
    }

    if (hasRequested) {
        return (
            <Button onClick={handleCancelRequest} disabled={loading} className="bg-gray-400 text-white">
                <X className="w-4 h-4 mr-1" /> Cancel Request
            </Button>
        )
    }

    return (
        <Button
            onClick={toggleFollow}
            disabled={loading}
            className={
                isFollowing
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
        >
            {isFollowing ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
            {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
    )
}
