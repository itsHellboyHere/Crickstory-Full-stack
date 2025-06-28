'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';

export default function EmailConfirmedPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');

    useEffect(() => {
        // Simulate confirmation check — in a real app you could validate the query or token here
        const timer = setTimeout(() => {
            setStatus('success');
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="max-w-md mx-auto mt-20 p-6 rounded-lg shadow bg-white text-center">
            {status === 'loading' && (
                <>
                    <ArrowPathIcon className="mx-auto h-16 w-16 text-gray-400 animate-spin mb-4" />
                    <h1 className="text-2xl font-semibold mb-2">Confirming email...</h1>
                    <p className="mb-4">Please wait a moment.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h1 className="text-2xl font-semibold mb-2">Email verified!</h1>
                    <p className="mb-4">Your email has been successfully confirmed. You can now log in to your account.</p>
                    <a
                        href="/login"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Go to Login
                    </a>
                </>
            )}

            {status === 'error' && (
                <>
                    <XCircleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-semibold mb-2">Oops!</h1>
                    <p className="mb-4">There was a problem confirming your email.</p>
                </>
            )}
        </div>
    );
}
