'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '@/app/utils/axios';
import { abort } from 'process';

export default function ProfileInfoForm() {
    const { profile, refreshProfile, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const form = new FormData(e.currentTarget);

            await axios.patch('/api/user/update-profile/', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            await refreshProfile()
            await refreshUser()
            setSuccess(true);
        } catch (err: any) {
            let message = 'Profile update failed. Please try again.';
            const data = err?.response?.data;
            if (data?.detail) {
                message = data.detail;
            } else if (data?.non_field_errors?.length) {
                message = data.non_field_errors[0];
            } else if (data?.username?.length) {
                message = `Username: ${data.username[0]}`;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Profile Information
            </h2>

            {success && (
                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                    Saved successfully!
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        defaultValue={profile?.username ?? ''}
                        className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                    />
                </div>

                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={profile?.name ?? ''}
                        className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Bio */}
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bio
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        defaultValue={profile?.bio ?? ''}
                        className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Tell us about yourself..."
                    />
                </div>

                {/* Location */}
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                    </label>
                    <input
                        id="location"
                        name="location"
                        type="text"
                        defaultValue={profile?.location ?? ''}
                        className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Your location"
                    />
                </div>

                {/* Birth Date */}
                <div>
                    <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Birth Date
                    </label>
                    <input
                        id="birth_date"
                        name="birth_date"
                        type="date"
                        defaultValue={profile?.birth_date ?? ''}
                        className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                        {loading ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
}
