'use client';

import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/context/AuthContext';
import axios from '@/app/utils/axios';

export default function AvatarUpload() {
    const { profile, refreshProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
            toast.error('Image size should be less than 3MB');
            return;
        }

        // Create preview
        setPreview(URL.createObjectURL(file));
        setIsLoading(true);

        const formData = new FormData();
        formData.append('image', file);

        try {
            // First upload the image
            const uploadResponse = await axios.patch('/api/user/profile/image/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Then refresh the profile data
            if (refreshProfile) {
                await refreshProfile();
            } else {
                console.error('refreshProfile function not available');
            }

            toast.success('Avatar updated successfully!');
        } catch (err: any) {
            console.error('Upload error:', err);
            toast.error(err.response?.data?.error || 'Failed to update avatar');
            setPreview(null); // Reset preview on error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                    src={preview || profile?.image || '/default-avatar.png'}
                    alt="Profile"
                    fill
                    sizes="96px"
                    className="object-cover"
                    priority
                />
            </div>

            <div>
                <label className="cursor-pointer inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition">
                    <span>{isLoading ? 'Uploading...' : 'Change Avatar'}</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                </label>
                <p className="mt-2 text-sm text-gray-500">JPG, PNG up to 3MB</p>
            </div>
        </div>
    );
}