import Link from 'next/link';
import styles from '../css/HomeNavbar.module.css';

export function AuthButtonsMobile({ onClose }: { onClose: () => void }) {
    return (
        <div className={styles.authButtonsMobile}>
            <Link href="/login" className={styles.mobileAuthButton} onClick={onClose}>Login</Link>
            <Link href="/signup" className={styles.mobileAuthButton} onClick={onClose}>Sign Up</Link>
        </div>
    );
}