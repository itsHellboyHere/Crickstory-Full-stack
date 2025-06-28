import Link from 'next/link';
import Image from 'next/image';
import styles from '../css/HomeNavbar.module.css';



interface Profile {
    username: string;
    name?: string;
    image?: string;
}

export function UserProfile({ profile }: { profile: Profile }) {
    return (
        <div className={styles.userProfile}>
            <Link href={`/profile/${profile.username}`} className={styles.profileLink}>
                {profile.image && (
                    <div className='w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 mr-2'>
                        <Image
                            src={profile.image}
                            alt={profile.name || 'Profile'}
                            width={35}
                            height={35}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <span className={styles.username}>{profile.name?.split(' ')[0]}</span>
            </Link>
        </div>
    );
}