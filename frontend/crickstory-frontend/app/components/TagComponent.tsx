import Link from "next/link";
import styles from "../css/Home.module.css";

export default function TagComponent() {
    const tags = ["Cricket", "Football", "Basketball", "Tennis", "Hockey", "F1", "Badminton", "WWE", "Kabaddi", "Volleyball"];
    return (
        <>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={`${styles.title} shine-effect`}>Sports Community Hub</h1>
                    <p>Connect with sports lovers and professionals worldwide</p>
                </header>

                <div className={styles.maincontent}>
                    <div className={styles.tagssection}>
                        <h2 className={styles.sectiontitle}>Explore by Tags</h2>

                        {/* Tags scroller */}
                        <div className={styles.tagscontainer}>
                            <div className={styles.tagsscroll}>
                                {[...tags, ...tags].map((tag, index) => (
                                    <div className={styles.tag} key={index}>
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Online card */}
                        <div className={styles.discordcard}>
                            <div className={styles.onlinecount}>
                                <span className={styles.onlinedot}></span>
                                353 online
                            </div>
                            <h2>Join the Sports community!</h2>
                            <p>An open space for Sports lovers and professionals .</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className={styles.footer}>
                <p>© 2025 Cricket Community Hub. All rights reserved.</p>
                <Link href="/posts">
                    <button type="button" className="bg-amber-300 py-2 px-4 text-white rounded-md hover:bg-amber-500">
                        All Posts
                    </button>
                </Link>
            </footer>
        </>
    );
}