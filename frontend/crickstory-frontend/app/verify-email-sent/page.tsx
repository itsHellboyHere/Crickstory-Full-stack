'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import axios from '../utils/axios';
import { Button } from '../ui/posts/button';

export default function VerifyEmailSentPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<null | 'success' | 'error'>(null);
    const [message, setMessage] = useState<string | null>(null);

    const resendEmail = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const response = await axios.post('/api/auth/registration/resend-email/', {
                email,
            });
            setMessage('Verification email resent successfully.');
            setStatus('success');
        } catch (error: any) {
            setMessage(error.response?.data?.email?.[0] || 'Error resending email.');
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    if (!email) return <p>Invalid email link.</p>;

    return (
        <div className="max-w-md mx-auto mt-10 p-6 rounded-lg shadow bg-white text-center">
            <h1 className="text-2xl font-semibold mb-4">Verify your email</h1>
            <p className="mb-4">
                A verification email has been sent to <strong>{email}</strong>. Please check your inbox.
            </p>

            <Button
                onClick={resendEmail}
                disabled={loading}
                className="w-full"
            >
                {loading ? 'Resending...' : 'Resend Email'}
            </Button>

            {status && (
                <p className={`mt-4 text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
