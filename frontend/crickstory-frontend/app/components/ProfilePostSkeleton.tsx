export default function ProfilePostSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={idx}
                    className="w-full aspect-square bg-gray-200 animate-pulse rounded"
                />
            ))}
        </div>
    );
}
