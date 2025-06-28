import Link from "next/link";
import styles from "../css/Home.module.css";

export default function TagComponent() {

    return (
        <>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={`${styles.title} shine-effect`}>Cricket Community Hub</h1>
                    <p>Connect with cricket lovers and professionals worldwide</p>
                </header>

                <div className={styles.maincontent}>
                    <div className={styles.tagssection}>
                        <h2 className={styles.sectiontitle}>Browse by Tags</h2>

                        {/* Tags scroller */}
                        <div className={styles.tagscontainer}>
                            <div className={styles.tagsscroll}>
                                <span className={styles.tag}>Cricket</span>
                                <span className={styles.tag}>Posts</span>
                                <span className={styles.tag}>IPL</span>
                                <span className={styles.tag}>BBL</span>
                                <span className={styles.tag}>BGT</span>
                                <span className={styles.tag}>Asia Cup</span>
                                <span className={styles.tag}>India Team</span>
                                <span className={styles.tag}>Virat Kohli</span>
                                <span className={styles.tag}>MS Dhoni</span>
                                <span className={styles.tag}>Sachin </span>
                                <span className={styles.tag}>Rohit Sharma</span>
                                <span className={styles.tag}>World Cup</span>
                                {/* Duplicate for seamless loop */}
                                <span className={styles.tag}>Australia</span>
                                <span className={styles.tag}>CSK</span>
                                <span className={styles.tag}>RCB</span>
                                <span className={styles.tag}>Mumbai</span>
                                <span className={styles.tag}>SRH</span>
                                <span className={styles.tag}>KKR</span>
                                <span className={styles.tag}>LSG</span>
                                <span className={styles.tag}>Delhi</span>
                                <span className={styles.tag}>PBKS</span>
                                <span className={styles.tag}>Champions</span>
                                <span className={styles.tag}>GT</span>
                                <span className={styles.tag}>RR</span>
                            </div>
                        </div>

                        {/* Discord card */}
                        <div className={styles.discordcard}>
                            <div className={styles.onlinecount}>
                                <span className={styles.onlinedot}></span>
                                353 online
                            </div>
                            <h2>Join the Cricket community!</h2>
                            <p>An open space for Cricket lovers and professionals</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className={styles.footer}>
                <p>© 2025 Cricket Community Hub. All rights reserved.</p>
                <Link href="/posts">
                    <button type="button" className="bg-amber-300 py-4 px-4 text-white rounded-sm hover:bg-amber-500">
                        All Posts
                    </button>
                </Link>
            </footer>
        </>
    );
}