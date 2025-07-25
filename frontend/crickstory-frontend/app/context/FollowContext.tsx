'use client'
import axios from "@/app/utils/axios"
import { FollowerItem, FollowingItem, User } from "@/types/next-auth"
import React, { createContext, useContext, useState } from "react"



export interface FollowContextType {
    followers: FollowerItem[]
    following: FollowingItem[]
    sentRequests: User[]
    // count: number
    // fetchCount: (username: string) => Promise<void>
    fetchFollowers: (username: string) => Promise<void>
    fetchFollowing: (username: string) => Promise<void>
    fetchSentRequests: () => Promise<void>
    loadMoreFollowers: () => Promise<void>
    loadMoreFollowing: () => Promise<void>
    removeFromFollowers: (id: number) => void
    removeFromFollowing: (id: number) => void
    updateFollowers: (newFollowers: FollowerItem[]) => void
    updateFollowing: (newFollowing: FollowingItem[]) => void
    cancelFollowRequest: (username: string) => Promise<void>
    nextFollowersPage: string | null
    nextFollowingPage: string | null
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: React.ReactNode }) {
    const [followers, setFollowers] = useState<FollowerItem[]>([])
    const [following, setFollowing] = useState<FollowingItem[]>([])
    // const [count, setCount] = useState(0)
    const [nextFollowersPage, setNextFollowersPage] = useState<string | null>(null)
    const [nextFollowingPage, setNextFollowingPage] = useState<string | null>(null)
    const [sentRequests, setSentRequests] = useState<User[]>([])

    const fetchFollowers = async (username: string) => {
        const res = await axios.get(`/api/user/followers/${username}/`)
        setFollowers(res.data.results || [])
        setNextFollowersPage(res.data.next)
    }
    const loadMoreFollowers = async () => {
        if (!nextFollowersPage) return
        const res = await axios.get(nextFollowersPage)
        setFollowers(prev => [...prev, ...res.data.results])
        setNextFollowersPage(res.data.next)
    }
    const fetchFollowing = async (username: string) => {
        const res = await axios.get(`/api/user/following/${username}/`)
        setFollowing(res.data.results || [])
        setNextFollowingPage(res.data.next)
    }
    const loadMoreFollowing = async () => {
        if (!nextFollowingPage) return
        const res = await axios.get(nextFollowingPage)
        setFollowing(prev => [...prev, ...res.data.results])
        setNextFollowingPage(res.data.next)
    }
    const fetchSentRequests = async () => {
        const res = await axios.get('/api/user/follow-request/sent/')
        setSentRequests(res.data.results || [])
    }

    const cancelFollowRequest = async (username: string) => {
        await axios.post(`/api/user/follow-request/${username}/cancel/`)
        setSentRequests(prev => prev.filter(req => req.username !== username))
    }

    // const fetchCount = async (username: string) => {
    //     const res = await axios.get(`/api/user/${username}/follow-counts/`)
    //     setCount(res.data)

    // }
    const removeFromFollowers = (id: number) => {
        setFollowers(prev => prev.filter(follower => follower.id !== id))
    }
    const removeFromFollowing = (id: number) => {
        setFollowing(prev => prev.filter(following => following.id !== id))
    }

    const updateFollowers = (newFollowers: FollowerItem[]) => {
        setFollowers(newFollowers)
    }

    const updateFollowing = (newFollowing: FollowingItem[]) => {
        setFollowing(newFollowing)
    }

    return (
        <FollowContext.Provider
            value={{
                followers,
                following,
                fetchFollowers,
                fetchFollowing,
                loadMoreFollowers,
                loadMoreFollowing,
                removeFromFollowers,
                removeFromFollowing,
                updateFollowers,
                updateFollowing,
                nextFollowersPage,
                nextFollowingPage,
                sentRequests,
                fetchSentRequests,
                cancelFollowRequest,
            }}
        >
            {children}
        </FollowContext.Provider>
    )
}

export const useFollow = () => {
    const context = useContext(FollowContext)
    if (!context) {
        throw new Error('useFollow must be used within a FollowProvider')
    }
    return context
}