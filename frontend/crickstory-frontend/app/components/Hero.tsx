'use client'
import Link from 'next/link';
import styles from '../css/Hero.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';



const backgroundImages = [
    "https://res.cloudinary.com/dophafctu/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1745492039/virat-drive_tipale.jpg",
    "https://res.cloudinary.com/dophafctu/image/upload/v1745491983/bgt-test_kjv2ti.jpg",
    "https://res.cloudinary.com/dophafctu/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1745492059/team-blue_klx6gw.jpg",
    "https://res.cloudinary.com/dophafctu/image/upload/v1745491975/ben-stokes_qcxh3u.jpg",
    "https://res.cloudinary.com/dophafctu/image/upload/v1745492471/kl-stadium_jurse9.jpg"

];
export default function Hero() {
    const [currentBgIndex, setCurrentBgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);
    return (
        <section className={styles.hero}>
            {/* Background Image with Overlay */}
            <div className={styles.background}>
                {backgroundImages.map((src, index) => (
                    <Image
                        key={src}
                        src={src}
                        alt="Cricket background"
                        fill
                        priority={index === 0}
                        quality={100}
                        className={`${styles.backgroundImage} ${index === currentBgIndex ? styles.active : styles.inactive
                            }`}
                    />
                ))}
                <div className={styles.overlay}></div>
            </div>

            <div className={styles.content}>
                <h1 className={styles.title}>
                    <span className={styles.highlight}>Sportstory</span> Universe
                </h1>
                <p className={styles.subtitle}>
                    Where sport lives beyond the field. Share stories, spark rivalries, and celebrate the game you love.
                </p>

                {/* <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search players, matches, moments..." 
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>
            <Image 
              src="/icons/search.svg" 
              alt="Search"
              width={20}
              height={20}
            />
          </button>
        </div> */}

                <div className={styles.ctaButtons}>
                    <button className={`${styles.primaryButton} ${styles.buttonShine}`}>
                        Explore Archive
                    </button>
                    <Link href='/posts'>
                        <button className={styles.secondaryButton}>
                            Post Moments
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}