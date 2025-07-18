'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import axios from '@/app/utils/axios'
import Image from 'next/image'
import { Button } from '../ui/posts/button'
import Link from 'next/link'

type User = {
    username: string
    image?: string
}

export function FollowRequestsModal({
    open,
    onOpenChange,
    onAccept,
    onReject
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAccept?: (username: string) => void
    onReject?: (username: string) => void
}) {
    const [requests, setRequests] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!open) return

        const fetchRequests = async () => {
            try {
                setLoading(true)
                const res = await axios.get('/api/user/follow-requests/')
                setRequests(res.data.results)
            } catch (err) {
                console.error('Failed to fetch requests', err)
            } finally {
                setLoading(false)
            }
        }

        fetchRequests()
    }, [open])

    const handleAccept = async (username: string) => {
        try {
            await axios.post(`/api/user/follow-request/${username}/accept/`)
            setRequests((prev) => prev.filter((u) => u.username !== username))
            onAccept?.(username)
        } catch (err) {
            console.error('Failed to accept request', err)
        }
    }

    const handleReject = async (username: string) => {
        try {
            await axios.post(`/api/user/follow-request/${username}/reject/`)
            setRequests((prev) => prev.filter((u) => u.username !== username))
            onReject?.(username)
        } catch (err) {
            console.error('Failed to reject request', err)
        }
    }

    return (
        <Dialog open={open} onClose={() => onOpenChange(false)} className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                    <DialogTitle className="text-lg font-semibold mb-4">Follow Requests</DialogTitle>
                    {loading ? (
                        <p>Loading...</p>
                    ) : requests.length === 0 ? (
                        <p className="text-gray-500">No pending follow requests.</p>
                    ) : (
                        <ul className="space-y-4 max-h-80 overflow-y-auto">
                            {requests.map((user) => (
                                <li key={user.username} className="flex justify-between items-center">
                                    <div className="flex gap-2 items-center">
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
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleAccept(user.username)}>Accept</Button>
                                        <Button onClick={() => handleReject(user.username)} className="bg-red-500 hover:bg-red-600 text-white">
                                            Reject
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </DialogPanel>
            </div>
        </Dialog>
    )
}
