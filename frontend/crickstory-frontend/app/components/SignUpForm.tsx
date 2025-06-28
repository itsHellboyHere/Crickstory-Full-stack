'use client';
import { useState } from 'react';
import { lusitana } from '../ui/fonts';
import {
    UserIcon,
    AtSymbolIcon,
    KeyIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/posts/button';
import axios from "../utils/axios"
import { useAuth } from '../context/AuthContext';
export default function SignupForm() {
    const [loading, setLoading] = useState(false)
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")
    const [error, setError] = useState<string | null>(null)

    const { setUser } = useAuth()
    const router = useRouter()
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            // Register the user
            await axios.post("/api/auth/registration/", {
                username,
                email,
                password1,
                password2
            });

            // Auto-login the user
            // const loginRes = await axios.post("/api/auth/login/", {
            //     username,
            //     password: password1,
            // });

            // // Set user in AuthContext
            // setUser(loginRes.data.user);

            // // Redirect to dashboard or home
            router.push(`/verify-email-sent?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            if (err.response?.data) {
                const data = err.response.data;
                const firstError = Object.values(data)[0];
                setError(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-3" onSubmit={handleSubmit}>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                <h1 className={`${lusitana.className} mb-3 text-2xl`}>
                    Create your account
                </h1>
                {/* Add username field */}
                <div>
                    <label
                        className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                        htmlFor="username"
                    >
                        Username
                    </label>
                    <div className="relative">
                        <input
                            className={`peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 `}
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Choose a unique username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                    </div>

                </div>
                <div className="w-full">


                    {/* Email Field */}
                    <div className="mt-4">
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <input
                                className={`peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 `}
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>

                    </div>

                    {/* Password1 Field */}
                    <div className="mt-4">
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                            htmlFor="password1"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className={`peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500`}
                                id="password1"
                                type="password"
                                name="password1"
                                placeholder="Enter password (min 6 characters)"
                                required
                                minLength={6}
                                value={password1}
                                onChange={(e) => setPassword1(e.target.value)}
                            />
                            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>

                    </div>

                    {/* Password2 Field */}
                    <div className="mt-4">
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                            htmlFor="password2"
                        >
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                className={`peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 `}
                                id="password2"
                                type="password"
                                name="password2"
                                placeholder="Enter password again"
                                required
                                minLength={6}
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                            />
                            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>

                    </div>
                </div>

                <Button
                    className="mt-4 w-full"

                >
                    {loading ? 'Creating...' : 'Sign up'}
                    {!loading && <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />}
                </Button>
                <div
                    className="flex h-8 items-end space-x-1"
                    aria-live="polite"
                    aria-atomic="true"
                >

                </div>
            </div>
        </form>
    );
}
