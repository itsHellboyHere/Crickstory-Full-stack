'use client'

import { useState } from 'react'
import axios from '@/app/utils/axios'
import { Button } from '../ui/posts/button'
import { useAuth } from '../context/AuthContext'
type FollowToggleProps = {
    userId: number
    username: string
    initialIsFollowing: boolean
    setCounts?: React.Dispatch<React.SetStateAction<{ followers: number; following: number }>>
    onFollowChange?: (userId: number, following: boolean) => void
}

export function FollowToggleButton({
    userId,
    username,
    initialIsFollowing,
    setCounts,
    onFollowChange
}: FollowToggleProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [loading, setLoading] = useState(false)
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
                await axios.post(`/api/user/follow/${username}/`)
                setIsFollowing(true)
                setCounts?.(prev => ({ ...prev, followers: prev.followers + 1 }))
                onFollowChange?.(userId, true)
            }
        } catch (err) {
            console.error('Follow toggle failed:', err)
        } finally {
            setLoading(false)
        }
    }

    return (

        <Button onClick={toggleFollow} disabled={loading}>
            {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>

    )
}
