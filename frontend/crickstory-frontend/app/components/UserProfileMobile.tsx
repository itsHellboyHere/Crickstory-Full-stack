import Link from 'next/link';
import Image from 'next/image';
import styles from '../css/HomeNavbar.module.css';

type Profile = {
    username: string;
    name?: string;
    image?: string
}


export function UserProfileMobile({ profile, onClose }: { profile: Profile, onClose: () => void }) {
    return (
        <div className={styles.userProfileMobile}>
            <Link href={`/profile/${profile.username}`} className={styles.mobileProfileLink} onClick={onClose}>
                {profile.image && (
                    <div className='w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 mr-2'>
                        <Image
                            src={profile.image}
                            alt={profile.name || 'Profile'}
                            width={33}
                            height={33}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <span>My Profile</span>
            </Link>
        </div>
    );
}