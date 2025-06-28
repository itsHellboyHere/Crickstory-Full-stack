
import Link from "next/link";
import { Button } from "@/app/ui/posts/button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">User Not Found</h1>
            <p className="text-gray-500 mb-6">
                Sorry, the profile you are looking for doesn’t exist or has been removed.
            </p>
            <Link href="/">
                <Button className="flex items-center gap-2">
                    <ArrowLeftIcon width={18} height={18} />
                    Back to Home
                </Button>
            </Link>
        </div>
    );
}
