// components/PostSkeleton.tsx
export default function PostSkeleton({ count = 1 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={`skeleton-${index}`}
                    className="bg-white border border-gray-200 rounded-lg mb-6 p-4 animate-pulse"
                >
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                    <div className="flex justify-between mb-3">
                        <div className="flex space-x-4">
                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            ))}
        </>
    );
}