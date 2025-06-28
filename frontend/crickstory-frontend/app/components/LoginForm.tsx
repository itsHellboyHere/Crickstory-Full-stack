'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AtSymbolIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/posts/button';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { lusitana } from '../ui/fonts';

function isEmail(value: string) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginForm() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { setUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/posts';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const loginData = isEmail(identifier)
                ? { email: identifier, password }
                : { username: identifier, password };
            const res = await axios.post('/api/auth/login/', loginData);

            setUser(res.data.user);
            router.push(from);
        } catch (err: any) {
            const message =
                err.response?.data?.detail ||
                err.response?.data?.non_field_errors?.[0] ||
                'Login failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-3" onSubmit={handleSubmit}>
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                <h1 className={`${lusitana.className} mb-3 text-2xl`}>
                    Log in to CrickStory
                </h1>

                {/* Identifier Field */}
                <div className="mb-4">
                    <label
                        htmlFor="identifier"
                        className="mb-2 block text-xs font-medium text-gray-900"
                    >
                        Username or Email
                    </label>
                    <div className="relative">
                        <input
                            id="identifier"
                            name="identifier"
                            type="text"
                            placeholder="Enter username or email"
                            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm placeholder:text-gray-500 outline-2"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                        <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                </div>

                {/* Password Field */}
                <div className="mb-6">
                    <label
                        htmlFor="password"
                        className="mb-2 block text-xs font-medium text-gray-900"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm placeholder:text-gray-500 outline-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                        <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </div>
        </form>
    );
}
