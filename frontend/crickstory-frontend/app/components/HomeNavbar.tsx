'use client'
import Link from 'next/link';
import { Josefin_Sans } from 'next/font/google';
import styles from '../css/HomeNavbar.module.css';
import { UserProfile } from './UserProfile';
import { AuthButtons } from './AuthButtons';
import { MobileMenu } from './MobileMenu';
import { useAuth } from '../context/AuthContext';


const josef = Josefin_Sans({ subsets: ['latin'] });

export default function HomeNavbar() {
    const { user, profile, loading } = useAuth()

    return (
        <nav className={`${styles.navbar} ${josef.className}`}>
            <div className={styles.logo}>
                <span className='text-fuchsia-300 underline text-3xl'>crick</span>story
            </div>

            <div className={styles.navItems}>
                <Link href="/" className={styles.navLink}>Home</Link>
                <Link href="/posts" className={styles.navLink}>Posts</Link>
                <Link href="/explore" className={styles.navLink}>Explore</Link>
                <Link href="/news" className={styles.navLink}>News</Link>
                {loading ? (
                    <div className="flex items-center space-x-3 animate-pulse">
                        <div className="w-9 h-9 bg-gray-300 rounded-full" />
                        <div className="w-20 h-4 bg-gray-300 rounded" />
                    </div>
                ) : user ? (
                    profile ? <UserProfile profile={profile} /> : null
                ) : (
                    <AuthButtons />
                )}
            </div>

            <MobileMenu profile={profile ?? undefined} />

        </nav>
    );
}