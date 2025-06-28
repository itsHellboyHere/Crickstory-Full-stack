import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-semibold">Page Not Found</h1>
            <p className="text-gray-600">The page you&apos;re looking for does not exist.</p>
            <p>
                <Link href="/posts" className="text-blue-600 mt-4 text-2xl hover:underline">
                    Back Home
                </Link>
            </p>
        </div>
    );
}