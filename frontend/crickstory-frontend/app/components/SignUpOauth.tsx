import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import axios from '../utils/axios';
import { FaGoogle } from "react-icons/fa";
export default function SignUpOauth() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useAuth();

    // Get the original path to redirect back to after login
    const from = searchParams.get('from') || '/posts';

    const login = useGoogleLogin({
        flow: 'implicit',
        onSuccess: async (tokenResponse) => {
            try {
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
            } catch (err) {
                console.error('Google login failed', err);
            }
        },
        onError: (err) => console.error('Login Failed:', err),
        scope: 'openid profile email',
    });
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 ">


                <button
                    type="submit"
                    className="flex items-center justify-center w-full px-3 py-2 space-x-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                    <span className="px-2 bg-white text-gray-500">OR SIGN UP WITH EMAIL/USERNAME</span>
                </div>
            </div>
        </div>
    );
}