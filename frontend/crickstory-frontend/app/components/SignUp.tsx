
'use client';

import SignupForm from "./SignUpForm";
import SignUpOauth from "./SignUpOauth";

export default function SignUp() {
    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
                    <p className="text-gray-500">Get started with your free account</p>
                </div>

                <SignUpOauth />
                <SignupForm />
                <div className="text-sm text-center text-gray-500">
                    Already have an account?{' '}
                    <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in
                    </a>
                </div>
            </div>
        </main>
    );
}