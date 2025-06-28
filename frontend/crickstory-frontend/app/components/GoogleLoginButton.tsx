'use client';

import { useGoogleLogin } from '@react-oauth/google';
import axios from '../utils/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
// import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import LoginForm from './LoginForm';
import { useState } from 'react';
export function GoogleLoginButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  // Get the original path to redirect back to after login
  const from = searchParams.get('from') || '/posts';

  const login = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        setError(null);
        await axios.post(
          '/api/auth/google/',
          { access_token: tokenResponse.access_token },
          { withCredentials: true } // Ensure cookies are handled
        );

        // Get user data
        const res = await axios.get('/api/auth/user/');
        setUser(res.data);

        // Redirect to original destination or fallback
        router.push(from);
      } catch (err: any) {
        console.error('Google login failed', err);

        const message =
          err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.detail ||
          'Google login failed. Please try again.';

        setError(message);
      }
    },
    onError: (err) => {
      console.error('Login Failed:', err);
      setError('Google login was cancelled or failed.');
    },
    scope: 'openid profile email',
  });

  return (



    <main className="flex  items-center justify-center min-h-screen bg-gray-50">

      <div className="w-full max-w-md p-8  space-y-6 bg-white rounded-xl shadow-md">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
        <div className="grid grid-cols-1 gap-4 items-center">
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            className="flex items-center justify-center  px-4 py-2 space-x-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => login()}
          >
            <FaGoogle className="w-5 h-5 text-red-500" />
            <span>Google</span>
          </button>

        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR LOG IN WITH YOUR EMAIL/USERNAME</span>
          </div>
        </div>
        <LoginForm />
        <div className="text-sm text-center text-gray-500">
          Don&apos;t have an account?{' '}

          <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </a>
        </div>
      </div>
    </main>

  );
}