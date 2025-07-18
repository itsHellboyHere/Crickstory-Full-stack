import Link from "next/link";
import styles from "../css/Postprofile.module.css"
import Image from "next/image";
import { Post } from "@/types/next-auth";

export default function PostProfile({ post }: { post: Post }) {
    const firstMedia = post.media?.[0];
    return (
        <div className={styles.card}>
            {firstMedia && (
                <div className="relative w-full h-full">
                    <Link href={`/posts/${post.id}`}>
                        {firstMedia.media_type === "image" ? (
                            <Image
                                src={firstMedia.url}
                                fill
                                className="object-cover"
                                alt={post.title}
                                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                                priority={false}
                            />
                        ) : (
                            <video
                                src={firstMedia.url}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                                preload="metadata"
                            />
                        )}
                    </Link>
                    <div className={styles.hoverOverlay}>
                        <Link href={`/posts/${post.id}`} className={styles.dynamicLink}>
                            View Details
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}