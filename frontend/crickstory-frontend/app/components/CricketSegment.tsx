'use client'
import styles from '../css/CricketSegment.module.css';

export default function CricketSegment() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.segment}>
                    <div className={styles.videoone}>
                        <div className={styles.videoContainer}>
                            <video autoPlay muted loop playsInline preload="auto" className={styles.video}>
                                <source src="https://res.cloudinary.com/dophafctu/video/upload/v1744656041/CrickStory/jbztcjc9rrzqlixjgcbg.mp4" type="video/mp4" />
                            </video>
                            <div className={styles.videoOverlay}>
                                <span className={styles.staticText}>Cricket </span>
                                <span className={styles.animatedText}>Highlights</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.videotwo}>
                        <div className={styles.videoContainer}>
                            <video autoPlay muted loop playsInline className={styles.video}>
                                <source src="https://res.cloudinary.com/dophafctu/video/upload/v1744655996/CrickStory/z3l0t1wcme796qjfuzca.mp4" type="video/mp4" />
                            </video>
                            <div className={styles.videoOverlay}>
                                <span className={styles.staticText}>Cricket </span>
                                <span className={styles.animatedText}>Legends</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}