'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import Image from 'next/image'
import { X } from 'lucide-react'

interface MediaViewerModalProps {
    isOpen: boolean
    onClose: () => void
    mediaType: 'image' | 'video'
    fileUrl: string
}

export default function MediaViewerModal({
    isOpen,
    onClose,
    mediaType,
    fileUrl,
}: MediaViewerModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    const togglePlay = () => {
        const video = videoRef.current
        if (!video) return

        if (video.paused) {
            video.play()
            setIsPlaying(true)
        } else {
            video.pause()
            setIsPlaying(false)
        }
    }

    useEffect(() => {
        // Reset playback when modal closes
        if (!isOpen && videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
            setIsPlaying(false)
        }
    }, [isOpen])

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

            {/* Close Button (Instagram-style) */}
            <button
                onClick={onClose}
                className="fixed top-4 right-6 z-50 text-white hover:scale-110 transition-transform"
            >
                <X size={32} />
            </button>

            {/* Modal content */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="relative w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden">
                    <div className="bg-black flex justify-center items-center w-full h-full">
                        {mediaType === 'image' ? (
                            <Image
                                src={fileUrl}
                                alt="media"
                                width={800}
                                height={600}
                                className="w-full h-auto object-contain"
                            />
                        ) : (
                            <div className="relative w-full">
                                <video
                                    ref={videoRef}
                                    src={fileUrl}
                                    className="w-full max-h-[80vh] object-contain"
                                    playsInline

                                />
                                {!isPlaying && (
                                    <button
                                        onClick={togglePlay}
                                        className="absolute inset-0 flex items-center justify-center text-white text-5xl bg-black/40 hover:bg-black/60 transition"
                                    >
                                        ▶️
                                    </button>
                                )}
                                {/* Optional: Tap video to pause too */}
                                <div
                                    className="absolute inset-0"
                                    onClick={togglePlay}
                                />
                            </div>
                        )}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
